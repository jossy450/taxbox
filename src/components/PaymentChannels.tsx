import { useState, useRef } from 'react'
import { formatNaira } from './TaxChart'

type PaymentMethod = 'remita' | 'bank'

interface BankInfo {
  bank: string
  sortCode: string
  url?: string
}

const REMITA_URL = 'https://www.remita.net';

const ALL_BANKS: BankInfo[] = [
  { bank: 'Access Bank Plc', sortCode: '044', url: 'https://www.accessbankplc.com/internet-banking' },
  { bank: 'Citibank Nigeria Ltd', sortCode: '023', url: 'https://www.citibank.com/nigeria' },
  { bank: 'Ecobank Nigeria Plc', sortCode: '050', url: 'https://www.ecobank.com/ng/internet-banking' },
  { bank: 'Fidelity Bank Plc', sortCode: '070', url: 'https://www.fidelitybank.ng/internet-banking' },
  { bank: 'First Bank of Nigeria Ltd', sortCode: '011', url: 'https://www.ibank.firstbanknigeria.com' },
  { bank: 'First City Monument Bank (FCMB)', sortCode: '214', url: 'https://www.fcmb.com/digital-banking' },
  { bank: 'Globus Bank Ltd', sortCode: '00127', url: 'https://www.globusbank.com/internet-banking' },
  { bank: 'Guaranty Trust Bank (GTBank)', sortCode: '058', url: 'https://www.gtbank.com/internet-banking' },
  { bank: 'Heritage Bank Plc', sortCode: '030', url: 'https://www.hbng.com/internet-banking' },
  { bank: 'Keystone Bank Ltd', sortCode: '082', url: 'https://www.keystonebankng.com/internet-banking' },
  { bank: 'Moniepoint MFB', sortCode: '50515', url: 'https://www.moniepoint.com' },
  { bank: 'OPay (PalmPay)', sortCode: '100029', url: 'https://www.opayweb.com' },
  { bank: 'Polaris Bank Ltd', sortCode: '076', url: 'https://www.polarisbanklimited.com/internet-banking' },
  { bank: 'Premium Trust Bank', sortCode: '173', url: 'https://www.premiumtrustbank.com' },
  { bank: 'Providus Bank Ltd', sortCode: '101', url: 'https://www.providusbank.com/internet-banking' },
  { bank: 'Stanbic IBTC Bank Plc', sortCode: '039', url: 'https://www.stanbicibtcbank.com/internet-banking' },
  { bank: 'Standard Chartered Bank', sortCode: '068', url: 'https://www.sc.com/ng/internet-banking' },
  { bank: 'Sterling Bank Plc', sortCode: '232', url: 'https://www.sterling.ng/internet-banking' },
  { bank: 'SunTrust Bank Nigeria Ltd', sortCode: '116', url: 'https://www.suntrustng.com/internet-banking' },
  { bank: 'Titan Trust Bank Ltd', sortCode: '102', url: 'https://www.titantrustbank.com' },
  { bank: 'Union Bank of Nigeria Plc', sortCode: '032', url: 'https://www.unionbankng.com/internet-banking' },
  { bank: 'United Bank for Africa (UBA)', sortCode: '033', url: 'https://www.ubagroup.com/internet-banking' },
  { bank: 'Unity Bank Plc', sortCode: '215', url: 'https://www.unitybankng.com/internet-banking' },
  { bank: 'Wema Bank Plc', sortCode: '035', url: 'https://www.wemabank.com/internet-banking' },
  { bank: 'Zenith Bank Plc', sortCode: '057', url: 'https://www.zenithbank.com/internet-banking' },
];

interface TaxAccount {
  id: string
  label: string
  description: string
  accountName: string
  accountNumber: string
  notes: string[]
}

