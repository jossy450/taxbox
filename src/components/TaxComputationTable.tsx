import { formatNaira } from './TaxChart'
import type { PayeResult } from '../engine/types'

interface ComputationRow {
  label: string
  annual: string
  monthly: string
  bold?: boolean
  indent?: boolean
  borderTop?: boolean
  borderBottom?: boolean
  total?: boolean
}

function buildRows(result: PayeResult, is2026: boolean): ComputationRow[] {
  const rows: ComputationRow[] = [
    {
      label: 'ANNUAL GROSS INCOME',
      annual: formatNaira(result.grossIncome),
      monthly: formatNaira(result.monthly.grossPay),
      bold: true,
    },
  ];

  if (is2026) {
    if (result.statutoryDeductions.pension > 0) {
      rows.push({
        label: 'Less: Pension (8% of BHT)',
        annual: `(${formatNaira(result.statutoryDeductions.pension)})`,
        monthly: `(${formatNaira(result.statutoryDeductions.pension / 12)})`,
        indent: true,
      });
    }
    if (result.statutoryDeductions.nhf > 0) {
      rows.push({
        label: 'Less: NHF (2.5% of Basic)',
        annual: `(${formatNaira(result.statutoryDeductions.nhf)})`,
        monthly: `(${formatNaira(result.statutoryDeductions.nhf / 12)})`,
        indent: true,
      });
    }
    if (result.statutoryDeductions.nhis > 0) {
      rows.push({
        label: 'Less: NHIS',
        annual: `(${formatNaira(result.statutoryDeductions.nhis)})`,
        monthly: `(${formatNaira(result.statutoryDeductions.nhis / 12)})`,
        indent: true,
      });
    }
    if (result.statutoryDeductions.lifeAssurance > 0) {
      rows.push({
        label: 'Less: Life Assurance',
        annual: `(${formatNaira(result.statutoryDeductions.lifeAssurance)})`,
        monthly: `(${formatNaira(result.statutoryDeductions.lifeAssurance / 12)})`,
        indent: true,
      });
    }
    if (result.rentRelief > 0) {
      rows.push({
        label: 'Less: Rent Relief',
        annual: `(${formatNaira(result.rentRelief)})`,
        monthly: `(${formatNaira(result.rentRelief / 12)})`,
        indent: true,
      });
    }
  } else {
    rows.push({
      label: 'Less: Pension (8%)',
      annual: `(${formatNaira(result.statutoryDeductions.pension)})`,
      monthly: `(${formatNaira(result.statutoryDeductions.pension / 12)})`,
      indent: true,
    });
    rows.push({
      label: 'Less: CRA (Consolidated Relief)',
      annual: `(${formatNaira(result.rentRelief)})`,
      monthly: `(${formatNaira(result.rentRelief / 12)})`,
      indent: true,
    });
  }

  rows.push({
    label: 'CHARGEABLE INCOME',
    annual: formatNaira(result.chargeableIncome),
    monthly: formatNaira(result.chargeableIncome / 12),
    bold: true,
    borderTop: true,
    borderBottom: true,
  });

  if (result.taxBrackets.length > 0) {
    for (const b of result.taxBrackets) {
      rows.push({
        label: `${b.label} @ ${(b.rate * 100).toFixed(0)}%`,
        annual: formatNaira(b.taxInBand),
        monthly: formatNaira(b.taxInBand / 12),
        indent: true,
      });
    }
  }

  rows.push({
    label: 'ANNUAL TAX DUE',
    annual: formatNaira(result.totalTax),
    monthly: formatNaira(result.monthly.taxDeducted),
    bold: true,
    total: true,
    borderTop: true,
  });

  rows.push({
    label: 'MONTHLY TAX DUE',
    annual: '',
    monthly: formatNaira(result.monthly.taxDeducted),
    bold: true,
    total: true,
  });

  rows.push({
    label: 'NET PAY (After Tax)',
    annual: formatNaira(result.netIncome),
    monthly: formatNaira(result.monthly.netPay),
    bold: true,
    borderTop: true,
  });

  rows.push({
    label: 'Effective Tax Rate',
    annual: `${(result.effectiveTaxRate * 100).toFixed(2)}%`,
    monthly: '',
    borderTop: true,
  });

  return rows;
}

interface Props {
  result: PayeResult
  employeeName?: string
  employeeDesignation?: string
  regime: '2026' | 'old'
}

