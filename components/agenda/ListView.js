'use client';

import { Clock3, MapPin, SearchX, UserRound } from 'lucide-react';
import { getLeader, groupByDate } from '@/lib/agenda-data';
import { eventStatus, fmt, fromKey, toKey } from '@/lib/date';
import { CategoryChip, StatusBadge } from './parts';

export default function ListView({ events, now, onSelect, onReset, emptyHint }) {
  const groups = Object.entries(groupByDate(events));
  const todayKey = now ? toKey(now) : null;

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-dashed border-navy-200 bg-white px-6 py-16 text-center">
        <SearchX className="h-10 w-10 text-navy-300" aria-hidden />
        <p className="mt-4 font-serif text-xl text-navy-900">Agenda tidak ditemukan</p>
        <p className="mt-2 max-w-md text-sm text-navy-600">{emptyHint}</p>
        <button type="button" onClick={onReset} className="btn-ghost mt-6">Hapus pencarian dan filter</button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {groups.map(([date, list]) => (
        <section key={date} aria-label={fmt(fromKey(date), 'EEEE, d MMMM yyyy')}>
          <h3 className="sticky top-24 z-10 -mx-1 flex items-center gap-3 bg-white/95 px-1 py-2 backdrop-blur">
            <span className="font-serif text-lg text-navy-900">{fmt(fromKey(date), 'EEEE, d MMMM yyyy')}</span>
            {date === todayKey && <span className="rounded-full bg-tan-400 px-2 py-0.5 text-xs font-semibold text-navy-950">Hari ini</span>}
            <span className="h-px flex-1 bg-navy-100" aria-hidden />
          </h3>
          <ul className="mt-3 space-y-3">
            {list.map((ev) => (
              <li key={ev.id}>
                <button
                  type="button"
                  onClick={() => onSelect(ev)}
                  className="focus-ring grid w-full gap-3 rounded-xl border border-navy-100 bg-white p-4 text-left transition-colors hover:border-navy-300 sm:grid-cols-[7rem_1fr_auto] sm:items-start sm:gap-5 sm:p-5"
                >
                  <span className="flex items-center gap-2 text-sm font-semibold tabular-nums text-navy-700 sm:block">
                    <Clock3 className="h-4 w-4 text-tan-600 sm:hidden" aria-hidden />
                    {ev.start}
                    <span className="font-normal text-navy-400"> – {ev.end}</span>
                  </span>
                  <span className="min-w-0">
                    <span className="block font-medium leading-snug text-navy-900">{ev.title}</span>
                    <span className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-navy-600">
                      <span className="inline-flex items-center gap-1.5">
                        <UserRound className="h-3.5 w-3.5 text-navy-400" aria-hidden />
                        {getLeader(ev.leader).name}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-navy-400" aria-hidden />
                        {ev.location}
                      </span>
                    </span>
                  </span>
                  <span className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
                    <CategoryChip category={ev.category} />
                    <StatusBadge status={eventStatus(ev, now)} />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
