import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLocalStorage } from '../../hooks/useLocalStorage';

type ConsentLevel = 'essential' | 'all' | null;

export default function CookieConsentBanner() {
  const [consent, setConsent] = useLocalStorage<ConsentLevel>('taxbox_consent', null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (consent === null) {
      const timer = setTimeout(() => setVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, [consent]);

  if (!visible) return null;

  function accept(level: ConsentLevel) {
    setConsent(level);
    setVisible(false);
  }

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 bg-white/95 backdrop-blur border-t border-gray-200 shadow-2xl">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 text-sm text-gray-700">
          <p className="font-medium text-gray-900 mb-1">🍪 We value your privacy</p>
          <p>
            We use essential cookies to make the Tool work. With your consent, we may also use
            functional cookies to enhance your experience.{' '}
            <Link to="/app/cookies" className="text-blue-700 underline hover:text-blue-900">
              Learn more
            </Link>
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => accept('essential')}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
            Essential Only
          </button>
          <button onClick={() => accept('all')}
            className="px-5 py-2 text-sm bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors">
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
