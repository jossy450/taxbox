import { useState } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface FeedbackEntry {
  id: string;
  name: string;
  email: string;
  role: string;
  category: string;
  rating: number;
  message: string;
  createdAt: string;
}

const FEEDBACK_KEY = 'taxbox_feedback';
const CATEGORIES = ['Bug Report', 'Feature Request', 'Calculation Issue', 'UX Suggestion', 'General Feedback', 'Other'];

export default function FeedbackPage() {
  const [feedback, setFeedback] = useLocalStorage<FeedbackEntry[]>(FEEDBACK_KEY, []);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const entry: FeedbackEntry = {
      id: crypto.randomUUID(),
      name,
      email,
      role,
      category,
      rating,
      message,
      createdAt: new Date().toISOString(),
    };
    setFeedback(prev => [...prev, entry]);
    setSubmitted(true);
  }

  function resetForm() {
    setName('');
    setEmail('');
    setRole('');
    setCategory(CATEGORIES[0]);
    setRating(0);
    setMessage('');
    setSubmitted(false);
  }

  function exportCSV() {
    if (feedback.length === 0) return;
    const headers = ['ID', 'Name', 'Email', 'Role', 'Category', 'Rating', 'Message', 'Submitted At'];
    const rows = feedback.map(f => [
      f.id,
      `"${f.name.replace(/"/g, '""')}"`,
      `"${f.email.replace(/"/g, '""')}"`,
      `"${f.role.replace(/"/g, '""')}"`,
      `"${f.category.replace(/"/g, '""')}"`,
      f.rating,
      `"${f.message.replace(/"/g, '""')}"`,
      f.createdAt,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taxbox_feedback_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Send Feedback</h1>
        <p className="text-sm text-gray-500 mb-6">
          Help us improve TaxBox NG. Your feedback is stored and used for continuous product development.
        </p>

        {submitted ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-8 text-center">
            <p className="text-4xl mb-3">🙏</p>
            <h2 className="text-xl font-semibold text-emerald-900 mb-2">Thank You!</h2>
            <p className="text-emerald-700 text-sm mb-6">
              Your feedback has been recorded and will be reviewed by our team.
              We use every submission to improve the Tool.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={resetForm}
                className="px-5 py-2 bg-blue-900 text-white text-sm rounded-lg hover:bg-blue-800">
                Submit Another
              </button>
              {feedback.length > 0 && (
                <button onClick={exportCSV}
                  className="px-5 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50">
                  Download All Feedback (CSV)
                </button>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select value={role} onChange={e => setRole(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="">Select your role</option>
                  <option value="individual">Individual Taxpayer</option>
                  <option value="corporate">Corporate HR / Payroll</option>
                  <option value="consultant">Tax Consultant</option>
                  <option value="admin">Administrator</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select required value={category} onChange={e => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating *</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} type="button"
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHoverRating(n)}
                    onMouseLeave={() => setHoverRating(0)}
                    className={`text-2xl transition-colors ${
                      n <= (hoverRating || rating) ? 'text-amber-400' : 'text-gray-300'
                    } hover:scale-110`}>
                    ★
                  </button>
                ))}
                <span className="text-sm text-gray-400 ml-2 self-center">
                  {rating > 0 ? ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating] : 'Click to rate'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Message *</label>
              <textarea required rows={5} value={message} onChange={e => setMessage(e.target.value)}
                placeholder="Tell us what you think... What works well? What could be improved?"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 resize-y" />
            </div>

            <div className="flex items-start gap-3">
              <button type="submit"
                className="px-6 py-2.5 bg-blue-900 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors">
                Submit Feedback
              </button>
              <button type="button" onClick={exportCSV}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm transition-colors">
                Download Stored Feedback (CSV)
              </button>
            </div>
            <p className="text-xs text-gray-400">
              {feedback.length} feedback entry/entries stored locally.
              {feedback.length > 0 && ' Download CSV to share with the development team.'}
            </p>
          </form>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Feedback Summary</h2>
        {feedback.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No feedback submitted yet. Be the first!</p>
        ) : (
          <div className="space-y-3">
            {[...feedback].reverse().slice(0, 5).map(f => (
              <div key={f.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="text-lg">{'★'.repeat(f.rating)}{'☆'.repeat(5 - f.rating)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{f.name}</p>
                  <p className="text-xs text-gray-500">
                    {f.category} &middot; {new Date(f.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-700 mt-1 line-clamp-2">{f.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
