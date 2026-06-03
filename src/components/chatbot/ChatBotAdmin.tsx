import { useState, useEffect } from 'react';
import { getToken, apiGetFaqs, apiCreateFaq, apiUpdateFaq, apiDeleteFaq, apiGetChatLogs, apiUpdateChatLog, apiSeedFaqs } from '../../api';
import { defaultFaq } from '../../data/faq';

interface FaqItem { id: string; question: string; answer: string; category: string; }
interface LogItem { id: string; question: string; answer: string | null; contact_name: string | null; contact_email: string | null; contact_phone: string | null; status: string; created_at: string; }

export default function ChatBotAdmin() {
  const [tab, setTab] = useState<'faq' | 'logs'>('faq');
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<FaqItem | null>(null);
  const [form, setForm] = useState({ question: '', answer: '', category: 'general' });
  const [msg, setMsg] = useState('');

  const token = getToken();

  useEffect(() => {
    if (tab === 'faq') loadFaqs();
    else loadLogs();
  }, [tab]);

  async function loadFaqs() {
    setLoading(true);
    try {
      const data = await apiGetFaqs(token!);
      if (data.faqs.length === 0) {
        await apiSeedFaqs(defaultFaq, token!);
        const refetched = await apiGetFaqs(token!);
        setFaqs(refetched.faqs);
      } else {
        setFaqs(data.faqs);
      }
    } catch (e) { setMsg('Failed to load FAQs'); }
    setLoading(false);
  }

  async function loadLogs() {
    setLoading(true);
    try {
      const data = await apiGetChatLogs(token!);
      setLogs(data.logs);
    } catch (e) { setMsg('Failed to load logs'); }
    setLoading(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editing) {
        await apiUpdateFaq(editing.id, form, token!);
      } else {
        await apiCreateFaq(form, token!);
      }
      setEditing(null);
      setForm({ question: '', answer: '', category: 'general' });
      setMsg('FAQ saved');
      loadFaqs();
    } catch { setMsg('Failed to save FAQ'); }
  }

  function handleEdit(faq: FaqItem) {
    setEditing(faq);
    setForm({ question: faq.question, answer: faq.answer, category: faq.category });
  }

  async function handleDelete(id: string) {
    try {
      await apiDeleteFaq(id, token!);
      setMsg('FAQ deleted');
      loadFaqs();
    } catch { setMsg('Failed to delete FAQ'); }
  }

  function handleCancel() {
    setEditing(null);
    setForm({ question: '', answer: '', category: 'general' });
  }

  async function handleResolveLog(id: string) {
    try {
      await apiUpdateChatLog(id, { status: 'answered' }, token!);
      loadLogs();
    } catch { setMsg('Failed to update log'); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Chatbot Management</h1>
        <a
          href="/api/chatbot/logs/export"
          download
          className="px-4 py-2 bg-emerald-700 text-white text-sm font-medium rounded-lg hover:bg-emerald-600 transition-colors"
          onClick={e => { e.preventDefault(); window.open('/api/chatbot/logs/export', '_blank'); }}
        >
          Export Unanswered (CSV)
        </a>
      </div>

      {msg && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg text-sm mb-4">{msg}</div>
      )}

      <div className="flex gap-1 mb-6">
        <button onClick={() => setTab('faq')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${tab === 'faq' ? 'bg-blue-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>FAQ Entries</button>
        <button onClick={() => setTab('logs')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${tab === 'logs' ? 'bg-blue-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
          Unanswered Questions
          {logs.filter(l => l.status === 'unanswered').length > 0 && (
            <span className="ml-2 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">{logs.filter(l => l.status === 'unanswered').length}</span>
          )}
        </button>
      </div>

      {tab === 'faq' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : faqs.length === 0 ? (
              <p className="text-gray-500">No FAQ entries yet. Add one using the form.</p>
            ) : (
              faqs.map(faq => (
                <div key={faq.id} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <span className="inline-block px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded mb-1 capitalize">{faq.category}</span>
                      <p className="font-medium text-gray-900 text-sm">{faq.question}</p>
                      <p className="text-gray-600 text-sm mt-1">{faq.answer}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => handleEdit(faq)} className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100">Edit</button>
                      <button onClick={() => handleDelete(faq.id)} className="px-3 py-1 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100">Delete</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-6">
              <h3 className="font-semibold text-gray-900 mb-4">{editing ? 'Edit FAQ' : 'Add FAQ'}</h3>
              <form onSubmit={handleSave} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                  <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="general">General</option>
                    <option value="tax">Tax</option>
                    <option value="calculator">Calculator</option>
                    <option value="account">Account</option>
                    <option value="subscription">Subscription</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Question</label>
                  <input type="text" required value={form.question} onChange={e => setForm(p => ({ ...p, question: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Answer</label>
                  <textarea required rows={4} value={form.answer} onChange={e => setForm(p => ({ ...p, answer: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none" />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 py-2 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors">
                    {editing ? 'Update' : 'Add'}
                  </button>
                  {editing && (
                    <button type="button" onClick={handleCancel} className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {tab === 'logs' && (
        <div>
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : logs.length === 0 ? (
            <p className="text-gray-500">No unanswered questions yet.</p>
          ) : (
            <div className="space-y-3">
              {logs.map(log => (
                <div key={log.id} className={`bg-white rounded-xl border p-4 ${log.status === 'unanswered' ? 'border-amber-200' : 'border-gray-200'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${log.status === 'unanswered' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                          {log.status}
                        </span>
                        <span className="text-xs text-gray-400">{new Date(log.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-gray-900 font-medium text-sm">{log.question}</p>
                      {(log.contact_name || log.contact_email || log.contact_phone) && (
                        <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500">
                          {log.contact_name && <span>Name: {log.contact_name}</span>}
                          {log.contact_email && <span>Email: {log.contact_email}</span>}
                          {log.contact_phone && <span>Phone: {log.contact_phone}</span>}
                        </div>
                      )}
                      {log.answer && <p className="text-gray-600 text-sm mt-1">Answer: {log.answer}</p>}
                    </div>
                    {log.status === 'unanswered' && (
                      <button onClick={() => handleResolveLog(log.id)} className="px-3 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 shrink-0">Mark Answered</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
