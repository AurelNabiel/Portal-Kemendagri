'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { generateSeedEvents, sortEvents } from '@/lib/agenda-data';
import { jakartaNow } from '@/hooks/useNow';
import { apiFetch } from '@/lib/api';

const AgendaContext = createContext(null);

export function AgendaProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [ready, setReady] = useState(false);
  const [source, setSource] = useState('api');
  const [error, setError] = useState('');

  const reloadPublic = useCallback(async () => {
    try {
      const data = await apiFetch('/agendas/public');
      setEvents(sortEvents(data.items || []));
      setSource('api');
      setError('');
    } catch (err) {
      // Fallback hanya agar frontend tetap dapat dipreview bila backend belum dinyalakan.
      setEvents(generateSeedEvents(jakartaNow()).filter((e) => e.isPublic));
      setSource('fallback');
      setError(err.message || 'Backend tidak dapat dihubungi.');
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => { reloadPublic(); }, [reloadPublic]);

  const publicEvents = useMemo(() => events.filter((e) => e.isPublic !== false), [events]);
  const value = useMemo(() => ({ events, publicEvents, ready, source, error, reloadPublic }), [events, publicEvents, ready, source, error, reloadPublic]);

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
