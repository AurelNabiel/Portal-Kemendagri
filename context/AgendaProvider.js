'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { generateSeedEvents, sortEvents } from '@/lib/agenda-data';
import { jakartaNow } from '@/hooks/useNow';

/**
 * Penyimpanan agenda sisi klien (localStorage) untuk tahap prototipe.
 * Saat backend siap, ganti isi fungsi add/update/delete dengan pemanggilan API.
 */
const STORAGE_KEY = 'portal-agenda:v1';
const AgendaContext = createContext(null);

export function AgendaProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let stored = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      stored = raw ? JSON.parse(raw) : null;
    } catch {
      stored = null;
    }
    setEvents(sortEvents(Array.isArray(stored) ? stored : generateSeedEvents(jakartaNow())));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    } catch {
      /* penyimpanan penuh / diblokir — abaikan */
    }
  }, [events, ready]);

  const addEvent = useCallback((data) => {
    const event = { ...data, id: `ag-${Date.now().toString(36)}` };
    setEvents((prev) => sortEvents([...prev, event]));
    return event;
  }, []);

  const updateEvent = useCallback((id, data) => {
    setEvents((prev) => sortEvents(prev.map((e) => (e.id === id ? { ...e, ...data, id } : e))));
  }, []);

  const deleteEvent = useCallback((id) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const resetEvents = useCallback(() => {
    setEvents(generateSeedEvents(jakartaNow()));
  }, []);

  const publicEvents = useMemo(() => events.filter((e) => e.isPublic), [events]);

  const value = useMemo(
    () => ({ events, publicEvents, ready, addEvent, updateEvent, deleteEvent, resetEvents }),
    [events, publicEvents, ready, addEvent, updateEvent, deleteEvent, resetEvents]
  );

  return (
    <MotionConfig reducedMotion="user">
      <AgendaContext.Provider value={value}>{children}</AgendaContext.Provider>
    </MotionConfig>
  );
}

export function useAgenda() {
  const ctx = useContext(AgendaContext);
  if (!ctx) throw new Error('useAgenda harus digunakan di dalam <AgendaProvider>');
  return ctx;
}