export default function TaxComputationTable({ result, employeeName, employeeDesignation, regime }: Props) {
  const rows = buildRows(result, regime === '2026');

  const handleDownloadCsv = () => {
    const csvRows = [
      ['Description', 'Annual (₦)', 'Monthly (₦)'],
      ...rows.map(r => [r.label, r.annual || '0', r.monthly || '0'])
    ];
    const csvContent = csvRows.map(row =>
      row.map(cell => '"' + cell.replace(/"/g, '""') + '"').join(',')
    ).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tax_computation_' + regime + '_' + new Date().toISOString().slice(0, 10) + '.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }
    const styles = Array.from(document.styleSheets)
      .map(s => {
        try {
          return Array.from(s.cssRules).map(r => r.cssText).join('');
        } catch { return ''; }
      }).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Tax Computation - ${regime === '2026' ? '2026 NTA Regime' : 'Old PITA Regime'}</title>
        <style>
          ${styles}
          body { font-family: 'Courier New', monospace; padding: 40px; color: #000; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { padding: 8px 12px; text-align: left; border: none; }
          th { background: #1e3a5f; color: white; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
          tr.border-top td { border-top: 2px solid #000; }
          tr.border-bottom td { border-bottom: 2px solid #000; }
          tr.total td { border-top: 2px solid #000; font-weight: bold; }
          td.indent { padding-left: 32px; }
          td.bold { font-weight: bold; }
          td.amount { text-align: right; font-family: 'Courier New', monospace; }
          .header { text-align: center; margin-bottom: 10px; }
          .header h1 { font-size: 16px; margin: 0; text-transform: uppercase; letter-spacing: 2px; }
          .header h2 { font-size: 13px; margin: 4px 0; font-weight: normal; }
          .header .sub { font-size: 11px; color: #555; }
          .footer { margin-top: 30px; font-size: 10px; text-align: center; color: #888; border-top: 1px solid #ccc; padding-top: 10px; }
          .print\\:hidden { display: none !important; }
          @page { margin: 1.5cm; }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>TAX COMPUTATION SUMMARY</h1>
      <h2>${regime === '2026' ? '2026 NTA REGIME (NEW)' : 'OLD PITA REGIME'}</h2>
      ${employeeName ? `<p class="sub">Employee: ${employeeName}${employeeDesignation ? ` &mdash; ${employeeDesignation}` : ''}</p>` : ''}
    </div>
    <table>
      <thead>
        <tr>
          <th style="width:50%">Description</th>
          <th style="width:25%" class="amount">Annual (&#x20A6;)</th>
          <th style="width:25%" class="amount">Monthly (&#x20A6;)</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map(r => `
          <tr class="${r.borderTop ? 'border-top' : ''} ${r.borderBottom ? 'border-bottom' : ''} ${r.total ? 'total' : ''}">
            <td class="${r.bold ? 'bold' : ''} ${r.indent ? 'indent' : ''}">${r.label}</td>
            <td class="amount ${r.bold ? 'bold' : ''}">${r.annual || '-'}</td>
            <td class="amount ${r.bold ? 'bold' : ''}">${r.monthly || '-'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    <div class="footer">
      Generated by TaxBox &mdash; Lagos State PAYE Calculator &mdash; ${new Date().toLocaleDateString('en-GB')}
    </div>
    <script>window.onload = function() { window.print(); window.close(); }</script>
  </body>
  </html>
`);
    printWindow.document.close();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden print-area">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between no-print">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
          Tax Computation Table
        </h3>
        <div className="flex items-center gap-2">
          <button onClick={handlePrint}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
            </svg>
            Print / Download PDF
          </button>
          <button onClick={handleDownloadCsv}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            CSV
          </button>
        </div>
      </div>
      <div className="p-4">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b-2 border-gray-800">
              <th className="text-left py-2 px-1 font-bold text-gray-800 uppercase tracking-wider text-[10px]">Description</th>
              <th className="text-right py-2 px-1 font-bold text-gray-800 uppercase tracking-wider text-[10px]">Annual (₦)</th>
              <th className="text-right py-2 px-1 font-bold text-gray-800 uppercase tracking-wider text-[10px]">Monthly (₦)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}
                className={[
                  r.borderTop ? 'border-t-2 border-gray-700' : '',
                  r.borderBottom ? 'border-b-2 border-gray-700' : '',
                  r.total ? 'border-t-2 border-gray-800' : '',
                  i < rows.length - 1 && !r.borderBottom ? 'border-b border-gray-100' : '',
                ].filter(Boolean).join(' ')}
              >
                <td className={`py-1.5 px-1 ${r.bold ? 'font-bold text-gray-900' : 'text-gray-600'} ${r.indent ? 'pl-5' : ''}`}>
                  {r.label}
                </td>
                <td className={`py-1.5 px-1 text-right font-mono ${r.bold ? 'font-bold text-gray-900' : 'text-gray-600'}`}>
                  {r.annual || '-'}
                </td>
                <td className={`py-1.5 px-1 text-right font-mono ${r.bold ? 'font-bold text-gray-900' : 'text-gray-600'}`}>
                  {r.monthly || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