const TAX_ACCOUNTS: TaxAccount[] = [
  {
    id: 'paye',
    label: 'PAYE (Pay As You Earn)',
    description: 'Personal income tax deducted from employees\' salaries and remitted to LIRS.',
    accountName: 'LIRS - PAYE Collection Account',
    accountNumber: '0012345678',
    notes: [
      'Use your Company ID (CID) as the payment reference',
      'Remit on or before the 10th day of the following month',
      'File H1 annual declaration on or before January 31st',
      'Penalty of 10% + interest applies for late remittance',
    ],
  },
  {
    id: 'directAssessment',
    label: 'Direct Assessment',
    description: 'For self-employed individuals and business owners not under PAYE.',
    accountName: 'LIRS - Direct Assessment Collection',
    accountNumber: '1012345679',
    notes: [
      'Use your Taxpayer ID (TIN) as payment reference',
      'Payable in two instalments: first on or before March 31st, second on or before June 30th',
      'Assessment is based on presumptive income or filed returns',
    ],
  },
  {
    id: 'wht',
    label: 'Withholding Tax (WHT)',
    description: 'Tax deducted at source from payments to suppliers, contractors, and service providers.',
    accountName: 'LIRS - WHT Collection Account',
    accountNumber: '0012345681',
    notes: [
      'Use the beneficiary\'s TIN as payment reference',
      'Remit within 21 days of deduction',
      'File quarterly WHT schedule with LIRS',
      'Rent: 10%, Consultancy: 5%, Contract: 5%, Dividend: 10%',
    ],
  },
  {
    id: 'developmentLevy',
    label: 'Development Levy',
    description: 'Annual levy payable by employers based on number of employees.',
    accountName: 'LIRS - Development Levy Account',
    accountNumber: '0012345682',
    notes: [
      'Local staff: ₦500 per employee per annum',
      'Expatriate staff: ₦500 per employee per annum',
      'Payable annually on or before June 30th',
    ],
  },
  {
    id: 'businessPremises',
    label: 'Business Premises',
    description: 'Annual levy for business premises based on location and class.',
    accountName: 'LIRS - Business Premises Account',
    accountNumber: '0012345683',
    notes: [
      'Based on location and class of business premises in Lagos',
      'Renewable annually',
      'Penalty applies for late payment',
    ],
  },
];

interface PaymentRecord {
  id: string
  date: string
  taxType: string
  amount: number
  reference: string
  method: string
  bankName: string
  receiptData: string
  receiptName: string
  notes: string
}

const HISTORY_KEY = 'taxbox_payment_history';

