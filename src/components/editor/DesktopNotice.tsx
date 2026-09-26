import React, { useState, useEffect } from 'react';
import { Monitor, X } from 'lucide-react';

export const DesktopNotice: React.FC = () => {
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkWidth = () => {
      setIsSmallScreen(window.innerWidth < 1100);
    };

    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  if (!isSmallScreen || dismissed) return null;

  return (
    <div className="bg-amber-500/15 border-b border-amber-500/30 px-3 py-1.5 flex items-center justify-between text-xs text-amber-300 z-50 select-none">
      <div className="flex items-center gap-2">
        <Monitor className="w-3.5 h-3.5 shrink-0" />
        <span>Desktop editing experience recommended. For best precision, use a screen width of 1200px or higher.</span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="p-1 hover:bg-amber-500/20 rounded text-amber-200 transition-colors"
        aria-label="Dismiss warning"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
