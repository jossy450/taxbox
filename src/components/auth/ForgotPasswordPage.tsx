import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resetToken, setResetToken] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await requestPasswordReset(email);
    setLoading(false);
    if (!result.success) {
      setError(result.error ?? 'Request failed');
    } else if (result.token) {
      setResetToken(result.token);
      setSent(true);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-emerald-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">TaxBox NG</h1>
          <p className="text-blue-200 mt-2">Reset your password</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {sent ? (
            <div className="text-center space-y-4">
              <p className="text-4xl">📧</p>
              <h2 className="text-xl font-bold text-gray-900">Check Your Email</h2>
              <p className="text-sm text-gray-600">
                A password reset link has been sent to <strong>{email}</strong>.
                The link expires in 1 hour.
              </p>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left text-sm">
                <p className="font-medium text-amber-900 mb-2">Demo Mode — Reset Token</p>
                <p className="text-amber-800 text-xs mb-2">
                  Since email delivery is not configured in this demo, use the token below
                  to reset your password directly:
                </p>
                <p className="font-mono text-xs bg-white border border-amber-300 rounded px-3 py-2 break-all select-all">
                  {resetToken}
                </p>
                <a
                  href={`/reset-password?token=${resetToken}`}
                  className="mt-3 inline-block px-4 py-2 bg-amber-700 text-white text-sm rounded-lg hover:bg-amber-600"
                >
                  Click Here to Reset Now
                </a>
              </div>

              <Link to="/login" className="block text-sm text-blue-700 hover:text-blue-900">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password</h2>
              <p className="text-sm text-gray-500 mb-6">
                Enter the email address associated with your account and we'll send you a reset link.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" required value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-blue-900 text-white font-medium rounded-lg hover:bg-blue-800 disabled:opacity-50 transition-colors">
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              <div className="mt-6 text-center text-sm space-y-2">
                <Link to="/login" className="block text-blue-700 hover:text-blue-900">
                  ← Back to Sign In
                </Link>
                <Link to="/register" className="block text-gray-500 hover:text-gray-700">
                  Don't have an account? Register
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
