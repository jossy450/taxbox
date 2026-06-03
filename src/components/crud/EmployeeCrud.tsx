import { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import HelpBanner from '../ui/HelpBanner';
import FieldTooltip from '../ui/FieldTooltip';
import EmptyState from '../ui/EmptyState';
import WalkthroughGuide from '../ui/WalkthroughGuide';
import type { Employee } from '../../types/auth';
import * as XLSX from 'xlsx';

const WALKTHROUGH_STEPS = [
  { title: 'Employee Management', description: 'Manage your company\'s employee records — add, edit, import, and track staff for PAYE computation.', icon: '👥' },
  { title: 'Add Employees', description: 'Click "+ Add Employee" to manually enter a new employee, or use "Upload CSV/XLSX" to import in bulk.', icon: '➕' },
  { title: 'Download Template', description: 'Use the "Download Template" button to get a pre-formatted Excel file you can fill offline.', icon: '📥' },
  { title: 'Search & Filter', description: 'Use the search bar to quickly find employees by name, email, or department.', icon: '🔍' },
];

const EMPLOYEES_KEY = 'taxbox_employees';

const emptyEmployee = (companyId: string): Employee => ({
  id: crypto.randomUUID(),
  companyId,
  name: '',
  email: '',
  phone: '',
  department: '',
  jobRole: '',
  joinDate: new Date().toISOString().split('T')[0],
  basicSalary: 0,
  housing: 0,
  transport: 0,
  others: 0,
  status: 'active',
});

const TEMPLATE_HEADERS = ['Name', 'Email', 'Phone', 'Department', 'Job Role', 'Join Date', 'Basic Salary', 'Housing', 'Transport', 'Others', 'Status'];

export default function EmployeeCrud() {
  const { user } = useAuth();
  const companyId = user?.id ?? 'unknown';
  const [employees, setEmployees] = useLocalStorage<Employee[]>(EMPLOYEES_KEY, []);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Employee>(emptyEmployee(companyId));
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [importMsg, setImportMsg] = useState('');
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  function downloadTemplate() {
    const rows = [TEMPLATE_HEADERS, ['John Doe', 'john@company.com', '08012345678', 'Engineering', 'Software Engineer', '2026-01-15', '5000000', '200000', '150000', '100000', 'active']];
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = TEMPLATE_HEADERS.map(() => ({ wch: 20 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Employees');
    XLSX.writeFile(wb, 'employee_template.xlsx');
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportMsg('');
    setImportErrors([]);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json: Record<string, unknown>[] = XLSX.utils.sheet_to_json(ws);

        if (json.length === 0) {
          setImportMsg('File is empty — no employees to import.');
          return;
        }

        const errors: string[] = [];
        const imported: Employee[] = [];

        for (let i = 0; i < json.length; i++) {
          const row = json[i];
          const name = String(row['Name'] || '').trim();
          if (!name) { errors.push(`Row ${i + 2}: missing Name, skipped`); continue; }

          const rawStatus = String(row['Status'] || '').trim().toLowerCase();
          imported.push({
            id: crypto.randomUUID(),
            companyId,
            name,
            email: String(row['Email'] || '').trim(),
            phone: String(row['Phone'] || '').trim(),
            department: String(row['Department'] || '').trim(),
            jobRole: String(row['Job Role'] || '').trim(),
            joinDate: String(row['Join Date'] || new Date().toISOString().split('T')[0]).trim(),
            basicSalary: parseFloat(String(row['Basic Salary'] || '0')) || 0,
            housing: parseFloat(String(row['Housing'] || '0')) || 0,
            transport: parseFloat(String(row['Transport'] || '0')) || 0,
            others: parseFloat(String(row['Others'] || '0')) || 0,
            status: rawStatus === 'inactive' ? 'inactive' : 'active',
          });
        }

        if (imported.length > 0) {
          setEmployees(prev => [...prev, ...imported]);
        }
        setImportMsg(`Imported ${imported.length} employee(s).${errors.length > 0 ? ` ${errors.length} row(s) skipped.` : ''}`);
        setImportErrors(errors);
      } catch (err) {
        setImportMsg('Failed to parse file. Please use the CSV/XLSX template.');
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  }

  const filtered = employees.filter(e =>
    e.companyId === companyId && (
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      e.department.toLowerCase().includes(search.toLowerCase())
    )
  );

  function handleSave() {
    if (editing) {
      setEmployees(prev => prev.map(e => e.id === editing ? form : e));
    } else {
      setEmployees(prev => [...prev, { ...form, id: crypto.randomUUID() }]);
    }
    setShowForm(false);
    setEditing(null);
    setForm(emptyEmployee(companyId));
  }

  function handleEdit(id: string) {
    const emp = employees.find(e => e.id === id);
    if (emp) { setForm(emp); setEditing(id); setShowForm(true); }
  }

  function handleDelete(id: string) {
    if (confirm('Delete this employee record?')) {
      setEmployees(prev => prev.filter(e => e.id !== id));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
          <p className="text-sm text-gray-500 mt-1">{filtered.length} employee(s) on record</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={downloadTemplate}
            className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
            Download Template
          </button>
          <button onClick={() => fileRef.current?.click()}
            className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
            Upload CSV/XLSX
          </button>
          <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} className="hidden" />
          <button onClick={() => { setForm(emptyEmployee(companyId)); setEditing(null); setShowForm(true); }}
            className="px-4 py-2 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors">
            + Add Employee
          </button>
        </div>
      </div>

      <HelpBanner title="How to use Employee Management">
        <p>Add and manage your company's employee records. These are used for PAYE computation and tax record generation.</p>
        <ol className="list-decimal list-inside space-y-1">
          <li><strong>Add manually</strong> — Click "+ Add Employee" and fill in the details.</li>
          <li><strong>Bulk import</strong> — Download the template, fill it in, then upload via "Upload CSV/XLSX".</li>
          <li><strong>Search</strong> — Use the search bar to find employees by name, email, or department.</li>
        </ol>
      </HelpBanner>

      <WalkthroughGuide steps={WALKTHROUGH_STEPS} storageKey="walkthrough_employees" />

      {importMsg && (
        <div className={`px-4 py-3 rounded-lg text-sm ${importErrors.length === 0 ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-amber-50 border border-amber-200 text-amber-700'}`}>
          <p>{importMsg}</p>
          {importErrors.length > 0 && (
            <ul className="mt-1 list-disc list-inside text-xs text-red-600">
              {importErrors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          )}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{editing ? 'Edit Employee' : 'New Employee'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *<FieldTooltip text="Employee's full legal name as it appears on official records" /></label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department<FieldTooltip text="The department or division the employee belongs to" /></label>
              <input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Role</label>
              <input value={form.jobRole} onChange={e => setForm(f => ({ ...f, jobRole: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
              <input type="date" value={form.joinDate} onChange={e => setForm(f => ({ ...f, joinDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Basic Salary (₦)<FieldTooltip text="Annual basic salary before allowances. This is the main component of gross pay." /></label>
              <input type="number" value={form.basicSalary || ''} onChange={e => setForm(f => ({ ...f, basicSalary: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Housing (₦)<FieldTooltip text="Annual housing allowance paid to the employee" /></label>
              <input type="number" value={form.housing || ''} onChange={e => setForm(f => ({ ...f, housing: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transport (₦)<FieldTooltip text="Annual transport allowance paid to the employee" /></label>
              <input type="number" value={form.transport || ''} onChange={e => setForm(f => ({ ...f, transport: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Others (₦)<FieldTooltip text="Any other annual allowances not captured in Basic, Housing, or Transport" /></label>
              <input type="number" value={form.others || ''} onChange={e => setForm(f => ({ ...f, others: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSave}
              className="px-6 py-2 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800">
              {editing ? 'Update' : 'Save'} Employee
            </button>
            <button onClick={() => { setShowForm(false); setEditing(null); }}
              className="px-6 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <input
            placeholder="Search employees by name, email, or department..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Email</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Dept</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Role</th>
                <th className="text-right px-4 py-2.5 font-medium text-gray-600">Basic</th>
                <th className="text-right px-4 py-2.5 font-medium text-gray-600">Others</th>
                <th className="text-center px-4 py-2.5 font-medium text-gray-600">Status</th>
                <th className="text-right px-4 py-2.5 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-4">
                  <EmptyState
                    icon="👥"
                    title="No employees yet"
                    description="Add your first employee manually or import via CSV/XLSX to start building your payroll."
                    action={{ label: '+ Add Employee', onClick: () => { setForm(emptyEmployee(companyId)); setEditing(null); setShowForm(true); } }}
                  />
                </td></tr>
              ) : (
                filtered.map(emp => (
                  <tr key={emp.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 font-medium text-gray-900">{emp.name}</td>
                    <td className="px-4 py-2.5 text-gray-600">{emp.email}</td>
                    <td className="px-4 py-2.5 text-gray-600">{emp.department}</td>
                    <td className="px-4 py-2.5 text-gray-600">{emp.jobRole}</td>
                    <td className="px-4 py-2.5 text-right">₦{emp.basicSalary.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-right">₦{emp.others.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        emp.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                      }`}>{emp.status}</span>
                    </td>
                    <td className="px-4 py-2.5 text-right space-x-2">
                      <button onClick={() => handleEdit(emp.id)} className="text-blue-700 hover:text-blue-900 text-xs font-medium">Edit</button>
                      <button onClick={() => handleDelete(emp.id)} className="text-red-600 hover:text-red-800 text-xs font-medium">Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
