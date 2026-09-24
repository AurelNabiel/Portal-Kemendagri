'use client';

import { getCategory } from '@/lib/agenda-data';

export function CategoryChip({ category, className = '' }) {
  const c = getCategory(category);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${c.chip} ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} aria-hidden />
      {c.label}
    </span>
  );
}

export function StatusBadge({ status }) {
  if (status === 'berlangsung') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-tan-100 px-2.5 py-0.5 text-xs font-semibold text-tan-800">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-tan-500" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-tan-600" />
        </span>
        Sedang berlangsung
      </span>
    );
  }
  if (status === 'selesai') {
    return <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">Selesai</span>;
  }
  return <span className="inline-flex rounded-full bg-navy-50 px-2.5 py-0.5 text-xs font-medium text-navy-600">Terjadwal</span>;
}

/** Pil kecil untuk kalender bulanan */
export function EventPill({ event, onSelect }) {
  const c = getCategory(event.category);
  return (
    <button
      type="button"
      onClick={() => onSelect(event)}
      className={`focus-ring block w-full truncate rounded-md border-l-[3px] bg-navy-50/70 px-1.5 py-1 text-left text-xs text-navy-800 transition-colors hover:bg-navy-100 ${c.border}`}
      title={`${event.start} ${event.title}`}
    >
      <span className="font-semibold tabular-nums text-navy-600">{event.start}</span> {event.title}
    </button>
  );
}
