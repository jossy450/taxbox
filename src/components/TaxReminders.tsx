import { useState, useEffect, useCallback } from 'react'

interface ReminderPref {
  taxType: string
  daysBefore: number
  enabled: boolean
}

interface ReminderSettings {
  email: string
  phone: string
  name: string
  preferences: ReminderPref[]
  dailyCheck: boolean
}

interface Deadline {
  id: string
  title: string
  taxType: string
  date: string
  recurring: 'monthly' | 'yearly' | 'quarterly'
  description: string
}

const DEADLINES: Deadline[] = [
  { id: 'paye-monthly', title: 'PAYE Monthly Remittance Due', taxType: 'PAYE', date: '2026-01-10', recurring: 'monthly', description: 'Remit PAYE deducted for the previous month. Late payment attracts 10% penalty + interest.' },
  { id: 'paye-h1', title: 'PAYE H1 Annual Declaration', taxType: 'PAYE', date: '2026-01-31', recurring: 'yearly', description: 'File Employer Annual Declaration Form (H1) for the previous year.' },
  { id: 'direct-first', title: 'Direct Assessment — First Instalment Due', taxType: 'Direct Assessment', date: '2026-03-31', recurring: 'yearly', description: 'First instalment of Direct Assessment tax due.' },
  { id: 'direct-second', title: 'Direct Assessment — Second Instalment Due', taxType: 'Direct Assessment', date: '2026-06-30', recurring: 'yearly', description: 'Second and final instalment of Direct Assessment tax due.' },
  { id: 'dev-levy', title: 'Development Levy Due', taxType: 'Development Levy', date: '2026-06-30', recurring: 'yearly', description: 'Annual Development Levy payment due.' },
  { id: 'biz-premises', title: 'Business Premises Renewal Due', taxType: 'Business Premises', date: '2026-12-31', recurring: 'yearly', description: 'Annual Business Premises renewal.' },
  { id: 'wht-quarterly-q1', title: 'WHT Quarterly Schedule Due — Q1', taxType: 'WHT', date: '2026-04-30', recurring: 'yearly', description: 'File Q1 Withholding Tax schedule.' },
  { id: 'wht-quarterly-q2', title: 'WHT Quarterly Schedule Due — Q2', taxType: 'WHT', date: '2026-07-31', recurring: 'yearly', description: 'File Q2 Withholding Tax schedule.' },
  { id: 'wht-quarterly-q3', title: 'WHT Quarterly Schedule Due — Q3', taxType: 'WHT', date: '2026-10-31', recurring: 'yearly', description: 'File Q3 Withholding Tax schedule.' },
  { id: 'wht-quarterly-q4', title: 'WHT Quarterly Schedule Due — Q4', taxType: 'WHT', date: '2027-01-31', recurring: 'yearly', description: 'File Q4 Withholding Tax schedule.' },
];

const STORAGE_KEY = 'taxbox_reminder_settings';
const HISTORY_KEY = 'taxbox_reminder_history';

const DEFAULT_PREFS: ReminderPref[] = [
  { taxType: 'PAYE', daysBefore: 5, enabled: true },
  { taxType: 'Direct Assessment', daysBefore: 7, enabled: true },
  { taxType: 'WHT', daysBefore: 5, enabled: true },
  { taxType: 'Development Levy', daysBefore: 7, enabled: true },
  { taxType: 'Business Premises', daysBefore: 14, enabled: true },
];

function getDefaultSettings(): ReminderSettings {
  return { email: '', phone: '', name: '', preferences: DEFAULT_PREFS, dailyCheck: true };
}

function getUpcomingDeadlines(days: number = 30): (Deadline & { daysUntil: number; upcomingDate: string })[] {
  const today = new Date();
  const result: (Deadline & { daysUntil: number; upcomingDate: string })[] = [];

  for (const dl of DEADLINES) {
    if (dl.recurring === 'monthly') {
      for (let m = 0; m < 3; m++) {
        const d = new Date(today.getFullYear(), today.getMonth() + m, parseInt(dl.date.split('-')[2]));
        const diff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diff >= -1 && diff <= days) {
          result.push({ ...dl, daysUntil: diff, upcomingDate: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) });
        }
      }
    } else {
      const d = new Date(dl.date);
      if (d < today) {
        d.setFullYear(d.getFullYear() + 1);
      }
      const diff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diff <= days) {
        result.push({ ...dl, daysUntil: diff, upcomingDate: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) });
      }
    }
  }

  result.sort((a, b) => a.daysUntil - b.daysUntil);
  return result;
}

