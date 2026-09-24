'use client';

import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarPlus, Clock3, MapPin, UserRound, X, CalendarDays } from 'lucide-react';
import { getCategory, getLeader } from '@/lib/agenda-data';
import { downloadIcs, eventStatus, fmt, fromKey } from '@/lib/date';
import { CategoryChip, StatusBadge } from './parts';

export default function EventModal({ event, onClose, now }) {
  const closeRef = useRef(null);

  useEffect(() => {
    if (!event) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [event, onClose]);

  return (
    <AnimatePresence>
      {event && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm" onClick={onClose} aria-hidden />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="judul-agenda"
            initial={{ y: 48, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 48, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
          >
            <div className={`h-1.5 ${getCategory(event.category).band}`} aria-hidden />
            <div className="p-6 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  <CategoryChip category={event.category} />
                  <StatusBadge status={eventStatus(event, now)} />
                </div>
                <button
                  ref={closeRef}
                  type="button"
                  onClick={onClose}
                  className="focus-ring -mr-2 -mt-2 rounded-lg p-2 text-navy-500 hover:bg-navy-50 hover:text-navy-900"
                  aria-label="Tutup detail agenda"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <h2 id="judul-agenda" className="mt-4 font-serif text-2xl leading-snug text-navy-900">
                {event.title}
              </h2>

              <dl className="mt-6 space-y-3.5 text-sm">
                <Row icon={UserRound} label="Pimpinan">{getLeader(event.leader).name}</Row>
                <Row icon={CalendarDays} label="Tanggal">{fmt(fromKey(event.date), 'EEEE, d MMMM yyyy')}</Row>
                <Row icon={Clock3} label="Waktu">
                  <span className="tabular-nums">{event.start} – {event.end} WIB</span>
                </Row>
                <Row icon={MapPin} label="Lokasi">{event.location}</Row>
              </dl>

              {event.description && (
                <p className="mt-6 border-t border-navy-100 pt-5 leading-relaxed text-navy-700">{event.description}</p>
              )}

              <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button type="button" onClick={onClose} className="btn-ghost">Tutup</button>
                <button type="button" onClick={() => downloadIcs(event)} className="btn-primary">
                  <CalendarPlus className="h-4 w-4" aria-hidden />
                  Simpan ke kalender
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Row({ icon: Icon, label, children }) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-tan-600" aria-hidden />
      <div>
        <dt className="sr-only">{label}</dt>
        <dd className="text-navy-800">{children}</dd>
      </div>
    </div>
  );
}
