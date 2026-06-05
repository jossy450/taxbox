import { useState } from 'react'
import PersonaA from './PersonaA'
import PersonaB from './PersonaB'
import PersonaC from './PersonaC'
import OldRegimeCalculator from './OldRegimeCalculator'
import PaymentChannels from './PaymentChannels'
import TaxReminders from './TaxReminders'

type Tab = 'individual' | 'corporate' | 'consultant' | 'oldPita' | 'payment' | 'reminders'

const TABS: { key: Tab; label: string; desc: string }[] = [
  { key: 'individual', label: 'Individual Taxpayer', desc: 'Quick check & reverse calculator' },
  { key: 'corporate', label: 'Company Payroll', desc: 'Batch processing & LIRS schedules' },
  { key: 'consultant', label: 'Tax Consultant', desc: 'Audit, comparison & optimisation' },
  { key: 'oldPita', label: 'Old PITA Regime', desc: 'Pre-2026 calculator & gross-up' },
  { key: 'payment', label: 'Payment Channels', desc: 'Pay taxes & generate advice' },
  { key: 'reminders', label: 'Tax Reminders', desc: 'Deadlines & email alerts' },
]

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('individual')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-900 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Lagos PAYE 2026</h1>
              <p className="text-blue-200 text-sm">Nigeria Tax Act (NTA) — Rent Relief Regime</p>
            </div>
            <div className="text-right text-xs text-blue-300">
              <p>Powered by TaxBox NG</p>
              <p>LIRS-Compliant</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <nav className="flex gap-1 mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-1" role="tablist">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              role="tab"
              aria-selected={activeTab === tab.key}
              className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <span className="block">{tab.label}</span>
              <span className={`text-xs mt-0.5 ${activeTab === tab.key ? 'text-blue-200' : 'text-gray-400'}`}>
                {tab.desc}
              </span>
            </button>
          ))}
        </nav>

        <main role="tabpanel">
          {activeTab === 'individual' && <PersonaA />}
          {activeTab === 'corporate' && <PersonaB />}
          {activeTab === 'consultant' && <PersonaC />}
          {activeTab === 'oldPita' && <OldRegimeCalculator />}
          {activeTab === 'payment' && <PaymentChannels />}
          {activeTab === 'reminders' && <TaxReminders />}
        </main>
      </div>

      <footer className="border-t border-gray-200 bg-white mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          <p>Lagos PAYE 2026 Calculator — Compliant with the Nigeria Tax Act (NTA) and LIRS Guidelines.</p>
          <p className="mt-1">This tool provides estimates only. Always consult a qualified tax professional for formal filings.</p>
        </div>
      </footer>
    </div>
  )
}
