'use client';

import { eachDayOfInterval, endOfWeek, startOfWeek } from 'date-fns';
import { getCategory, getLeader, groupByDate } from '@/lib/agenda-data';
import { fmt, toKey } from '@/lib/date';

export default function WeekView({ cursor, events, now, onSelect, onPickDay }) {
  const days = eachDayOfInterval({
    start: startOfWeek(cursor, { weekStartsOn: 1 }),
    end: endOfWeek(cursor, { weekStartsOn: 1 }),
  });
  const byDate = groupByDate(events);
  const todayKey = now ? toKey(now) : null;

  return (
    <div className="grid gap-3 md:grid-cols-7 md:gap-0 md:overflow-hidden md:rounded-2xl md:border md:border-navy-100 md:bg-white">
      {days.map((day, i) => {
        const key = toKey(day);
        const list = byDate[key] ?? [];
        const isToday = key === todayKey;
        return (
          <section
            key={key}
            aria-label={fmt(day, 'EEEE, d MMMM yyyy')}
            className={`flex flex-col rounded-xl border border-navy-100 md:min-h-[26rem] md:rounded-none md:border-0 ${
              i < 6 ? 'md:border-r' : ''
            } ${isToday ? 'bg-tan-50/60' : 'bg-white'}`}
          >
            <button
              type="button"
              onClick={() => onPickDay(day)}
              className={`focus-ring flex items-center justify-between border-b px-3 py-2.5 text-left md:flex-col md:items-start md:gap-0.5 ${
                isToday ? 'border-tan-200' : 'border-navy-100'
              }`}
            >
              <span className={`text-xs font-semibold ${isToday ? 'text-tan-800' : 'text-navy-500'}`}>
                {isToday ? 'Hari ini' : fmt(day, 'EEEE')}
              </span>
              <span className="font-serif text-xl text-navy-900">{fmt(day, 'd MMM')}</span>
            </button>
            <div className="flex-1 space-y-2 p-2">
              {list.length === 0 && <p className="px-1 py-2 text-xs text-navy-400">Tidak ada kegiatan</p>}
              {list.map((ev) => (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => onSelect(ev)}
                  className={`focus-ring block w-full rounded-lg border-l-[3px] bg-white p-2.5 text-left shadow-[0_1px_0_rgba(10,29,56,0.06)] ring-1 ring-navy-100 transition-colors hover:ring-navy-300 ${
                    getCategory(ev.category).border
                  }`}
                >
                  <span className="block text-xs font-semibold tabular-nums text-navy-600">
                    {ev.start}–{ev.end}
                  </span>
                  <span className="mt-1 line-clamp-3 block text-sm leading-snug text-navy-900">{ev.title}</span>
                  <span className="mt-1.5 block text-xs text-navy-500">{getLeader(ev.leader).short}</span>
                </button>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
