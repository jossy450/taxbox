export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-2">Last updated: June 2026</p>
        <p className="text-sm text-gray-500 mb-6">
          Compliant with the Nigerian Data Protection Regulation (NDPR) and EU General Data Protection Regulation (GDPR)
        </p>

        <div className="space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Who We Are</h2>
            <p className="text-gray-700">
              TaxBox NG ("we", "our", "us") operates the Lagos PAYE 2026 Calculator tool ("the Tool").
              We are committed to protecting your privacy and handling your data transparently.
              This policy explains what data we collect, why we collect it, and your rights regarding your data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Data We Collect</h2>
            <div className="space-y-3">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900">a. Information You Provide</h3>
                <ul className="list-disc pl-5 text-blue-800 text-sm mt-2 space-y-1">
                  <li><strong>Account Data:</strong> Name, email address, role (individual, corporate, consultant, admin), and optional company name when you register</li>
                  <li><strong>Calculation Inputs:</strong> Salary components (basic, housing, transport, allowances), rent details, and deduction preferences you enter into the calculator</li>
                  <li><strong>Employee Data (Corporate Users):</strong> Names, salary details, and payroll information you upload or enter for batch processing</li>
                  <li><strong>Feedback:</strong> Comments, suggestions, and ratings you submit through the Feedback page</li>
                </ul>
              </div>

              <div className="bg-emerald-50 rounded-lg p-4">
                <h3 className="font-semibold text-emerald-900">b. Information Collected Automatically</h3>
                <ul className="list-disc pl-5 text-emerald-800 text-sm mt-2 space-y-1">
                  <li><strong>Usage Data:</strong> Pages visited, features used, time spent on the Tool (anonymised analytics with consent)</li>
                  <li><strong>Device Data:</strong> Browser type, operating system, screen resolution (for optimising the Tool)</li>
                  <li><strong>Cookies:</strong> Essential session cookies and preference cookies (see our Cookie Policy)</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">3. How We Use Your Data</h2>
            <p className="text-gray-700 mb-2">Your data is used solely for the following purposes:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>To provide and maintain the Tool's core functionality (PAYE calculation, batch processing, comparisons)</li>
              <li>To personalise your experience and remember your preferences</li>
              <li>To improve the Tool based on usage patterns and feedback</li>
              <li>To communicate with you regarding account or subscription changes (if applicable)</li>
              <li>To comply with legal obligations under NDPR and applicable Nigerian tax laws</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Legal Basis for Processing (GDPR)</h2>
            <p className="text-gray-700 mb-2">Under GDPR Article 6, we process your data on the following bases:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li><strong>Consent:</strong> For non-essential cookies, analytics, and marketing communications (you may withdraw at any time)</li>
              <li><strong>Contract:</strong> To provide the Tool's services as requested by you (calculation, payroll processing)</li>
              <li><strong>Legal Obligation:</strong> To maintain records as required by Nigerian tax law and data protection regulations</li>
              <li><strong>Legitimate Interest:</strong> To improve the Tool, ensure security, and prevent fraud</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Data Storage & Retention</h2>
            <p className="text-gray-700">
              By default, all data you enter into the Tool is stored <strong>locally in your browser</strong>
              using localStorage (a standard web storage mechanism). This means:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1 mt-2">
              <li>Your data stays on your device unless you explicitly export or share it</li>
              <li>Clearing your browser data will delete all locally stored information</li>
              <li>We do not automatically transmit your data to any external server</li>
              <li>Feedback submissions are stored locally and can be exported as CSV by you or your administrator</li>
            </ul>
            <p className="text-gray-700 mt-3">
              In future cloud-hosted deployments, data will be encrypted at rest and in transit using AES-256
              and TLS 1.3. Retention periods will be clearly defined and communicated.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Data Sharing & Third Parties</h2>
            <p className="text-gray-700">
              We do <strong>not</strong> sell, rent, or share your personal data with third parties for their
              marketing purposes. We may share data only:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>With your explicit consent</li>
              <li>To comply with a legal obligation or court order from a Nigerian jurisdiction</li>
              <li>To protect the rights, property, or safety of TaxBox NG, our users, or the public</li>
            </ul>
            <p className="text-gray-700 mt-3">
              We do not use third-party analytics, advertising, or tracking services that would result in
              your data being transferred outside Nigeria or the EU/EEA.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">7. Your Rights (GDPR & NDPR)</h2>
            <p className="text-gray-700 mb-3">You have the following rights regarding your personal data:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { title: 'Right of Access', desc: 'Request a copy of the data we hold about you' },
                { title: 'Right to Rectification', desc: 'Correct inaccurate or incomplete data' },
                { title: 'Right to Erasure', desc: 'Request deletion of your data (subject to legal retention)' },
                { title: 'Right to Restrict Processing', desc: 'Limit how we use your data' },
                { title: 'Right to Data Portability', desc: 'Receive your data in a structured, machine-readable format' },
                { title: 'Right to Object', desc: 'Object to processing based on legitimate interest' },
                { title: 'Right to Withdraw Consent', desc: 'Withdraw consent at any time without affecting service' },
                { title: 'Right to Lodge Complaint', desc: 'File a complaint with NDPC (Nigeria) or your local DPA' },
              ].map((r, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-3">
                  <h4 className="font-semibold text-gray-900 text-xs">{r.title}</h4>
                  <p className="text-gray-600 text-xs mt-0.5">{r.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">8. Children's Privacy</h2>
            <p className="text-gray-700">
              The Tool is not intended for individuals under the age of 18. We do not knowingly collect
              personal data from minors. If we become aware that a minor has provided us with personal data,
              we will delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">9. Security</h2>
            <p className="text-gray-700">
              We implement appropriate technical and organisational measures to protect your data against
              unauthorised access, alteration, disclosure, or destruction. These include:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>Encrypted data storage (AES-256 for any server-side data)</li>
              <li>Secure HTTPS/TLS 1.3 connections</li>
              <li>Regular security audits and dependency vulnerability scanning</li>
              <li>Minimal data collection principle — we only collect what is necessary</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">10. International Transfers</h2>
            <p className="text-gray-700">
              Your data is stored and processed within Nigeria. We do not transfer your personal data to
              countries outside Nigeria or the European Economic Area. If future infrastructure requires
              data transfer, we will ensure appropriate safeguards (Standard Contractual Clauses or
              Adequacy Decisions) are in place.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">11. Changes to This Policy</h2>
            <p className="text-gray-700">
              We may update this Privacy Policy to reflect changes in legal requirements or our practices.
              Significant changes will be notified via the Tool. Continued use after changes constitutes
              acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">12. Contact & Complaints</h2>
            <p className="text-gray-700">For privacy-related inquiries or to exercise your rights:</p>
            <div className="bg-gray-50 rounded-lg p-4 mt-2 text-sm">
              <p><strong>Email:</strong> privacy@taxbox.ng</p>
              <p><strong>Data Protection Officer:</strong> DPO Team, TaxBox NG</p>
              <p className="mt-2">
                <strong>Nigerian Data Protection Commission (NDPC):</strong><br />
                You have the right to lodge a complaint with the NDPC if you believe your data protection
                rights have been violated: <span className="text-blue-700">www.ndpc.gov.ng</span>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