export default function TaxReminders() {
  const [settings, setSettings] = useState<ReminderSettings>(getDefaultSettings);
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState<{ date: string; type: string; message: string; method: string }[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | 'unavailable'>('default');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setSettings(JSON.parse(stored));
      const hist = localStorage.getItem(HISTORY_KEY);
      if (hist) setHistory(JSON.parse(hist));
    } catch {}
    if ('Notification' in window) {
      setNotifPermission(Notification.permission);
    }
  }, []);

  const saveSettings = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, [settings]);

  const addHistory = useCallback((type: string, message: string, method: string) => {
    const entry = { date: new Date().toLocaleString('en-GB'), type, message, method };
    const updated = [entry, ...history].slice(0, 50);
    setHistory(updated);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  }, [history]);

  const requestNotification = async () => {
    if (!('Notification' in window)) { setNotifPermission('unavailable'); return; }
    const perm = await Notification.requestPermission();
    setNotifPermission(perm);
  };

  const checkDeadlines = useCallback(() => {
    const upcoming = getUpcomingDeadlines(30);
    let notified = false;

    for (const dl of upcoming) {
      const pref = settings.preferences.find(p => p.taxType === dl.taxType);
      if (!pref?.enabled) continue;
      if (dl.daysUntil <= pref.daysBefore && dl.daysUntil >= 0) {
        const dayInfo = dl.daysUntil === 0 ? 'Due today!' : dl.daysUntil + ' days away';
        const msg = dl.title + ' — ' + dl.upcomingDate + ' (' + dayInfo + ')';
        if (notifPermission === 'granted') {
          new Notification('TaxBox Reminder', { body: msg, icon: '/favicon.ico' });
        }
        if (settings.email) {
          addHistory(dl.taxType, msg, 'email');
        } else {
          addHistory(dl.taxType, msg, 'notification');
        }
        notified = true;
      }
    }
    return notified;
  }, [settings, notifPermission, addHistory]);

  useEffect(() => {
    if (settings.dailyCheck) {
      checkDeadlines();
    }
  }, [settings.dailyCheck, checkDeadlines]);

  const handleSendEmail = (deadline: Deadline & { daysUntil: number; upcomingDate: string }) => {
    if (!settings.email) return;
    const subject = encodeURIComponent('Tax Reminder: ' + deadline.title);
    const dayMsg = deadline.daysUntil === 0 ? 'This is due today!' : deadline.daysUntil + ' days remaining';
    const bodyLines = [
      'Dear ' + (settings.name || 'Taxpayer') + ',',
      '',
      'This is a reminder regarding: ' + deadline.title,
      '',
      'Due Date: ' + deadline.upcomingDate,
      dayMsg,
      '',
      deadline.description,
      '',
      'Tax Type: ' + deadline.taxType,
      '',
      '---',
      'Powered by TaxBox NG - Lagos PAYE Calculator'
    ];
    const body = encodeURIComponent(bodyLines.join('\n'));
    window.open('mailto:' + settings.email + '?subject=' + subject + '&body=' + body, '_blank');
    addHistory(deadline.taxType, 'Email sent: ' + deadline.title, 'email');
  };

  const upcoming = getUpcomingDeadlines(30);
  const today = new Date();
  const currentMonth = today.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Tax Reminders & Deadlines</h2>
        <p className="text-sm text-gray-600">
          Register your email and set reminder preferences to stay on top of your Lagos State tax obligations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Your Details</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" value={settings.name}
                  onChange={e => setSettings(s => ({ ...s, name: e.target.value }))}
                  placeholder="e.g. John Doe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input type="email" value={settings.email}
                  onChange={e => setSettings(s => ({ ...s, email: e.target.value }))}
                  placeholder="your@email.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input type="tel" value={settings.phone}
                  onChange={e => setSettings(s => ({ ...s, phone: e.target.value }))}
                  placeholder="e.g. 08031234567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Browser Notifications</h4>
              {notifPermission === 'unavailable' ? (
                <p className="text-xs text-gray-500">Notifications not supported in this browser.</p>
              ) : notifPermission === 'granted' ? (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                  Notifications enabled
                </p>
              ) : (
                <button onClick={requestNotification}
                  className="text-xs px-3 py-1.5 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors">
                  Enable Notifications
                </button>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={settings.dailyCheck}
                  onChange={e => setSettings(s => ({ ...s, dailyCheck: e.target.checked }))}
                  className="rounded border-gray-300" />
                Check deadlines automatically on page load
              </label>
            </div>

            <button onClick={saveSettings}
              className="mt-4 w-full py-2 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors">
              {saved ? '✓ Settings Saved' : 'Save Settings'}
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Reminder Preferences</h3>
            <div className="space-y-3">
              {settings.preferences.map((pref, i) => (
                <div key={pref.taxType} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <input type="checkbox" checked={pref.enabled}
                      onChange={e => {
                        const p = [...settings.preferences];
                        p[i] = { ...p[i], enabled: e.target.checked };
                        setSettings(s => ({ ...s, preferences: p }));
                      }}
                      className="rounded border-gray-300 shrink-0" />
                    <span className="text-sm text-gray-700 truncate">{pref.taxType}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <input type="number" value={pref.daysBefore} min={1} max={30}
                      onChange={e => {
                        const p = [...settings.preferences];
                        p[i] = { ...p[i], daysBefore: parseInt(e.target.value) || 5 };
                        setSettings(s => ({ ...s, preferences: p }));
                      }}
                      className="w-14 px-2 py-1 border border-gray-300 rounded text-xs text-center" />
                    <span className="text-xs text-gray-500">days</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <button onClick={() => setShowHistory(!showHistory)}
              className="w-full text-left">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Reminder History ({history.length})
              </h3>
            </button>
            {showHistory && (
              <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                {history.length === 0 ? (
                  <p className="text-xs text-gray-500">No reminders sent yet.</p>
                ) : (
                  history.map((h, i) => (
                    <div key={i} className="text-xs border-b border-gray-100 pb-2">
                      <div className="flex justify-between text-gray-500">
                        <span>{h.date}</span>
                        <span className={`px-1.5 py-0.5 rounded ${h.method === 'email' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                          {h.method}
                        </span>
                      </div>
                      <p className="text-gray-700 mt-0.5">{h.message}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Deadlines</h3>
              <span className="text-xs text-gray-500">{currentMonth}</span>
            </div>
            {upcoming.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p className="text-3xl mb-2">📅</p>
                <p className="text-sm">No upcoming deadlines in the next 30 days.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcoming.map(dl => {
                  const pref = settings.preferences.find(p => p.taxType === dl.taxType);
                  const isDueSoon = dl.daysUntil <= (pref?.daysBefore ?? 5) && dl.daysUntil >= 0;
                  const isOverdue = dl.daysUntil < 0;

                  return (
                    <div key={`${dl.id}-${dl.upcomingDate}`}
                      className={`p-4 rounded-lg border transition-colors ${
                        isOverdue
                          ? 'bg-red-50 border-red-200'
                          : isDueSoon && dl.daysUntil <= 2
                            ? 'bg-red-50 border-red-200'
                            : isDueSoon
                              ? 'bg-amber-50 border-amber-200'
                              : 'bg-gray-50 border-gray-200'
                      }`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                              isOverdue
                                ? 'bg-red-200 text-red-800'
                                : isDueSoon
                                  ? 'bg-amber-200 text-amber-800'
                                  : 'bg-gray-200 text-gray-700'
                            }`}>
                              {isOverdue ? 'OVERDUE' : dl.daysUntil === 0 ? 'DUE TODAY' : `${dl.daysUntil} days`}
                            </span>
                            <span className="text-xs text-gray-500">{dl.taxType}</span>
                          </div>
                          <h4 className="font-medium text-gray-900 text-sm">{dl.title}</h4>
                          <p className="text-xs text-gray-600 mt-1">{dl.upcomingDate}</p>
                          <p className="text-xs text-gray-500 mt-1">{dl.description}</p>
                        </div>
                        <div className="flex flex-col gap-1.5 shrink-0">
                          {settings.email && (
                            <button onClick={() => handleSendEmail(dl)}
                              title="Send email reminder"
                              className="px-2.5 py-1.5 bg-blue-900 text-white text-xs rounded-lg hover:bg-blue-800 transition-colors flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                              </svg>
                              Email
                            </button>
                          )}
                          <button onClick={() => {
                            if (notifPermission === 'granted') {
                              new Notification('TaxBox Reminder', { body: `${dl.title} — ${dl.upcomingDate}` });
                              addHistory(dl.taxType, `Notification sent: ${dl.title}`, 'notification');
                            } else {
                              requestNotification();
                            }
                          }}
                            title="Send notification"
                            className="px-2.5 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                            </svg>
                            Notify
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">All Tax Deadlines — {new Date().getFullYear()}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-2 px-2 font-semibold text-gray-700">Tax Type</th>
                    <th className="text-left py-2 px-2 font-semibold text-gray-700">Deadline</th>
                    <th className="text-left py-2 px-2 font-semibold text-gray-700">Frequency</th>
                    <th className="text-left py-2 px-2 font-semibold text-gray-700">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {DEADLINES.map(dl => (
                    <tr key={dl.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-2">
                        <span className="px-2 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-800">
                          {dl.taxType}
                        </span>
                      </td>
                      <td className="py-2 px-2 font-medium">{new Date(dl.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}</td>
                      <td className="py-2 px-2 text-gray-600 capitalize">{dl.recurring}</td>
                      <td className="py-2 px-2 text-gray-600 text-xs">{dl.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
