import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../context/SubscriptionContext';
import type { UserRole } from '../../types/auth';

const NAV_ITEMS: { to: string; label: string; icon: string; roles: UserRole[] }[] = [
  { to: '/app/dashboard', label: 'Dashboard', icon: '📊', roles: ['admin', 'corporate', 'consultant', 'individual'] },
  { to: '/app/calculator', label: 'Tax Calculator', icon: '🧮', roles: ['admin', 'corporate', 'consultant', 'individual'] },
  { to: '/app/employees', label: 'Employees', icon: '👥', roles: ['admin', 'corporate'] },
  { to: '/app/tax-records', label: 'Tax Records', icon: '📋', roles: ['admin', 'corporate', 'consultant'] },
  { to: '/app/audit-checklist', label: 'Audit Checklist', icon: '✅', roles: ['admin', 'corporate', 'consultant'] },
  { to: '/app/expatriates', label: 'Expatriates', icon: '🌍', roles: ['admin', 'corporate'] },
  { to: '/app/staff-cost', label: 'Staff Cost', icon: '👥', roles: ['admin', 'corporate'] },
  { to: '/app/wht-schedule', label: 'WHT Schedule', icon: '🧾', roles: ['admin', 'corporate', 'consultant'] },
  { to: '/app/paye-remittance', label: 'PAYE Remittance', icon: '💰', roles: ['admin', 'corporate'] },
  { to: '/app/direct-assessment', label: 'Direct Assessment', icon: '📝', roles: ['admin', 'corporate', 'consultant'] },
  { to: '/app/business-premises', label: 'Biz Premises', icon: '🏢', roles: ['admin', 'corporate'] },
  { to: '/app/development-levy', label: 'Dev Levy', icon: '📈', roles: ['admin', 'corporate'] },
  { to: '/app/payments', label: 'Payments', icon: '💳', roles: ['admin', 'corporate', 'consultant'] },
  { to: '/app/subscription', label: 'Subscription', icon: '⭐', roles: ['admin', 'corporate', 'consultant', 'individual'] },
  { to: '/app/feedback', label: 'Feedback', icon: '💬', roles: ['admin', 'corporate', 'consultant', 'individual'] },
  { to: '/app/chatbot', label: 'Chatbot Admin', icon: '🤖', roles: ['admin'] },
];

const LEGAL_LINKS: { to: string; label: string }[] = [
  { to: '/app/disclaimer', label: 'Disclaimer' },
  { to: '/app/privacy', label: 'Privacy Policy' },
  { to: '/app/cookies', label: 'Cookie Policy' },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { currentSubscription } = useSubscription();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const visibleItems = NAV_ITEMS.filter(item => item.roles.includes(user?.role ?? 'individual'));

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && (
        <aside className="w-64 bg-blue-900 text-white flex flex-col shrink-0">
          <div className="p-5 border-b border-blue-800">
            <h2 className="text-lg font-bold">TaxBox NG</h2>
            <p className="text-xs text-blue-300 mt-0.5">Lagos PAYE 2026</p>
          </div>

          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {visibleItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-blue-800 text-white' : 'text-blue-200 hover:bg-blue-800/50 hover:text-white'
                  }`
                }
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="px-3 py-2 border-t border-blue-800">
            <p className="text-xs text-blue-400 px-2 mb-1 font-medium">Legal</p>
            {LEGAL_LINKS.map(link => (
              <NavLink key={link.to} to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 rounded-lg text-xs transition-colors ${
                    isActive ? 'bg-blue-800 text-white' : 'text-blue-300 hover:text-white hover:bg-blue-800/50'
                  }`
                }>
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="p-4 border-t border-blue-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">
                {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-blue-300 capitalize">{user?.role}</p>
              </div>
            </div>
            {currentSubscription && (
              <div className="mb-3 px-3 py-1.5 bg-blue-800 rounded-lg text-xs text-center">
                <span className="text-blue-200">Plan: </span>
                <span className="font-semibold text-white uppercase">{currentSubscription.tier}</span>
              </div>
            )}
            <button onClick={handleLogout}
              className="w-full py-2 text-sm text-blue-300 hover:text-white hover:bg-blue-800 rounded-lg transition-colors">
              Sign Out
            </button>
          </div>
        </aside>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(prev => !prev)}
            className="text-gray-500 hover:text-gray-700 text-xl">
            {sidebarOpen ? '✕' : '☰'}
          </button>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{user?.company && `${user.company} — `}{user?.email}</span>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium capitalize">
              {user?.role}
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
