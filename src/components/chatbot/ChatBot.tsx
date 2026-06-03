import { useState, useRef, useEffect } from 'react';
import { getToken, apiChatAsk } from '../../api';

interface Message {
  role: 'user' | 'bot';
  text: string;
}

function getStoredContact() {
  try {
    const raw = localStorage.getItem('taxbox_chat_contact');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function getStoredUser() {
  try {
    const raw = localStorage.getItem('taxbox_api_session');
    if (!raw) return null;
    return JSON.parse(raw)?.user || null;
  } catch { return null; }
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: 'Hi! Ask me anything about TaxBox NG, PAYE, or Lagos tax calculations.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const storedUser = getStoredUser();
  const token = getToken();
  const [contact, setContact] = useState<{ name: string; email: string; phone: string }>(() => getStoredContact() || { name: storedUser?.name || '', email: storedUser?.email || '', phone: '' });
  const [showContactForm, setShowContactForm] = useState(!token && !getStoredContact());

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  function saveContact(name: string, email: string, phone: string) {
    const data = { name, email, phone };
    localStorage.setItem('taxbox_chat_contact', JSON.stringify(data));
    setContact(data);
    setShowContactForm(false);
    setMessages(prev => [...prev, { role: 'bot', text: `Thanks ${name}! You can now ask your question.` }]);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const q = input.trim();
    if (!q || loading) return;

    setMessages(prev => [...prev, { role: 'user', text: q }]);
    setInput('');
    setLoading(true);

    if (!token) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Please provide your name and contact details first.' }]);
      setShowContactForm(true);
      setLoading(false);
      return;
    }

    try {
      const data = await apiChatAsk(q, token, {
        name: contact.name || storedUser?.name,
        email: contact.email || storedUser?.email,
        phone: contact.phone,
      });
      setMessages(prev => [...prev, { role: 'bot', text: data.answer }]);
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-20 right-4 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden" style={{ maxHeight: 'calc(100vh - 120px)' }}>
          <div className="flex items-center justify-between px-4 py-3 bg-blue-900 text-white">
            <div className="flex items-center gap-2">
              <span className="text-lg">🤖</span>
              <span className="font-semibold text-sm">TaxBox Assistant</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white text-lg leading-none">&times;</button>
          </div>

          <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: 0 }}>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-blue-900 text-white rounded-br-md'
                    : 'bg-gray-100 text-gray-800 rounded-bl-md'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-500 rounded-xl rounded-bl-md px-3 py-2 text-sm italic">
                  Typing<span className="animate-pulse">...</span>
                </div>
              </div>
            )}
          </div>

          {showContactForm ? (
            <form onSubmit={e => { e.preventDefault(); const fd = new FormData(e.target as HTMLFormElement); saveContact(String(fd.get('name') || ''), String(fd.get('email') || ''), String(fd.get('phone') || '')); }} className="border-t border-gray-200 p-3 space-y-2">
              <input name="name" placeholder="Your name *" required defaultValue={contact.name}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              <input name="email" type="email" placeholder="Your email *" required defaultValue={contact.email}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              <input name="phone" placeholder="Your phone" defaultValue={contact.phone}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
              <button type="submit"
                className="w-full py-2 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors">
                Start Chatting
              </button>
            </form>
          ) : (
            <form onSubmit={handleSend} className="border-t border-gray-200 p-3 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask a question..."
                disabled={loading}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
              />
              <button type="submit" disabled={loading || !input.trim()}
                className="px-4 py-2 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800 disabled:opacity-50 transition-colors">
                Send
              </button>
            </form>
          )}
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-4 right-4 z-50 w-14 h-14 bg-blue-900 text-white rounded-full shadow-xl hover:bg-blue-800 transition-colors flex items-center justify-center text-2xl"
      >
        {open ? '\u2715' : '\uD83D\uDCAC'}
      </button>
    </>
  );
}
