import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useRealtimeSimulation, useTimeSeriesHistory } from '../../hooks/useRealtimeSimulation';
import StatsCard from './StatsCard';
import RealtimeChart from './RealtimeChart';

function QuickActionBtn({ to, icon, label }: { to: string; icon: string; label: string }) {
  const navigate = useNavigate();
  return (
    <button onClick={() => navigate(to)}
      className="flex items-center gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left">
      <span className="text-xl">{icon}</span>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </button>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();

  const basePaye = useMemo(() => 4_500_000 + Math.random() * 500_000, []);
  const baseEmployees = useMemo(() => 128 + Math.random() * 20, []);
  const basePayroll = useMemo(() => 18_000_000 + Math.random() * 2_000_000, []);
  const baseRate = useMemo(() => 12.4 + Math.random() * 2, []);

  const livePaye = useRealtimeSimulation(basePaye, 200_000, 4000);
  const liveEmployees = useRealtimeSimulation(baseEmployees, 3, 5000);
  const livePayroll = useRealtimeSimulation(basePayroll, 500_000, 4000);
  const liveRate = useRealtimeSimulation(baseRate, 0.5, 6000);

  const payeHistory = useTimeSeriesHistory(basePaye, 200_000, 25, 4000);
  const payrollHistory = useTimeSeriesHistory(basePayroll, 500_000, 25, 4000);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Welcome back, {user?.name} —{' '}
            <span className="capitalize">{user?.role}</span>
            {user?.company && <span> at {user.company}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          All systems live
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard title="Total Employees" value={Math.round(liveEmployees)} icon="👥" color="#1e3a5f" trend="up" />
        <StatsCard title="PAYE Collected (Annual)" value={Math.round(livePaye)} format="currency" icon="💰" color="#0d9488" trend="up" />
        <StatsCard title="Total Payroll (Annual)" value={Math.round(livePayroll)} format="currency" icon="📊" color="#d97706" trend="up" />
        <StatsCard title="Avg Effective Rate" value={Math.round(liveRate * 100)} format="percent" icon="📈" color="#7c3aed" trend="neutral" />
        <StatsCard title="Active Users" value={42} icon="👤" color="#0891b2" trend="up" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RealtimeChart data={payeHistory} title="PAYE Collection Trend (Real-Time)" color="#0d9488" />
        <RealtimeChart data={payrollHistory} title="Gross Payroll Trend (Real-Time)" color="#d97706" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
          <QuickActionBtn to="/app/calculator" icon="🧮" label="Run PAYE" />
          <QuickActionBtn to="/app/employees" icon="👥" label="Employees" />
          <QuickActionBtn to="/app/audit-checklist" icon="✅" label="Audit Checklist" />
          <QuickActionBtn to="/app/expatriates" icon="🌍" label="Expatriates" />
          <QuickActionBtn to="/app/wht-schedule" icon="🧾" label="WHT Schedule" />
          <QuickActionBtn to="/app/paye-remittance" icon="💰" label="PAYE Remit" />
          <QuickActionBtn to="/app/direct-assessment" icon="📝" label="Direct Assess" />
          <QuickActionBtn to="/app/business-premises" icon="🏢" label="Biz Premises" />
          <QuickActionBtn to="/app/development-levy" icon="📈" label="Dev Levy" />
          <QuickActionBtn to="/app/staff-cost" icon="👥" label="Staff Cost" />
          <QuickActionBtn to="/app/payments" icon="💳" label="Payments" />
          <QuickActionBtn to="/app/tax-records" icon="📋" label="Tax Records" />
        </div>
      </div>
    </div>
  );
}
