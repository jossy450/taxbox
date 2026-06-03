export default function CookiesPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Cookie Policy</h1>
        <p className="text-sm text-gray-500 mb-6">Last updated: June 2026</p>

        <div className="space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">1. What Are Cookies</h2>
            <p className="text-gray-700">
              Cookies are small text files stored on your device (computer, tablet, phone) when you visit a website.
              They help the website remember your preferences, login session, and other settings to improve your
              experience. This Cookie Policy explains how TaxBox NG uses cookies and similar technologies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">2. How We Use Cookies</h2>
            <p className="text-gray-700 mb-3">We use the following categories of cookies:</p>
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900">Essential / Strictly Necessary Cookies</h3>
                <p className="text-blue-800 text-sm mt-1">
                  These cookies are required for the Tool to function. They enable core features such as
                  user authentication (login session), navigation state, and data persistence. Without these
                  cookies, the Tool cannot operate properly.
                </p>
                <ul className="mt-2 text-xs text-blue-700 space-y-0.5">
                  <li><strong>taxbox_session</strong> — Stores your login session token (expires on logout)</li>
                  <li><strong>taxbox_consent</strong> — Records your cookie consent preference (1 year)</li>
                </ul>
              </div>

              <div className="bg-emerald-50 rounded-lg p-4">
                <h3 className="font-semibold text-emerald-900">Functional / Preference Cookies</h3>
                <p className="text-emerald-800 text-sm mt-1">
                  These cookies remember your preferences, such as sidebar state, selected tab, and calculator
                  input history, to provide a personalised experience.
                </p>
                <ul className="mt-2 text-xs text-emerald-700 space-y-0.5">
                  <li><strong>taxbox_sidebar</strong> — Sidebar collapsed/expanded state</li>
                  <li><strong>taxbox_prefs</strong> — User interface preferences</li>
                </ul>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900">Analytics Cookies (Opt-In)</h3>
                <p className="text-gray-700 text-sm mt-1">
                  With your consent, we may use lightweight analytics to understand how the Tool is used,
                  which features are most popular, and how we can improve. No personally identifiable
                  information is collected. Currently, no third-party analytics services are active.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">3. Your Cookie Choices</h2>
            <p className="text-gray-700 mb-3">
              When you first visit the Tool, you will be shown a cookie consent banner. You may:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li><strong>Accept All</strong> — Consent to all cookie categories</li>
              <li><strong>Essential Only</strong> — Accept only strictly necessary cookies</li>
              <li><strong>Customise</strong> — Select specific categories you wish to enable</li>
            </ul>
            <p className="text-gray-700 mt-3">
              You can change your preferences at any time by clearing your browser cookies or using the
              cookie settings link in the page footer.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Managing Cookies in Your Browser</h2>
            <p className="text-gray-700">
              Most web browsers allow you to control cookies through their settings. You can:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li>View and delete stored cookies</li>
              <li>Block third-party cookies</li>
              <li>Block all cookies (note: this may break the Tool's functionality)</li>
              <li>Set preferences for specific websites</li>
            </ul>
            <p className="text-gray-700 mt-3">
              Refer to your browser's help section for instructions:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1 text-xs">
              <li>Google Chrome: Settings → Privacy and Security → Cookies</li>
              <li>Mozilla Firefox: Options → Privacy & Security → Cookies and Site Data</li>
              <li>Safari: Preferences → Privacy → Cookies</li>
              <li>Microsoft Edge: Settings → Cookies and Site Permissions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">5. GDPR & NDPR Compliance</h2>
            <p className="text-gray-700">
              TaxBox NG complies with both the EU General Data Protection Regulation (GDPR) and the Nigerian
              Data Protection Regulation (NDPR). Our cookie usage is:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-1">
              <li><strong>Transparent</strong> — Clear explanation of what each cookie does</li>
              <li><strong>Consent-Based</strong> — Non-essential cookies require your explicit opt-in</li>
              <li><strong>Minimal</strong> — Only cookies essential to functionality are set by default</li>
              <li><strong>Revocable</strong> — You can withdraw consent at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Updates to This Policy</h2>
            <p className="text-gray-700">
              We may update this Cookie Policy from time to time. Any changes will be posted on this page
              with an updated revision date. We encourage you to review this page periodically.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">7. Contact</h2>
            <p className="text-gray-700">
              If you have questions about our use of cookies or this policy, please submit feedback through
              our Feedback page or contact our data protection team at <strong>privacy@taxbox.ng</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
