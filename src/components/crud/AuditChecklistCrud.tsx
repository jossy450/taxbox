import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import HelpBanner from '../ui/HelpBanner';
import WalkthroughGuide from '../ui/WalkthroughGuide';
import * as XLSX from 'xlsx';
import type { AuditChecklistItem } from '../../types/auth';

const WALKTHROUGH_STEPS = [
  { title: 'Audit Checklist', description: 'This module helps you track which statutory tax audit documents are available, not available, or not applicable for your company.', icon: '✅' },
  { title: 'Categories', description: 'Documents are grouped into categories: General Info, PAYE, Directors, Expatriate, and Withholding Tax. Click a tab to switch.', icon: '📂' },
  { title: 'Mark Status', description: 'For each item, click "Available", "N/Available", or "N/A" to mark its status. Green means available, red means missing.', icon: '🎯' },
  { title: 'Remarks', description: 'Add optional remarks or notes for each checklist item (e.g., where the document is stored or any issues).', icon: '✏️' },
];

const STORAGE_KEY = 'taxbox_auditchecklist';

const DEFAULT_ITEMS: { category: AuditChecklistItem['category']; items: string[] }[] = [
  {
    category: 'general',
    items: [
      'Certificate of Incorporation',
      'CAC Form 2 & 7',
      'Audited Financial Statement',
      'Management Account',
      'Trial Balance/General Ledger',
      'Evidence of Business Premises Paid',
      'List of Branches in Nigeria',
      'List of Location/Offices in Lagos',
      'Evidence of Previous Year Audit',
    ],
  },
  {
    category: 'paye',
    items: [
      'Staff Monthly Payroll',
      'Schedule Upfront/Quarterly Payments',
      'Schedule Non-payroll payments to Staff',
      'Schedule of Benefits-in-kind to staff',
      'Staff Salary Schedule to Bank',
      'Employer Annual Declaration Form (H1)',
      'Sample of Employment Letters',
      'Scheme of Pension Remittance',
      'Evidence of PAYE Remittance',
      'Evidence of Development Levy Paid',
    ],
  },
  {
    category: 'directors',
    items: [
      'Directors Emolument/Senior Management Staff Payroll',
      'Direct/Self Assessment',
      'Contract of Employment/Contract Agreement',
      'Schedule of Benefits-in-kind (Perquisites)',
      'Scheme of Pension Remittance',
      'Evidence of PAYE Remittance',
      'Evidence of Development Levy Paid',
      'Evidence of Life Assurance Policy',
      'Evidence of Gratuities',
      'Evidence of NHIS',
      'Evidence of NHF',
    ],
  },
  {
    category: 'expatriate',
    items: [
      'Expatriate Payroll',
      "Expatriate Contract/Terms of Employment",
      "Employers' Annual Declaration Form Filed For Expatriates",
      "Company's Expatriate Quota Grant/Permit",
      'Monthly Expatriate Returns to Immigration',
      'Registration/Renewal of CERPAC',
      'Schedule of Benefits-in-kind',
      'Rent Agreement for Expatriate Residence',
      'Evidence of Salary Paid in Nigeria and Abroad',
      'Scheme of Pension Remittance',
      'Evidence of PAYE Remittance',
      'Evidence of Development Levy Paid',
    ],
  },
  {
    category: 'wht',
    items: [
      'List of Vendors/Suppliers',
      'Schedule of WHT payment to Vendors/Suppliers',
      'Schedule of Dividend Paid to Shareholders',
      'Schedule of Interest Paid to Customers/Depositors',
      'Schedule of Commission Paid to Agents/Marketers',
      'Copy of Office Rent Agreements',
      'Evidence of WHT remittance',
    ],
  },
];

const CATEGORY_LABELS: Record<AuditChecklistItem['category'], string> = {
  general: 'General Information',
  paye: 'PAYE',
  directors: 'Directors & Senior Management',
  expatriate: 'Expatriate',
  wht: 'Withholding Tax',
};

const CATEGORY_ICONS: Record<AuditChecklistItem['category'], string> = {
  general: '📋',
  paye: '💰',
  directors: '👔',
  expatriate: '🌍',
  wht: '🧾',
};

const emptyRecord = (companyId: string, year: number, category: AuditChecklistItem['category'], item: string): AuditChecklistItem => ({
  id: crypto.randomUUID(),
  companyId,
  year,
  category,
  item,
  status: 'not_available',
  remarks: '',
});

