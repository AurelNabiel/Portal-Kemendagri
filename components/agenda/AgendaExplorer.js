'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  addDays, addMonths, addWeeks, endOfMonth, endOfWeek, isValid, parseISO, startOfMonth, startOfWeek,
} from 'date-fns';
import { CalendarClock, CalendarDays, CalendarRange, ChevronLeft, ChevronRight, List, Search, X } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';
import { apiFetch } from '@/lib/api';
import { jakartaNow, useNow } from '@/hooks/useNow';
import { CATEGORIES, LEADERS, filterEvents } from '@/lib/agenda-data';
import { fmt, toKey } from '@/lib/date';
import MonthView from './MonthView';
import WeekView from './WeekView';
import DayView from './DayView';
import ListView from './ListView';
import EventModal from './EventModal';

const VIEWS = [
  { id: 'bulan', label: 'Bulan', icon: CalendarDays },
  { id: 'minggu', label: 'Minggu', icon: CalendarRange },
  { id: 'hari', label: 'Hari', icon: CalendarClock },
  { id: 'daftar', label: 'Daftar', icon: List },
];
const STEP = { bulan: addMonths, minggu: addWeeks, hari: addDays, daftar: addMonths };

export default function AgendaExplorer() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { token } = useAuth();
  const [events, setEvents] = useState([]);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState('');
  const now = useNow(30_000);

  useEffect(() => {
    let live = true;
    setReady(false);
    apiFetch('/agendas', { token })
      .then((data) => { if (live) { setEvents(data.items || []); setLoadError(''); } })
      .catch((error) => { if (live) { setEvents([]); setLoadError(error.message); } })
      .finally(() => { if (live) setReady(true); });
    return () => { live = false; };
  }, [token]);

  const [view, setView] = useState(() => (VIEWS.some((v) => v.id === params.get('view')) ? params.get('view') : 'bulan'));
  const [cursor, setCursor] = useState(null);
  const [direction, setDirection] = useState(0);
  const [q, setQ] = useState(params.get('q') ?? '');
  const [leaders, setLeaders] = useState([]);
  const [category, setCategory] = useState('semua');
  const [selectedId, setSelectedId] = useState(params.get('event'));

  // Tanggal awal dari URL (?date=yyyy-MM-dd) atau hari ini (WIB)
  useEffect(() => {
    const raw = params.get('date');
    const parsed = raw ? parseISO(raw) : null;
    setCursor(parsed && isValid(parsed) ? parsed : jakartaNow());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sinkronkan state ke URL agar tampilan bisa dibagikan
  useEffect(() => {
    if (!cursor) return;
    const next = new URLSearchParams({ view, date: toKey(cursor) });
    if (q.trim()) next.set('q', q.trim());
    router.replace(`${pathname}?${next}`, { scroll: false });
  }, [view, cursor, q, pathname, router]);

  const filtered = useMemo(() => filterEvents(events, { q, leaders, category }), [events, q, leaders, category]);
  const hasFilters = q.trim() || leaders.length || category !== 'semua';

  const listEvents = useMemo(() => {
    if (!cursor) return [];
    if (q.trim()) return filtered; // pencarian: tampilkan seluruh hasil lintas tanggal
    const from = toKey(startOfMonth(cursor));
    const to = toKey(endOfMonth(cursor));
    return filtered.filter((e) => e.date >= from && e.date <= to);
  }, [filtered, cursor, q]);

  const selected = selectedId ? events.find((e) => e.id === selectedId) ?? null : null;
  const closeModal = useCallback(() => setSelectedId(null), []);

  const step = (dir) => {
    setDirection(dir);
    setCursor((c) => STEP[view](c, dir));
  };
  const goToday = () => {
    setDirection(0);
    setCursor(jakartaNow());
  };
  const pickDay = (day) => {
    setDirection(0);
    setCursor(day);
    setView('hari');
  };
  const toggleLeader = (id) => setLeaders((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const resetFilters = () => {
    setQ('');
    setLeaders([]);
    setCategory('semua');
  };

  const periodLabel = !cursor
    ? '\u00A0'
    : view === 'daftar' && q.trim()
      ? `Hasil pencarian “${q.trim()}”`
      : view === 'bulan' || view === 'daftar'
        ? fmt(cursor, 'MMMM yyyy')
        : view === 'minggu'
          ? `${fmt(startOfWeek(cursor, { weekStartsOn: 1 }), 'd MMM')} – ${fmt(endOfWeek(cursor, { weekStartsOn: 1 }), 'd MMM yyyy')}`
          : fmt(cursor, 'EEEE, d MMMM yyyy');

  const viewProps = { cursor, events: filtered, now, onSelect: (ev) => setSelectedId(ev.id), onPickDay: pickDay };

  return (
    <div className="container-page py-8 sm:py-10">
      {/* Pencarian, filter, dan pilihan tampilan */}
      <div className="rounded-2xl border border-navy-100 bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <label htmlFor="cari-agenda" className="sr-only">Cari agenda</label>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" aria-hidden />
            <input
              id="cari-agenda"
              type="search"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                if (e.target.value.trim() && view !== 'daftar') setView('daftar');
              }}
              placeholder="Cari kegiatan, lokasi, atau pimpinan"
              className="input h-11 pl-9 pr-9"
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ('')}
                className="focus-ring absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-navy-400 hover:text-navy-800"
                aria-label="Hapus kata kunci"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div role="tablist" aria-label="Pilih tampilan" className="grid grid-cols-4 rounded-xl bg-navy-50 p-1">
            {VIEWS.map(({ id, label, icon: Icon }) => {
              const active = view === id;
              return (
                <button
                  key={id}
                  role="tab"
                  type="button"
                  aria-selected={active}
                  onClick={() => {
                    setDirection(0);
                    setView(id);
                  }}
                  className={`focus-ring relative flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active ? 'text-white' : 'text-navy-600 hover:text-navy-900'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="view-pill"
                      className="absolute inset-0 rounded-lg bg-navy-800"
                      transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                    />
                  )}
                  <Icon className="relative h-4 w-4" aria-hidden />
                  <span className="relative">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-navy-100 pt-4 md:flex-row md:items-center">
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 md:flex-wrap md:overflow-visible md:pb-0">
            <span className="shrink-0 self-center text-sm text-navy-500">Pimpinan:</span>
            {LEADERS.map((l) => {
              const on = leaders.includes(l.id);
              return (
                <button
                  key={l.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleLeader(l.id)}
                  className={`focus-ring shrink-0 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                    on ? 'border-navy-800 bg-navy-800 text-white' : 'border-navy-200 text-navy-700 hover:border-navy-400'
                  }`}
                >
                  {l.short}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2 md:ml-auto">
            <label htmlFor="kategori" className="sr-only">Jenis kegiatan</label>
            <select
              id="kategori"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input h-10 py-0 md:w-56"
            >
              <option value="semua">Semua jenis kegiatan</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
            {hasFilters ? (
              <button type="button" onClick={resetFilters} className="focus-ring shrink-0 rounded px-2 py-2 text-sm font-medium text-tan-700 hover:text-tan-900">
                Atur ulang
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Navigasi periode */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => step(-1)} className="btn-ghost h-10 w-10 !p-0" aria-label="Periode sebelumnya" disabled={!cursor}>
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button type="button" onClick={goToday} className="btn-ghost h-10">Hari ini</button>
          <button type="button" onClick={() => step(1)} className="btn-ghost h-10 w-10 !p-0" aria-label="Periode berikutnya" disabled={!cursor}>
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.h2
            key={periodLabel}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="font-serif text-2xl capitalize text-navy-900"
            aria-live="polite"
          >
            {periodLabel}
          </motion.h2>
        </AnimatePresence>
      </div>

      {loadError && <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{loadError}</div>}

      {/* Isi tampilan */}
      <div className="mt-5">
        {!ready || !cursor ? (
          <div className="h-[28rem] animate-pulse rounded-2xl bg-navy-50" />
        ) : (
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={`${view}-${toKey(cursor)}`}
              custom={direction}
              initial={{ opacity: 0, x: direction * 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -24 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              {view === 'bulan' && <MonthView {...viewProps} />}
              {view === 'minggu' && <WeekView {...viewProps} />}
              {view === 'hari' && <DayView {...viewProps} />}
              {view === 'daftar' && (
                <ListView
                  events={listEvents}
                  now={now}
                  onSelect={viewProps.onSelect}
                  onReset={resetFilters}
                  emptyHint={
                    q.trim()
                      ? `Tidak ada agenda yang cocok dengan “${q.trim()}”. Coba kata kunci lain atau kurangi filter.`
                      : 'Tidak ada agenda pada bulan ini untuk filter yang dipilih. Pindah ke bulan lain atau kurangi filter.'
                  }
                />
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* Keterangan warna */}
      <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-navy-600" aria-label="Keterangan jenis kegiatan">
        {CATEGORIES.map((c) => (
          <li key={c.id} className="inline-flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${c.dot}`} aria-hidden />
            {c.label}
          </li>
        ))}
      </ul>

      <EventModal event={selected} onClose={closeModal} now={now} />
    </div>
  );
}
