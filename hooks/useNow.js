'use client';

import { useEffect, useState } from 'react';

/**
 * Waktu "sekarang" dalam zona WIB (Asia/Jakarta), diperbarui tiap `interval` ms.
 * Mengembalikan null sebelum komponen ter-mount agar tidak terjadi hydration mismatch.
 */
export function jakartaNow() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
}

export function useNow(interval = 1000) {
  const [now, setNow] = useState(null);
  useEffect(() => {
    setNow(jakartaNow());
    const timer = setInterval(() => setNow(jakartaNow()), interval);
    return () => clearInterval(timer);
  }, [interval]);
  return now;
}
