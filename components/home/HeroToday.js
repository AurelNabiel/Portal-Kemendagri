'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, CalendarDays, CalendarRange, MapPin, Search } from 'lucide-react';
import { useAgenda } from '@/context/AgendaProvider';
import { useNow } from '@/hooks/useNow';
import { getLeader } from '@/lib/agenda-data';
import { eventProgress, eventStatus, fmt, humanizeMinutes, minutesUntil, toKey } from '@/lib/date';
import { StatusBadge } from '@/components/agenda/parts';

const EASE = [0.22, 1, 0.36, 1];
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } } };
const rise = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } };

export default function HeroToday() {
  const router = useRouter();
  const [q, setQ] = useState('');

  const onSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams({ view: 'daftar' });
    if (q.trim()) params.set('q', q.trim());
    router.push(`/agenda?${params}`);
  };

  return (
    <section className="relative overflow-hidden bg-navy-900 text-white">
      <div className="kawung absolute inset-0" aria-hidden />
      <div
        className="absolute -right-40 top-1/2 h-[520px] w-[520px] -translate-y-1/2 rounded-full bg-navy-700/40 blur-3xl"
        aria-hidden
      />
      <div className="container-page relative grid items-center gap-12 py-14 sm:py-16 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-24">
        <motion.div variants={stagger} initial="hidden" animate="show">
          <motion.p variants={rise} className="text-sm font-medium text-tan-200">
            Portal Informasi Kementerian Dalam Negeri
          </motion.p>
          <motion.h1
            variants={rise}
            className="mt-4 max-w-xl font-serif text-[2.35rem] leading-[1.12] sm:text-5xl lg:text-[3.4rem]"
          >
            Agenda pimpinan, terbuka dan dapat dipantau setiap hari.
          </motion.h1>
          <motion.p variants={rise} className="mt-5 max-w-lg text-lg leading-relaxed text-navy-100">
            Ikuti jadwal kegiatan Menteri, Wakil Menteri, dan pejabat pimpinan tinggi dalam tampilan harian,
            mingguan, maupun bulanan.
          </motion.p>

          <motion.form variants={rise} onSubmit={onSubmit} role="search" className="mt-8 flex max-w-lg gap-2">
            <label htmlFor="cari-hero" className="sr-only">Cari agenda</label>
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" aria-hidden />
              <input
                id="cari-hero"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari kegiatan, lokasi, atau pimpinan"
                className="h-12 w-full rounded-lg border-0 bg-white pl-10 pr-3 text-[15px] text-navy-900 placeholder:text-navy-400 focus:outline-none focus:ring-2 focus:ring-tan-400"
              />
            </div>
            <button type="submit" className="btn-accent h-12 px-5">Cari</button>
          </motion.form>

          <motion.div variants={rise} className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link href="/agenda?view=bulan" className="focus-ring inline-flex items-center gap-2 rounded text-navy-100 hover:text-white">
              <CalendarDays className="h-4 w-4 text-tan-300" aria-hidden />
              Kalender bulan ini
            </Link>
            <Link href="/agenda?view=minggu" className="focus-ring inline-flex items-center gap-2 rounded text-navy-100 hover:text-white">
              <CalendarRange className="h-4 w-4 text-tan-300" aria-hidden />
              Agenda minggu ini
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7, ease: EASE }}
        >
          <TodayPanel />
        </motion.div>
      </div>
      <div className="h-1 bg-tan-400" aria-hidden />
    </section>
  );
}

