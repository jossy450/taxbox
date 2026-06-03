export default function DisclaimerPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Legal Disclaimer</h1>
        <p className="text-sm text-gray-500 mb-6">Last updated: June 2026</p>

        <div className="prose prose-gray max-w-none space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">1. General Information Only</h2>
            <p className="text-gray-700">
              The TaxBox NG Lagos PAYE 2026 Calculator ("the Tool") is provided for general informational and
              estimation purposes only. It is designed to help individuals, HR professionals, and tax consultants
              estimate Pay-As-You-Earn (PAYE) tax liabilities under the Nigeria Tax Act (NTA) 2026 as it applies
              to Lagos State. The Tool does <strong>not</strong> constitute professional tax advice, legal advice,
              or a formal tax filing.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">2. No Professional Relationship</h2>
            <p className="text-gray-700">
              Use of this Tool does not create a client-advisor, accountant-client, or lawyer-client relationship
              between you and TaxBox NG, its developers, or any associated tax professionals. You should always
              consult a qualified tax practitioner or the Lagos State Internal Revenue Service (LIRS) for advice
              specific to your circumstances.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">3. Accuracy of Calculations</h2>
            <p className="text-gray-700">
              While every effort has been made to ensure the Tool accurately reflects the NTA 2026 tax brackets,
              Rent Relief Allowance (RRA) rules, statutory deduction rates (NHF, NHIS, Pension, Life Assurance),
              and LIRS filing requirements, we make no guarantees—express or implied—regarding the completeness,
              accuracy, or timeliness of the calculations. Tax laws and interpretations may change, and local
              variations (such as Lagos State-specific addendums) may apply.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">4. No Liability</h2>
            <p className="text-gray-700">
              To the maximum extent permitted by Nigerian law, TaxBox NG, its operators, contributors, and
              licensors shall not be held liable for any direct, indirect, incidental, consequential, or special
              damages arising out of or in any way connected with the use of—or inability to use—this Tool,
              including but not limited to reliance on calculated figures for tax filings, payroll processing,
              financial planning, or regulatory compliance. You assume full responsibility for any decisions
              made based on the Tool's output.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">5. User Responsibility</h2>
            <p className="text-gray-700">
              You are solely responsible for:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Verifying the accuracy of all input data (salary figures, rent amounts, deduction rates, etc.)</li>
              <li>Cross-checking computed results against official LIRS PAYE tables or your payroll software</li>
              <li>Ensuring compliance with all applicable tax laws, regulations, and filing deadlines</li>
              <li>Retaining appropriate records and documentation (e.g., rent receipts for RRA claims)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">6. No Guarantee of Continuous Service</h2>
            <p className="text-gray-700">
              We reserve the right to modify, suspend, or discontinue the Tool (or any part thereof) at any time
              without prior notice. We shall not be liable to you or any third party for any modification,
              suspension, or discontinuation.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">7. Third-Party Links</h2>
            <p className="text-gray-700">
              The Tool may contain links to third-party websites or services (e.g., LIRS portal, FIRS website).
              We do not endorse, control, or assume responsibility for the content, privacy policies, or practices
              of any third-party sites.
            </p>
          </section>

          <section className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-amber-900 mb-2">Important Notice</h2>
            <p className="text-amber-800">
              This Tool is a <strong>planning aid</strong>, not a substitute for professional tax advice.
              Tax laws are complex and subject to change. Always consult a licensed tax professional or
              the Lagos State Internal Revenue Service (LIRS) before making financial decisions or filing returns.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
