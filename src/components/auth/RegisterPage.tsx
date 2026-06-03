import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types/auth';

const ROLES: { value: UserRole; label: string; desc: string }[] = [
  { value: 'individual', label: 'Individual Taxpayer', desc: 'Calculate your personal PAYE' },
  { value: 'corporate', label: 'Corporate HR', desc: 'Manage company payroll' },
  { value: 'consultant', label: 'Tax Consultant', desc: 'Audit & optimisation tools' },
  { value: 'admin', label: 'Administrator', desc: 'Full system access' },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('individual');
  const [company, setCompany] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await register({ name, email, password, role, company: company || undefined });
    if (result.success) {
      navigate('/app/dashboard');
      return;
    }
    setLoading(false);
    setError(result.error ?? 'Registration failed');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-emerald-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">TaxBox NG</h1>
          <p className="text-blue-200 mt-2">Create your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Register</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" required value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" required value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" required minLength={6} value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map(r => (
                  <button type="button" key={r.value}
                    onClick={() => setRole(r.value)}
                    className={`text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                      role === r.value
                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}>
                    <span className="font-medium block">{r.label}</span>
                    <span className="text-xs text-gray-400">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>
            {role !== 'individual' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company / Firm Name</label>
                <input type="text" value={company}
                  onChange={e => setCompany(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              </div>
            )}
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-blue-900 text-white font-medium rounded-lg hover:bg-blue-800 disabled:opacity-50 transition-colors">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-700 font-medium hover:text-blue-900">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