function loadHistory(): PaymentRecord[] {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

export default function PaymentChannels() {
  const [method, setMethod] = useState<PaymentMethod>('remita');
  const [selectedId, setSelectedId] = useState(TAX_ACCOUNTS[0].id);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentRef, setPaymentRef] = useState('');
  const [showAdvice, setShowAdvice] = useState(false);
  const [history, setHistory] = useState<PaymentRecord[]>(loadHistory);
  const [showHistoryForm, setShowHistoryForm] = useState(false);
  const [historyForm, setHistoryForm] = useState({ date: new Date().toISOString().slice(0, 10), taxType: 'PAYE', amount: '', reference: '', method: 'bank', bankName: '', notes: '' });
  const [editingHistoryId, setEditingHistoryId] = useState<string | null>(null);
  const [expandedReceipt, setExpandedReceipt] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingReceipt, setPendingReceipt] = useState<{ data: string; name: string } | null>(null);

  const selected = TAX_ACCOUNTS.find(a => a.id === selectedId) || TAX_ACCOUNTS[0];

  const handleGenerateAdvice = () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) return;
    setShowAdvice(true);
  };

  const handlePrintAdvice = () => {
    const pw = window.open('', '_blank');
    if (!pw) return;
    const ref = paymentRef || `REF-${Date.now().toString(36).toUpperCase()}`;
    const styles = Array.from(document.styleSheets)
      .map(s => { try { return Array.from(s.cssRules).map(r => r.cssText).join(''); } catch { return ''; } }).join('');

    pw.document.write(`
      <!DOCTYPE html>
      <html><head>
        <title>Payment Advice - ${selected.label}</title>
        <style>${styles}
          body { font-family: 'Courier New', monospace; padding: 40px; color: #000; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { font-size: 18px; text-transform: uppercase; letter-spacing: 2px; margin: 0; }
          .header h2 { font-size: 14px; font-weight: normal; margin: 4px 0; color: #555; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 8px 12px; text-align: left; border: 1px solid #000; font-size: 12px; }
          th { background: #f0f0f0; font-weight: bold; }
          .amount { text-align: right; font-weight: bold; }
          .note { font-size: 10px; color: #666; margin-top: 20px; }
          @page { margin: 1.5cm; }
        </style>
      </head><body>
        <div class="header">
          <h1>LAGOS STATE INTERNAL REVENUE SERVICE</h1>
          <h2>PAYMENT ADVICE SLIP</h2>
          <p>Tax Type: ${selected.label}</p>
          <p>Payment Method: ${method === 'remita' ? 'Remita (Online)' : 'Bank Branch Payment'}</p>
          <p>Date: ${new Date().toLocaleDateString('en-GB')}</p>
        </div>
        <table>
          <tr><th>Description</th><th>Details</th></tr>
          <tr><td>Tax Type</td><td>${selected.label}</td></tr>
          <tr><td>Amount Due</td><td class="amount">${formatNaira(parseFloat(paymentAmount) || 0)}</td></tr>
          <tr><td>Payment Reference</td><td>${ref}</td></tr>
          <tr><td>Payment Date</td><td>${new Date().toLocaleDateString('en-GB')}</td></tr>
        </table>
        ${method === 'bank' ? `
        <table>
          <tr><th>Account Name</th><th>Account Number</th></tr>
          <tr><td>${selected.accountName}</td><td class="amount">${selected.accountNumber}</td></tr>
        </table>
        <p style="font-size:10px;color:#666;">Payable at all commercial banks in Nigeria. Use the payment reference as deposit narration.</p>
        ` : `
        <p style="font-size:11px;color:#333;">Pay via Remita at <strong>www.remita.net</strong> using your TIN or CID.</p>
        `}
        <div class="note">
          <p><strong>Notes:</strong></p>
          ${selected.notes.map(n => `<p>• ${n}</p>`).join('')}
          <p style="margin-top:10px;">Generated by TaxBox NG on ${new Date().toLocaleString('en-GB')}</p>
        </div>
        <script>window.onload = function() { window.print(); window.close(); }</script>
      </body></html>
    `);
    pw.document.close();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Payment Channels</h2>
        <p className="text-sm text-gray-600">
          Pay your Lagos State taxes securely via Remita or at any commercial bank branch nationwide.
        </p>
      </div>

      <div className="flex gap-1 bg-white rounded-xl shadow-sm border border-gray-200 p-1 max-w-md mx-auto">
        <button onClick={() => setMethod('remita')}
          className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            method === 'remita' ? 'bg-blue-900 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}>
          <span className="block">Remita (Online)</span>
          <span className={`text-xs ${method === 'remita' ? 'text-blue-200' : 'text-gray-400'}`}>Pay via Remita</span>
        </button>
        <button onClick={() => setMethod('bank')}
          className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            method === 'bank' ? 'bg-blue-900 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}>
          <span className="block">Bank Branch</span>
          <span className={`text-xs ${method === 'bank' ? 'text-blue-200' : 'text-gray-400'}`}>All commercial banks</span>
        </button>
      </div>

      {method === 'remita' && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-green-900">Pay via Remita</h3>
                <a href={REMITA_URL} target="_blank" rel="noopener noreferrer"
                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                  Go to Remita
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                </a>
              </div>
              <p className="text-sm text-green-700 mb-3">
                Remita is the approved payment platform for all Lagos State tax remittances.
              </p>
              <ol className="space-y-2 text-sm text-green-800">
                <li className="flex items-start gap-2">
                  <span className="font-bold bg-green-200 text-green-900 w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs">1</span>
                  <span>Click <strong>"Go to Remita"</strong> above or visit <a href={REMITA_URL} target="_blank" rel="noopener noreferrer" className="text-green-700 underline font-medium">www.remita.net</a></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold bg-green-200 text-green-900 w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs">2</span>
                  <span>Select <strong>"Lagos State Internal Revenue Service (LIRS)"</strong> as the MDA</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold bg-green-200 text-green-900 w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs">3</span>
                  <span>Select the tax type: <strong>{selected.label}</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold bg-green-200 text-green-900 w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs">4</span>
                  <span>Enter your <strong>TIN (Taxpayer ID)</strong> or <strong>CID (Company ID)</strong> as the payer reference</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold bg-green-200 text-green-900 w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs">5</span>
                  <span>Enter the amount and complete payment via card, bank transfer, or USSD</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold bg-green-200 text-green-900 w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs">6</span>
                  <span>Save the Remita Receipt Number (RRR) and payment receipt for your records</span>
                </li>
              </ol>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <a href={REMITA_URL} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-white border border-green-300 text-green-800 px-4 py-3 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
                  </svg>
                  Open Remita Web
                </a>
                <a href={REMITA_URL} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-white border border-green-300 text-green-800 px-4 py-3 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                  </svg>
                  Remita Mobile App
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {method === 'bank' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-600 rounded-lg flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-amber-900 mb-2">Pay at any Bank Branch</h3>
              <p className="text-sm text-amber-700 mb-3">
                Deposit directly at any commercial bank branch in Nigeria. Use the account details below.
              </p>
              <div className="bg-white rounded-lg p-4 border border-amber-200 mb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Account Name</p>
                    <p className="font-semibold text-gray-900">{selected.accountName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Account Number</p>
                    <p className="font-mono font-bold text-lg text-gray-900">{selected.accountNumber}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs text-amber-700 font-medium self-center mr-1">Quick access:</span>
                {['Access Bank', 'First Bank', 'GTBank', 'UBA', 'Zenith Bank', 'FCMB', 'Stanbic IBTC', 'Ecobank'].map(name => {
                  const bank = ALL_BANKS.find(b => b.bank.startsWith(name));
                  if (!bank?.url) return null;
                  return (
                    <a key={name} href={bank.url} target="_blank" rel="noopener noreferrer"
                      className="text-xs px-2.5 py-1 bg-amber-100 text-amber-800 rounded-md hover:bg-amber-200 transition-colors">
                      {name}
                    </a>
                  );
                })}
              </div>
              <div className="overflow-x-auto bg-white rounded-lg border border-amber-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-amber-200 bg-amber-50">
                      <th className="text-left py-2 px-3 font-semibold text-amber-900">S/N</th>
                      <th className="text-left py-2 px-3 font-semibold text-amber-900">Bank Name</th>
                      <th className="text-left py-2 px-3 font-semibold text-amber-900">Sort Code</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ALL_BANKS.map((b, i) => (
                      <tr key={i} className="border-b border-gray-100 hover:bg-amber-50/50">
                        <td className="py-1.5 px-3 text-gray-400 text-xs">{String(i + 1).padStart(2, '0')}</td>
                        <td className="py-1.5 px-3 font-medium">
                          {b.url ? (
                            <a href={b.url} target="_blank" rel="noopener noreferrer"
                              className="text-blue-700 hover:text-blue-900 underline underline-offset-2 decoration-blue-300 hover:decoration-blue-600 transition-colors">
                              {b.bank}
                            </a>
                          ) : (
                            <span className="text-gray-800">{b.bank}</span>
                          )}
                        </td>
                        <td className="py-1.5 px-3 font-mono text-gray-600">{b.sortCode}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Tax Type</h3>
          <div className="space-y-1">
            {TAX_ACCOUNTS.map(a => (
              <button key={a.id} onClick={() => { setSelectedId(a.id); setShowAdvice(false); }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  selectedId === a.id
                    ? 'bg-blue-900 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}>
                <span className="block font-medium">{a.label}</span>
                <span className={`text-xs mt-0.5 ${selectedId === a.id ? 'text-blue-200' : 'text-gray-400'}`}>
                  {a.description.slice(0, 60)}...
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{selected.label}</h3>
            <p className="text-sm text-gray-600 mb-4">{selected.description}</p>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-amber-800 mb-2">Important Notes</h4>
              <ul className="space-y-1">
                {selected.notes.map((n, i) => (
                  <li key={i} className="text-xs text-amber-700 flex items-start gap-2">
                    <span className="mt-0.5">•</span>
                    <span>{n}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Payment Advice</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount Due (₦)</label>
                <input type="number" value={paymentAmount}
                  onChange={e => setPaymentAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Reference (TIN / CID)</label>
                <input type="text" value={paymentRef}
                  onChange={e => setPaymentRef(e.target.value)}
                  placeholder="e.g. C-1717563 or TIN"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleGenerateAdvice}
                className="px-5 py-2 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800 transition-colors">
                Generate Payment Advice
              </button>
              {showAdvice && (
                <button onClick={handlePrintAdvice}
                  className="px-5 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
                  </svg>
                  Print / Download PDF
                </button>
              )}
            </div>

            {showAdvice && (
              <div className="mt-6 p-4 border border-green-200 bg-green-50 rounded-lg print-area">
                <h4 className="text-sm font-semibold text-green-800 mb-3">Payment Advice Generated</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax Type:</span>
                    <span className="font-medium">{selected.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium">{method === 'remita' ? 'Remita (Online)' : 'Bank Branch'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount Due:</span>
                    <span className="font-bold text-green-800">{formatNaira(parseFloat(paymentAmount) || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Reference:</span>
                    <span className="font-mono font-medium">{paymentRef || `REF-${Date.now().toString(36).toUpperCase()}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date Generated:</span>
                    <span>{new Date().toLocaleDateString('en-GB')}</span>
                  </div>
                </div>
                <div className="mt-3 border-t border-green-200 pt-3">
                  <p className="text-xs text-green-700">
                    {method === 'remita'
                      ? 'Pay via Remita at www.remita.net. Use your TIN/CID as reference.'
                      : `Pay into ${selected.accountName} (Account: ${selected.accountNumber}) at any commercial bank.`}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
            Payment History ({history.length})
          </h3>
          <button onClick={() => { setShowHistoryForm(true); setEditingHistoryId(null); setHistoryForm({ date: new Date().toISOString().slice(0, 10), taxType: 'PAYE', amount: '', reference: '', method: 'bank', bankName: '', notes: '' }); setPendingReceipt(null); }}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Record Payment
          </button>
        </div>

        {showHistoryForm && (
          <div className="p-4 bg-blue-50 border-b border-blue-200">
            <h4 className="text-sm font-semibold text-gray-800 mb-3">{editingHistoryId ? 'Edit Payment' : 'Record a Payment'}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-0.5">Payment Date</label>
                <input type="date" value={historyForm.date}
                  onChange={e => setHistoryForm(f => ({ ...f, date: e.target.value }))}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-0.5">Tax Type</label>
                <select value={historyForm.taxType}
                  onChange={e => setHistoryForm(f => ({ ...f, taxType: e.target.value }))}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white">
                  {TAX_ACCOUNTS.map(a => <option key={a.id}>{a.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-0.5">Amount (₦)</label>
                <input type="number" value={historyForm.amount}
                  onChange={e => setHistoryForm(f => ({ ...f, amount: e.target.value }))}
                  placeholder="0.00"
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-0.5">Payment Reference</label>
                <input type="text" value={historyForm.reference}
                  onChange={e => setHistoryForm(f => ({ ...f, reference: e.target.value }))}
                  placeholder="RRR / TIN / CID"
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-0.5">Method</label>
                <select value={historyForm.method}
                  onChange={e => setHistoryForm(f => ({ ...f, method: e.target.value }))}
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs bg-white">
                  <option value="remita">Remita</option>
                  <option value="bank">Bank Branch</option>
                  <option value="ussd">USSD</option>
                  <option value="pos">POS</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-0.5">Bank / Channel</label>
                <input type="text" value={historyForm.bankName}
                  onChange={e => setHistoryForm(f => ({ ...f, bankName: e.target.value }))}
                  placeholder="e.g. Access Bank"
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs" />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-xs font-medium text-gray-600 mb-0.5">Notes</label>
                <input type="text" value={historyForm.notes}
                  onChange={e => setHistoryForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Optional notes..."
                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs" />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-xs font-medium text-gray-600 mb-0.5">Receipt (optional)</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-lg hover:bg-gray-200 transition-colors">
                    {pendingReceipt ? 'Change File' : 'Upload Receipt'}
                  </button>
                  {pendingReceipt && (
                    <span className="text-xs text-gray-600 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                      {pendingReceipt.name}
                    </span>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*,.pdf"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => setPendingReceipt({ data: reader.result as string, name: file.name });
                      reader.readAsDataURL(file);
                    }}
                    className="hidden" />
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => {
                if (!historyForm.amount || parseFloat(historyForm.amount) <= 0) return;
                const record: PaymentRecord = {
                  id: editingHistoryId || Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
                  date: historyForm.date,
                  taxType: historyForm.taxType,
                  amount: parseFloat(historyForm.amount),
                  reference: historyForm.reference,
                  method: historyForm.method,
                  bankName: historyForm.bankName,
                  receiptData: pendingReceipt?.data || '',
                  receiptName: pendingReceipt?.name || '',
                  notes: historyForm.notes,
                };
                let updated: PaymentRecord[];
                if (editingHistoryId) {
                  updated = history.map(h => h.id === editingHistoryId ? record : h);
                } else {
                  updated = [record, ...history];
                }
                setHistory(updated);
                localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
                setShowHistoryForm(false);
                setEditingHistoryId(null);
                setPendingReceipt(null);
              }}
                className="px-4 py-1.5 bg-blue-900 text-white text-xs font-medium rounded-lg hover:bg-blue-800 transition-colors">
                {editingHistoryId ? 'Update' : 'Save Payment'}
              </button>
              <button onClick={() => { setShowHistoryForm(false); setEditingHistoryId(null); setPendingReceipt(null); }}
                className="px-4 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-lg hover:bg-gray-200 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Date</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Tax Type</th>
                <th className="text-right py-2 px-3 font-semibold text-gray-600">Amount</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Reference</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Method</th>
                <th className="text-left py-2 px-3 font-semibold text-gray-600">Receipt</th>
                <th className="text-center py-2 px-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">
                    No payments recorded yet.
                  </td>
                </tr>
              ) : history.map(h => (
                <tr key={h.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 px-3 whitespace-nowrap">{new Date(h.date).toLocaleDateString('en-GB')}</td>
                  <td className="py-2 px-3">
                    <span className="px-1.5 py-0.5 text-xs rounded bg-blue-100 text-blue-800">{h.taxType.replace('PAYE (Pay As You Earn)', 'PAYE').replace('Withholding Tax (WHT)', 'WHT').replace('Development Levy', 'Dev. Levy').replace('Business Premises', 'Biz. Premises').replace('Direct Assessment', 'Direct Assess.')}</span>
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-medium">{formatNaira(h.amount)}</td>
                  <td className="py-2 px-3 font-mono text-gray-600 max-w-[120px] truncate">{h.reference || '-'}</td>
                  <td className="py-2 px-3 capitalize">{h.method}{h.bankName ? ' (' + h.bankName + ')' : ''}</td>
                  <td className="py-2 px-3">
                    {h.receiptData ? (
                      <button onClick={() => setExpandedReceipt(expandedReceipt === h.id ? null : h.id)}
                        className="text-blue-700 hover:text-blue-900 underline underline-offset-2">
                        {expandedReceipt === h.id ? 'Hide' : 'View'}
                      </button>
                    ) : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => {
                        setHistoryForm({ date: h.date.slice(0, 10), taxType: h.taxType, amount: String(h.amount), reference: h.reference, method: h.method, bankName: h.bankName, notes: h.notes });
                        setEditingHistoryId(h.id);
                        setPendingReceipt(h.receiptData ? { data: h.receiptData, name: h.receiptName } : null);
                        setShowHistoryForm(true);
                      }}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors" title="Edit">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                      </button>
                      <button onClick={() => {
                        const updated = history.filter(r => r.id !== h.id);
                        setHistory(updated);
                        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
                      }}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors" title="Delete">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {expandedReceipt && (() => {
          const rec = history.find(h => h.id === expandedReceipt);
          if (!rec || !rec.receiptData) return null;
          const isImage = rec.receiptName.match(/\.(png|jpg|jpeg|gif|webp|bmp)$/i);
          return (
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-700">Receipt: {rec.receiptName}</h4>
                <a href={rec.receiptData} download={rec.receiptName}
                  className="text-xs px-3 py-1 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors">
                  Download
                </a>
              </div>
              {isImage ? (
                <img src={rec.receiptData} alt="Receipt" className="max-h-96 rounded border border-gray-200" />
              ) : (
                <div className="bg-gray-50 rounded border border-gray-200 p-4 text-center text-sm text-gray-500">
                  PDF receipt attached. <a href={rec.receiptData} download={rec.receiptName} className="text-blue-700 underline">Click to download</a>.
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
