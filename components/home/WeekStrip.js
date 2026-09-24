'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { addDays, startOfWeek } from 'date-fns';
import { ArrowUpRight } from 'lucide-react';
import { useAgenda } from '@/context/AgendaProvider';
import { useNow } from '@/hooks/useNow';
import { getCategory, groupByDate } from '@/lib/agenda-data';
import { fmt, toKey } from '@/lib/date';

export default function WeekStrip() {
  const { publicEvents, ready } = useAgenda();
  const now = useNow(60_000);

  const days = useMemo(() => {
    if (!now) return [];
    const start = startOfWeek(now, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [now]);
  const byDate = useMemo(() => groupByDate(publicEvents), [publicEvents]);
  const todayKey = now ? toKey(now) : null;

  return (
    <section className="kawung-light">
      <div className="container-page py-16 sm:py-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-serif text-3xl text-navy-900">Minggu ini</h2>
            <p className="mt-2 max-w-xl text-navy-600">
              Ringkasan kegiatan pimpinan dari Senin hingga Minggu. Pilih tanggal untuk melihat rincian jadwal.
            </p>
          </div>
          <Link href="/agenda?view=minggu" className="btn-ghost self-start sm:self-auto">
            Buka tampilan mingguan
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {(!ready || !now ? Array.from({ length: 7 }) : days).map((day, i) => {
            if (!day) return <li key={i} className="h-40 animate-pulse rounded-xl bg-navy-50" />;
            const key = toKey(day);
            const list = byDate[key] ?? [];
            const isToday = key === todayKey;
            const isPast = key < todayKey;
            return (
              <li key={key}>
                <Link
                  href={`/agenda?view=hari&date=${key}`}
                  className={`focus-ring flex h-full min-h-[10rem] flex-col rounded-xl border bg-white p-4 transition-colors ${
                    isToday ? 'border-tan-400 bg-tan-50 ring-1 ring-tan-300' : 'border-navy-100 hover:border-navy-300'
                  }`}
                >
                  <span className="flex items-baseline justify-between">
                    <span className={`text-sm ${isToday ? 'font-semibold text-tan-800' : 'text-navy-500'}`}>
                      {isToday ? 'Hari ini' : fmt(day, 'EEEE')}
                    </span>
                    <span className={`font-serif text-2xl ${isPast ? 'text-navy-300' : 'text-navy-900'}`}>{fmt(day, 'd')}</span>
                  </span>
                  {list.length ? (
                    <>
                      <span className="mt-3 line-clamp-3 text-sm leading-snug text-navy-800">
                        <span className="font-semibold tabular-nums text-navy-600">{list[0].start}</span> {list[0].title}
                      </span>
                      <span className="mt-auto flex items-center justify-between pt-3">
                        <span className="flex gap-1" aria-hidden>
                          {list.map((ev) => (
                            <span key={ev.id} className={`h-1.5 w-1.5 rounded-full ${getCategory(ev.category).dot}`} />
                          ))}
                        </span>
                        <span className="text-xs text-navy-500">{list.length} kegiatan</span>
                      </span>
                    </>
                  ) : (
                    <span className="mt-3 text-sm text-navy-400">Tidak ada agenda</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