export default function AuditChecklistCrud() {
  const { user } = useAuth();
  const companyId = user?.id ?? 'unknown';
  const [records, setRecords] = useLocalStorage<AuditChecklistItem[]>(STORAGE_KEY, []);
  const [filterYear, setFilterYear] = useState(2023);
  const [activeCategory, setActiveCategory] = useState<AuditChecklistItem['category']>('general');
  const printRef = useRef<HTMLDivElement>(null);

  const yearRecords = records.filter(r => r.companyId === companyId && r.year === filterYear);

  function ensureItem(category: AuditChecklistItem['category'], item: string) {
    const exists = yearRecords.some(r => r.category === category && r.item === item);
    if (!exists) {
      setRecords(prev => [...prev, emptyRecord(companyId, filterYear, category, item)]);
    }
  }

  function getStatus(category: AuditChecklistItem['category'], item: string): AuditChecklistItem['status'] {
    return yearRecords.find(r => r.category === category && r.item === item)?.status ?? 'not_available';
  }

  function getRemarks(category: AuditChecklistItem['category'], item: string): string {
    return yearRecords.find(r => r.category === category && r.item === item)?.remarks ?? '';
  }

  function setRecordStatus(category: AuditChecklistItem['category'], item: string, status: AuditChecklistItem['status']) {
    const existing = yearRecords.find(r => r.category === category && r.item === item);
    if (existing) {
      setRecords(prev => prev.map(r => r.id === existing.id ? { ...r, status } : r));
    } else {
      setRecords(prev => [...prev, { ...emptyRecord(companyId, filterYear, category, item), status }]);
    }
  }

  function setRecordRemarks(category: AuditChecklistItem['category'], item: string, remarks: string) {
    const existing = yearRecords.find(r => r.category === category && r.item === item);
    if (existing) {
      setRecords(prev => prev.map(r => r.id === existing.id ? { ...r, remarks } : r));
    } else {
      setRecords(prev => [...prev, { ...emptyRecord(companyId, filterYear, category, item), remarks }]);
    }
  }

  const categoryItems = DEFAULT_ITEMS.find(d => d.category === activeCategory);
  const totalYearItems = DEFAULT_ITEMS.flatMap(d => d.items);
  const availableCount = totalYearItems.filter(it => {
    const cat = DEFAULT_ITEMS.find(d => d.items.includes(it))?.category;
    return cat && getStatus(cat, it) === 'available';
  }).length;

  function statusLabel(st: AuditChecklistItem['status']): string {
    return st === 'available' ? 'Available' : st === 'not_available' ? 'Not Available' : 'N/A';
  }

  function handlePrint() {
    window.print();
  }

  function handleDownloadCsv() {
    const rows = [['Category', 'Checklist Item', 'Status', 'Remarks']];
    for (const group of DEFAULT_ITEMS) {
      for (const item of group.items) {
        rows.push([CATEGORY_LABELS[group.category], item, statusLabel(getStatus(group.category, item)), getRemarks(group.category, item)]);
      }
    }
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 25 }, { wch: 50 }, { wch: 15 }, { wch: 40 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'AuditChecklist');
    XLSX.writeFile(wb, `audit_checklist_${filterYear}.xlsx`);
  }

  return (
    <div className="space-y-6">
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
        }
        .print-only { display: none; }
      `}</style>

      <div className="flex items-center justify-between flex-wrap gap-3 no-print">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Checklist</h1>
          <p className="text-sm text-gray-500 mt-1">Statutory tax audit basic information checklist — {filterYear}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm bg-blue-50 px-3 py-1.5 rounded-lg">
            <span className="font-semibold text-blue-800">{availableCount}/{totalYearItems.length}</span>
            <span className="text-blue-600"> items available</span>
          </div>
          <select value={filterYear} onChange={e => setFilterYear(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
            {[2026, 2025, 2024, 2023, 2022, 2021].map(y => <option key={y}>{y}</option>)}
          </select>
          <button onClick={handlePrint}
            className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50">
            🖨️ Print / PDF
          </button>
          <button onClick={handleDownloadCsv}
            className="px-4 py-2 bg-emerald-700 text-white text-sm font-medium rounded-lg hover:bg-emerald-600">
            ⬇ Download CSV
          </button>
        </div>
      </div>

      <HelpBanner title="How to use the Audit Checklist">
        <p>This checklist mirrors the Lagos State IRS statutory tax audit requirements. Mark each document as available, not available, or N/A.</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Select the <strong>audit year</strong> you are preparing for.</li>
          <li>Click a <strong>category tab</strong> (General, PAYE, Directors, Expatriate, WHT) to view relevant documents.</li>
          <li>For each item, click <strong>Available</strong> (✓), <strong>N/Available</strong> (✗), or <strong>N/A</strong> (not applicable).</li>
          <li>Use the <strong>Remarks</strong> field to note where the document is stored or any comments.</li>
        </ol>
      </HelpBanner>

      <WalkthroughGuide steps={WALKTHROUGH_STEPS} storageKey="walkthrough_auditchecklist" />

      <div className="no-print">
        <div className="flex gap-2 overflow-x-auto pb-2">
        {DEFAULT_ITEMS.map(d => {
          const catCount = d.items.filter(it => getStatus(d.category, it) === 'available').length;
          return (
            <button key={d.category}
              onClick={() => setActiveCategory(d.category)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === d.category
                  ? 'bg-blue-900 text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}>
              <span>{CATEGORY_ICONS[d.category]}</span>
              <span>{CATEGORY_LABELS[d.category]}</span>
              <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${
                activeCategory === d.category ? 'bg-blue-700' : 'bg-gray-100'
              }`}>{catCount}/{d.items.length}</span>
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">{CATEGORY_ICONS[activeCategory]} {CATEGORY_LABELS[activeCategory]}</h3>
          <button
            onClick={() => categoryItems?.items.forEach(it => ensureItem(activeCategory, it))}
            className="text-xs text-blue-700 hover:text-blue-900 font-medium">
            Initialise All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600 w-8">#</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Checklist Item</th>
                <th className="text-center px-4 py-2.5 font-medium text-gray-600 w-40">Status</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categoryItems?.items.map((item, i) => (
                <tr key={item} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 text-gray-400">{i + 1}</td>
                  <td className="px-4 py-2.5 text-gray-900">{item}</td>
                  <td className="px-4 py-2.5 text-center">
                    <div className="flex gap-1 justify-center">
                      {(['available', 'not_available', 'na'] as const).map(st => (
                        <button key={st}
                          onClick={() => setRecordStatus(activeCategory, item, st)}
                          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                            getStatus(activeCategory, item) === st
                              ? st === 'available' ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-300'
                                : st === 'not_available' ? 'bg-red-100 text-red-700 ring-1 ring-red-300'
                                : 'bg-gray-200 text-gray-600 ring-1 ring-gray-300'
                              : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                          }`}>
                          {st === 'available' ? '✓ Available' : st === 'not_available' ? '✗ N/Available' : '— N/A'}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <input value={getRemarks(activeCategory, item)}
                      onChange={e => setRecordRemarks(activeCategory, item, e.target.value)}
                      placeholder="e.g. Stored in filing cabinet #3, or missing — follow up with HR..."
                      className="w-full px-2 py-1 border border-gray-200 rounded text-sm"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </div>

      <div className="print-only" ref={printRef}>
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Statutory Tax Audit Checklist</h2>
          <p className="text-sm text-gray-500 mb-4">Year: {filterYear} | Printed: {new Date().toLocaleDateString()}</p>
          <table className="w-full text-sm border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">Category</th>
                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">#</th>
                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">Checklist Item</th>
                <th className="border border-gray-300 px-3 py-2 text-center text-xs font-semibold text-gray-700">Status</th>
                <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {DEFAULT_ITEMS.map(group => (
                <React.Fragment key={group.category}>
                  {group.items.map((item, i) => {
                    const st = getStatus(group.category, item);
                    return (
                      <tr key={`${group.category}-${i}`} className="even:bg-gray-50">
                        {i === 0 && (
                          <td className="border border-gray-300 px-3 py-2 font-medium text-gray-700 text-xs" rowSpan={group.items.length}>
                            {CATEGORY_LABELS[group.category]}
                          </td>
                        )}
                        <td className="border border-gray-300 px-3 py-2 text-center text-xs text-gray-400">{i + 1}</td>
                        <td className="border border-gray-300 px-3 py-2 text-xs text-gray-900">{item}</td>
                        <td className="border border-gray-300 px-3 py-2 text-center text-xs">
                          <span className={`font-medium ${
                            st === 'available' ? 'text-emerald-700' :
                            st === 'not_available' ? 'text-red-700' : 'text-gray-500'
                          }`}>{statusLabel(st)}</span>
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-xs text-gray-600">{getRemarks(group.category, item) || '—'}</td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-gray-400 mt-4">Generated by TaxBox NG — Lagos PAYE 2026</p>
        </div>
      </div>
    </div>
  );
}
