import { useState, useEffect } from 'react';

export interface WalkthroughStep {
  title: string;
  description: string;
  icon: string;
}

interface WalkthroughGuideProps {
  steps: WalkthroughStep[];
  storageKey: string;
}

export default function WalkthroughGuide({ steps, storageKey }: WalkthroughGuideProps) {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const seen = localStorage.getItem(storageKey);
    if (!seen) {
      const timer = setTimeout(() => setActive(true), 600);
      return () => clearTimeout(timer);
    }
  }, [storageKey]);

  function dismiss() {
    localStorage.setItem(storageKey, '1');
    setActive(false);
  }

  function next() {
    if (step < steps.length - 1) {
      setStep(s => s + 1);
    } else {
      dismiss();
    }
  }

  function prev() {
    if (step > 0) setStep(s => s - 1);
  }

  if (!active) return null;

  const s = steps[step];

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={dismiss} />
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-md mx-4">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6">
          <div className="flex items-start gap-4 mb-4">
            <span className="text-3xl">{s.icon}</span>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm">{s.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{s.description}</p>
            </div>
          </div>

          {steps.length > 1 && (
            <div className="flex justify-center gap-1.5 mb-4">
              {steps.map((_, i) => (
                <span key={i} className={`w-2 h-2 rounded-full ${i === step ? 'bg-blue-900' : 'bg-gray-200'}`} />
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <button onClick={dismiss} className="text-xs text-gray-400 hover:text-gray-600">
              {step < steps.length - 1 ? 'Skip' : 'Done'}
            </button>
            <div className="flex gap-2">
              {step > 0 && (
                <button onClick={prev}
                  className="px-4 py-1.5 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50">
                  Back
                </button>
              )}
              <button onClick={next}
                className="px-4 py-1.5 bg-blue-900 text-white text-sm rounded-lg hover:bg-blue-800">
                {step < steps.length - 1 ? `Next (${step + 1}/${steps.length})` : `Got it`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
