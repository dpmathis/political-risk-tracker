'use client';

interface RiskViewToggleProps {
  view: 'national' | 'state';
  onViewChange: (view: 'national' | 'state') => void;
}

export default function RiskViewToggle({ view, onViewChange }: RiskViewToggleProps) {
  return (
    <div className="flex items-center justify-center gap-2 p-1 bg-navy/10 dark:bg-cream/10 rounded-lg">
      <button
        onClick={() => onViewChange('national')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
          view === 'national'
            ? 'bg-navy text-white dark:bg-gold dark:text-navy shadow-ln-light'
            : 'text-navy/70 dark:text-cream/70 hover:text-navy dark:hover:text-cream'
        }`}
      >
        National View
      </button>
      <button
        onClick={() => onViewChange('state')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
          view === 'state'
            ? 'bg-navy text-white dark:bg-gold dark:text-navy shadow-ln-light'
            : 'text-navy/70 dark:text-cream/70 hover:text-navy dark:hover:text-cream'
        }`}
      >
        State View
      </button>
    </div>
  );
}
