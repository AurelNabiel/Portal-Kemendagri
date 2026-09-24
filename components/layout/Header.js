'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, UserCog } from 'lucide-react';
import Emblem from './Emblem';
import { formatLongDate } from '@/lib/date';
import { jakartaNow } from '@/hooks/useNow';

const NAV = [
  { href: '/', label: 'Beranda', match: (p) => p === '/' },
  { href: '/agenda', label: 'Agenda Pimpinan', match: (p) => p.startsWith('/agenda') },
  { href: '/#berita', label: 'Berita', match: () => false },
  { href: '/#layanan', label: 'Layanan', match: () => false },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [today, setToday] = useState('');

  useEffect(() => {
    setToday(formatLongDate(jakartaNow()));
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-navy-950 text-xs text-navy-200">
        <div className="container-page flex h-8 items-center justify-between gap-4">
          <span className="truncate" suppressHydrationWarning>
            {today}
          </span>
          <Link href="/admin" className="focus-ring inline-flex items-center gap-1.5 rounded hover:text-tan-200">
            <UserCog className="h-3.5 w-3.5" aria-hidden />
            Pengelola
          </Link>
        </div>
      </div>

      <div
        className={`border-b bg-white/95 backdrop-blur transition-shadow ${
          scrolled ? 'border-navy-100 shadow-[0_6px_24px_-12px_rgba(10,29,56,0.25)]' : 'border-transparent'
        }`}
      >
        <div className="container-page flex h-16 items-center justify-between gap-6">
          <Link href="/" className="focus-ring flex items-center gap-3 rounded-lg">
            <Emblem size="sm" />
            <span className="leading-tight">
              <span className="block font-serif text-[15px] font-semibold text-navy-900 sm:text-base">
                Kementerian Dalam Negeri
              </span>
              <span className="block text-xs text-navy-500">Republik Indonesia</span>
            </span>
          </Link>

          <nav aria-label="Navigasi utama" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {NAV.map((item) => {
                const active = item.match(pathname);
                return (
                  <li key={item.href} className="relative">
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={`focus-ring relative block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        active ? 'text-navy-900' : 'text-navy-600 hover:text-navy-900'
                      }`}
                    >
                      {item.label}
                      {active && (
                        <motion.span
                          layoutId="nav-underline"
                          className="absolute inset-x-3 -bottom-[13px] h-[3px] rounded-full bg-tan-400"
                          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-lg text-navy-800 hover:bg-navy-50 md:hidden"
            aria-expanded={open}
            aria-controls="menu-seluler"
            aria-label={open ? 'Tutup menu' : 'Buka menu'}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <AnimatePresence initial={false}>
          {open && (
            <motion.nav
              id="menu-seluler"
              aria-label="Navigasi seluler"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden border-t border-navy-100 md:hidden"
            >
              <ul className="container-page space-y-1 py-3">
                {NAV.map((item) => {
                  const active = item.match(pathname);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={`focus-ring flex items-center justify-between rounded-lg px-3 py-3 text-[15px] font-medium ${
                          active ? 'bg-navy-50 text-navy-900' : 'text-navy-700 hover:bg-navy-50'
                        }`}
                      >
                        {item.label}
                        {active && <span className="h-2 w-2 rounded-full bg-tan-400" />}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
