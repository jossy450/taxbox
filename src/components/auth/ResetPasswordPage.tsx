import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Missing reset token. Please request a new password reset.');
    }
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    const result = await resetPassword(token, password);
    setLoading(false);
    if (!result.success) {
      setError(result.error ?? 'Reset failed');
    } else {
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-emerald-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">TaxBox NG</h1>
          <p className="text-blue-200 mt-2">Create a new password</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {success ? (
            <div className="text-center space-y-4">
              <p className="text-4xl">✅</p>
              <h2 className="text-xl font-bold text-gray-900">Password Reset Successful</h2>
              <p className="text-sm text-gray-600">
                Your password has been updated. Redirecting you to sign in...
              </p>
              <Link to="/login" className="inline-block text-sm text-blue-700 hover:text-blue-900">
                Sign In Now
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h2>
              <p className="text-sm text-gray-500 mb-6">
                Enter your new password below.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input type="password" required minLength={6} value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <input type="password" required minLength={6} value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <button type="submit" disabled={loading || !token}
                  className="w-full py-3 bg-blue-900 text-white font-medium rounded-lg hover:bg-blue-800 disabled:opacity-50 transition-colors">
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>

              <div className="mt-6 text-center text-sm">
                <Link to="/login" className="text-blue-700 hover:text-blue-900">
                  ← Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 text-center text-xs text-blue-200 space-x-4">
          <Link to="/disclaimer" className="hover:text-white transition-colors">Disclaimer</Link>
          <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link to="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link>
        </div>
      </div>
    </div>
  );
}