function TodayPanel() {
  const { publicEvents, ready } = useAgenda();
  const now = useNow(1000);
  const todayKey = now ? toKey(now) : null;
  const todays = useMemo(() => publicEvents.filter((e) => e.date === todayKey), [publicEvents, todayKey]);

  const current = now && todays.find((e) => eventStatus(e, now) === 'berlangsung');
  const next = now && todays.find((e) => eventStatus(e, now) === 'akan');

  return (
    <div className="rounded-2xl bg-white p-5 text-navy-900 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.55)] sm:p-7">
      <div className="flex items-end justify-between gap-4 border-b border-navy-100 pb-5">
        <div>
          <p className="text-sm font-medium text-tan-700">Hari ini</p>
          <p className="mt-0.5 text-sm text-navy-500" suppressHydrationWarning>
            {now ? fmt(now, 'EEEE, d MMMM yyyy') : '\u00A0'}
          </p>
        </div>
        <LiveClock now={now} />
      </div>

      <ol className="relative mt-5 space-y-1" aria-label="Agenda publik hari ini">
        {!ready || !now ? (
          [0, 1, 2, 3].map((i) => <li key={i} className="h-14 animate-pulse rounded-lg bg-navy-50" />)
        ) : todays.length === 0 ? (
          <li className="rounded-lg bg-navy-50 px-4 py-6 text-sm text-navy-600">
            Tidak ada agenda publik hari ini.{' '}
            <Link href="/agenda?view=minggu" className="font-medium text-navy-800 underline underline-offset-4">
              Lihat agenda minggu ini
            </Link>
          </li>
        ) : (
          todays.map((ev) => <TimelineRow key={ev.id} event={ev} now={now} />)
        )}
      </ol>

      <div className="mt-5 flex flex-col gap-3 border-t border-navy-100 pt-5 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-navy-600">
          {!now || !ready
            ? '\u00A0'
            : current
              ? `Kegiatan berikutnya ${next ? `pukul ${next.start} WIB` : 'tidak ada lagi hari ini'}.`
              : next
                ? `Berikutnya dalam ${humanizeMinutes(minutesUntil(next, now))}.`
                : todays.length
                  ? 'Seluruh agenda hari ini telah selesai.'
                  : '\u00A0'}
        </p>
        <Link
          href="/agenda?view=hari"
          className="focus-ring inline-flex items-center gap-1 rounded font-semibold text-navy-700 hover:text-navy-900"
        >
          Lihat detail hari ini
          <ArrowUpRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </div>
  );
}

function TimelineRow({ event, now }) {
  const status = eventStatus(event, now);
  const live = status === 'berlangsung';
  const done = status === 'selesai';
  const progress = eventProgress(event, now);

  return (
    <li>
      <Link
        href={`/agenda?view=hari&date=${event.date}&event=${event.id}`}
        className={`focus-ring group grid grid-cols-[3.25rem_1fr] gap-3 rounded-lg px-2 py-2.5 transition-colors ${
          live ? 'bg-tan-50 ring-1 ring-tan-200' : 'hover:bg-navy-50'
        }`}
      >
        <span className={`pt-0.5 text-sm font-semibold tabular-nums ${done ? 'text-navy-300' : 'text-navy-700'}`}>
          {event.start}
        </span>
        <span className="min-w-0">
          <span className={`block text-[15px] leading-snug ${done ? 'text-navy-400' : 'text-navy-900'} ${live ? 'font-semibold' : ''}`}>
            {event.title}
          </span>
          <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-navy-500">
            <span>{getLeader(event.leader).short}</span>
            {live && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" aria-hidden />
                {event.location}
              </span>
            )}
          </span>
          {live && (
            <span className="mt-2.5 block">
              <span className="mb-1.5 flex items-center justify-between">
                <StatusBadge status="berlangsung" />
                <span className="text-xs tabular-nums text-tan-800">s.d. {event.end}</span>
              </span>
              <span className="block h-1.5 overflow-hidden rounded-full bg-tan-100" aria-hidden>
                <motion.span
                  className="block h-full rounded-full bg-tan-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, ease: EASE }}
                />
              </span>
            </span>
          )}
        </span>
      </Link>
    </li>
  );
}

function LiveClock({ now }) {
  const text = now ? fmt(now, 'HH:mm:ss') : '--:--:--';
  return (
    <div className="text-right" role="timer" aria-label={`Pukul ${text} WIB`}>
      <div className="flex items-center font-serif text-[2.1rem] font-semibold leading-none text-navy-900 sm:text-[2.6rem]" aria-hidden>
        {text.split('').map((ch, i) =>
          ch === ':' ? (
            <span key={i} className="-mt-[0.12em] px-0.5 text-tan-500">:</span>
          ) : (
            <span key={i} className="relative inline-block h-[1.1em] w-[0.6em] overflow-hidden text-center tabular-nums">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={ch}
                  initial={{ y: '100%', opacity: 0 }}
                  animate={{ y: '0%', opacity: 1 }}
                  exit={{ y: '-100%', opacity: 0 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="absolute inset-0"
                >
                  {ch}
                </motion.span>
              </AnimatePresence>
            </span>
          )
        )}
        <span className="ml-1.5 self-end pb-1 font-sans text-xs font-semibold text-navy-400">WIB</span>
      </div>
    </div>
  );
}
