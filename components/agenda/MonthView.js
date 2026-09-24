'use client';

import { eachDayOfInterval, endOfMonth, endOfWeek, isSameMonth, startOfMonth, startOfWeek } from 'date-fns';
import { getCategory, groupByDate } from '@/lib/agenda-data';
import { fmt, toKey } from '@/lib/date';
import { EventPill } from './parts';

const WEEKDAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

export default function MonthView({ cursor, events, now, onSelect, onPickDay }) {
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 }),
  });
  const byDate = groupByDate(events);
  const todayKey = now ? toKey(now) : null;

  return (
    <div className="overflow-hidden rounded-2xl border border-navy-100 bg-white">
      <div className="grid grid-cols-7 border-b border-navy-100 bg-navy-50/70 text-center text-xs font-semibold text-navy-600">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-2.5">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          const key = toKey(day);
          const list = byDate[key] ?? [];
          const inMonth = isSameMonth(day, cursor);
          const isToday = key === todayKey;
          return (
            <div
              key={key}
              className={`min-h-[4.5rem] border-navy-100 p-1 sm:min-h-[8rem] sm:p-2 ${i % 7 !== 6 ? 'border-r' : ''} ${
                i < days.length - 7 ? 'border-b' : ''
              } ${inMonth ? 'bg-white' : 'bg-navy-50/40'}`}
            >
              <button
                type="button"
                onClick={() => onPickDay(day)}
                className={`focus-ring flex h-7 w-7 items-center justify-center rounded-full text-sm tabular-nums transition-colors ${
                  isToday
                    ? 'bg-tan-400 font-semibold text-navy-950'
                    : inMonth
                      ? 'text-navy-800 hover:bg-navy-100'
                      : 'text-navy-300 hover:bg-navy-50'
                }`}
                aria-label={`${fmt(day, 'EEEE, d MMMM yyyy')}, ${list.length} kegiatan`}
              >
                {fmt(day, 'd')}
              </button>

              <div className="mt-1 hidden space-y-1 sm:block">
                {list.slice(0, 2).map((ev) => (
                  <EventPill key={ev.id} event={ev} onSelect={onSelect} />
                ))}
                {list.length > 2 && (
                  <button
                    type="button"
                    onClick={() => onPickDay(day)}
                    className="focus-ring rounded px-1 text-xs font-medium text-navy-500 hover:text-navy-900"
                  >
                    +{list.length - 2} lainnya
                  </button>
                )}
              </div>

              {list.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1 px-1 sm:hidden" aria-hidden>
                  {list.slice(0, 4).map((ev) => (
                    <span key={ev.id} className={`h-1.5 w-1.5 rounded-full ${getCategory(ev.category).dot}`} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
