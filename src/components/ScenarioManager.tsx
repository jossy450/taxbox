import { useState, useEffect } from 'react'
import type { GrossIncome, PayeResult } from '../engine/types'
import { formatNaira } from './TaxChart'

interface Scenario {
  id: string
  name: string
  createdAt: string
  income: GrossIncome
  annualRent: number
  hasReceipt: boolean
  isMonthly: boolean
  result: PayeResult
}

const SCENARIO_KEY = 'taxbox_scenarios';

function loadScenarios(): Scenario[] {
  try {
    const stored = localStorage.getItem(SCENARIO_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

interface Props {
  currentResult: PayeResult | null
  currentIncome: GrossIncome
  currentAnnualRent: number
  currentHasReceipt: boolean
  currentIsMonthly: boolean
}

export default function ScenarioManager({ currentResult, currentIncome, currentAnnualRent, currentHasReceipt, currentIsMonthly }: Props) {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareData, setCompareData] = useState<Scenario[]>([]);

  useEffect(() => {
    setScenarios(loadScenarios());
  }, []);

  function persist(updated: Scenario[]) {
    setScenarios(updated);
    localStorage.setItem(SCENARIO_KEY, JSON.stringify(updated));
  }

  function handleSave() {
    if (!currentResult || !saveName.trim()) return;
    const scenario: Scenario = {
      id: generateId(),
      name: saveName.trim(),
      createdAt: new Date().toISOString(),
      income: { ...currentIncome },
      annualRent: currentAnnualRent,
      hasReceipt: currentHasReceipt,
      isMonthly: currentIsMonthly,
      result: currentResult,
    };
    persist([scenario, ...scenarios]);
    setSaveName('');
    setShowSaveDialog(false);
  }

  function handleDelete(id: string) {
    persist(scenarios.filter(s => s.id !== id));
    setCompareIds(prev => prev.filter(cid => cid !== id));
  }

  function toggleCompare(id: string) {
    setCompareIds(prev => {
      if (prev.includes(id)) return prev.filter(cid => cid !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  }

  useEffect(() => {
    setCompareData(scenarios.filter(s => compareIds.includes(s.id)));
  }, [compareIds, scenarios]);

  if (!currentResult) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
          Scenarios
        </h3>
        <div className="flex items-center gap-2">
          <button onClick={() => { setShowSaveDialog(true); setShowPanel(true); }}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Save Scenario
          </button>
          <button onClick={() => setShowPanel(!showPanel)}
            className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            {showPanel ? 'Hide' : 'Saved (' + scenarios.length + ')'}
          </button>
        </div>
      </div>

      {showSaveDialog && (
        <div className="px-4 py-3 bg-blue-50 border-b border-blue-200 flex items-center gap-3">
          <input type="text" value={saveName}
            onChange={e => setSaveName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSave(); }}
            placeholder="Scenario name..."
            className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            autoFocus />
          <button onClick={handleSave}
            disabled={!saveName.trim()}
            className="px-3 py-1.5 bg-blue-900 text-white text-xs rounded-lg hover:bg-blue-800 disabled:opacity-50 transition-colors">
            Save
          </button>
          <button onClick={() => { setShowSaveDialog(false); setSaveName(''); }}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-lg hover:bg-gray-200 transition-colors">
            Cancel
          </button>
        </div>
      )}

      {showPanel && (
        <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
          {scenarios.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-400">
              No saved scenarios yet. Calculate your PAYE and save it for later comparison.
            </div>
          ) : (
            scenarios.map(s => {
              const selected = compareIds.includes(s.id);
              return (
                <div key={s.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{s.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(s.createdAt).toLocaleDateString('en-GB')} &middot; Tax: {formatNaira(s.result.totalTax)} &middot; Net: {formatNaira(s.result.netIncome)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button onClick={() => toggleCompare(s.id)}
                        className={`px-2 py-1 text-xs rounded transition-colors ${selected ? 'bg-blue-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                        {selected ? 'Selected' : 'Compare'}
                      </button>
                      <button onClick={() => handleDelete(s.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {compareData.length > 0 && (
        <div className="border-t border-gray-200 p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Compare Scenarios</h4>
          <div className={'grid gap-4 ' + (compareData.length === 1 ? 'grid-cols-1' : 'grid-cols-2')}>
            {compareData.map(s => (
              <div key={s.id} className="bg-gray-50 rounded-lg p-3 space-y-2">
                <p className="text-sm font-semibold text-gray-900">{s.name}</p>
                <p className="text-xs text-gray-500">{new Date(s.createdAt).toLocaleDateString('en-GB')} &middot; {s.isMonthly ? 'Monthly' : 'Annual'} input</p>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between"><span className="text-gray-600">Gross Income</span><span className="font-mono">{formatNaira(s.result.grossIncome)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Total Tax</span><span className="font-mono font-semibold text-red-600">{formatNaira(s.result.totalTax)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Net Income</span><span className="font-mono font-semibold text-green-600">{formatNaira(s.result.netIncome)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Effective Rate</span><span className="font-mono">{(s.result.effectiveTaxRate * 100).toFixed(1)}%</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Chargeable</span><span className="font-mono">{formatNaira(s.result.chargeableIncome)}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
