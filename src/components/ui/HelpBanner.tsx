import { useState } from 'react';

interface HelpBannerProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export default function HelpBanner({ title, defaultOpen = false, children }: HelpBannerProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-blue-600 text-lg">ℹ️</span>
          <span className="font-medium text-blue-900 text-sm">{title}</span>
        </div>
        <span className={`text-blue-400 text-xs transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-blue-800 space-y-2">
          {children}
        </div>
      )}
    </div>
  );
}
