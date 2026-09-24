'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { addDays } from 'date-fns';
import { CheckCircle2, EyeOff, LogOut, Pencil, Plus, RotateCcw, Search, Trash2, LockKeyhole } from 'lucide-react';
import { useAgenda } from '@/context/AgendaProvider';
import { jakartaNow } from '@/hooks/useNow';
import { CATEGORIES, LEADERS, filterEvents, getLeader } from '@/lib/agenda-data';
import { fmt, fromKey, toKey } from '@/lib/date';
import { CategoryChip } from '@/components/agenda/parts';
import Emblem from '@/components/layout/Emblem';
import EventForm from './EventForm';

/**
 * PERHATIAN: autentikasi di bawah ini hanya untuk demo prototipe.
 * Untuk produksi gunakan autentikasi sisi server (mis. NextAuth/Auth.js atau JWT dari backend)
 * dan lindungi rute /admin melalui middleware.
 */
const SESSION_KEY = 'portal-admin-session';
const DEMO = { username: 'admin', password: 'admin123' };

export default function AdminApp() {
  const [authed, setAuthed] = useState(null);

  useEffect(() => {
    try {
      setAuthed(sessionStorage.getItem(SESSION_KEY) === '1');
    } catch {
      setAuthed(false);
    }
  }, []);

  const login = () => {
    try { sessionStorage.setItem(SESSION_KEY, '1'); } catch {}
    setAuthed(true);
  };
  const logout = () => {
    try { sessionStorage.removeItem(SESSION_KEY); } catch {}
    setAuthed(false);
  };

  if (authed === null) return <div className="min-h-[60vh]" />;
  return authed ? <Dashboard onLogout={logout} /> : <Login onSuccess={login} />;
}

/* ------------------------------------------------------------------ */
function Login({ onSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (username.trim() === DEMO.username && password === DEMO.password) onSuccess();
    else setError('Nama pengguna atau kata sandi salah. Periksa kembali lalu coba lagi.');
  };

  return (
    <section className="kawung-light flex min-h-[calc(100vh-6rem)] items-center py-16">
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto w-full max-w-md rounded-2xl border border-navy-100 bg-white p-7 shadow-[0_30px_80px_-40px_rgba(10,29,56,0.45)] sm:p-9"
      >
        <div className="flex items-center gap-3">
          <Emblem />
          <div>
            <h1 className="font-serif text-2xl text-navy-900">Masuk pengelola</h1>
            <p className="text-sm text-navy-500">Kelola agenda dan kegiatan pimpinan</p>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <div>
            <label htmlFor="username" className="label">Nama pengguna</label>
            <input id="username" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} className="input h-11" />
          </div>
          <div>
            <label htmlFor="password" className="label">Kata sandi</label>
            <input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="input h-11" />
          </div>
          {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-800">{error}</p>}
          <button type="submit" className="btn-primary h-11 w-full">
            <LockKeyhole className="h-4 w-4" aria-hidden />
            Masuk
          </button>
        </div>

        <p className="mt-6 rounded-lg bg-tan-50 px-3 py-2.5 text-xs leading-relaxed text-tan-800">
          Akun demo prototipe: <strong>admin</strong> / <strong>admin123</strong>. Ganti dengan autentikasi server sebelum produksi.
        </p>
      </motion.form>
    </section>
  );
}

/* ------------------------------------------------------------------ */
const PAGE = 15;

function Dashboard({ onLogout }) {
  const { events, ready, addEvent, updateEvent, deleteEvent, resetEvents } = useAgenda();
  const [q, setQ] = useState('');
  const [leader, setLeader] = useState('semua');
  const [category, setCategory] = useState('semua');
  const [period, setPeriod] = useState('mendatang');
  const [limit, setLimit] = useState(PAGE);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null); // { type: 'delete', event } | { type: 'reset' }
  const [toast, setToast] = useState('');
  const [todayKey, setTodayKey] = useState('');

  useEffect(() => setTodayKey(toKey(jakartaNow())), []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 2800);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => setLimit(PAGE), [q, leader, category, period]);

  const stats = useMemo(() => {
    if (!todayKey) return null;
    const weekEnd = toKey(addDays(fromKey(todayKey), 7));
    return {
      total: events.length,
      today: events.filter((e) => e.date === todayKey).length,
      week: events.filter((e) => e.date >= todayKey && e.date <= weekEnd).length,
      hidden: events.filter((e) => !e.isPublic).length,
    };
  }, [events, todayKey]);

  const rows = useMemo(() => {
    let list = filterEvents(events, { q, leaders: leader === 'semua' ? [] : [leader], category });
    if (period === 'mendatang') list = list.filter((e) => e.date >= todayKey);
    if (period === 'lampau') list = [...list.filter((e) => e.date < todayKey)].reverse();
    return list;
  }, [events, q, leader, category, period, todayKey]);

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (ev) => { setEditing(ev); setFormOpen(true); };
  const closeForm = useCallback(() => setFormOpen(false), []);

  const handleSubmit = (data) => {
    if (editing) {
      updateEvent(editing.id, data);
      setToast('Perubahan agenda disimpan');
    } else {
      addEvent(data);
      setToast('Agenda ditambahkan');
    }
    setFormOpen(false);
  };

  const handleConfirm = () => {
    if (confirm?.type === 'delete') {
      deleteEvent(confirm.event.id);
      setToast('Agenda dihapus');
    } else if (confirm?.type === 'reset') {
      resetEvents();
      setToast('Data contoh dipulihkan');
    }
    setConfirm(null);
  };

  return (
    <div className="bg-navy-50/50">
      <div className="container-page py-8 sm:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-tan-700">Modul administrasi</p>
            <h1 className="mt-1 font-serif text-3xl text-navy-900">Kelola agenda pimpinan</h1>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={openCreate} className="btn-primary">
              <Plus className="h-4 w-4" aria-hidden /> Tambah agenda
            </button>
            <button type="button" onClick={onLogout} className="btn-ghost">
              <LogOut className="h-4 w-4" aria-hidden /> Keluar
            </button>
          </div>
        </div>

        <dl className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            ['Total agenda', stats?.total],
            ['Hari ini', stats?.today],
            ['7 hari ke depan', stats?.week],
            ['Tidak dipublikasikan', stats?.hidden],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-navy-100 bg-white p-4">
              <dt className="text-sm text-navy-500">{label}</dt>
              <dd className="mt-1 font-serif text-3xl text-navy-900">{ready && value !== undefined ? value : '–'}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 rounded-2xl border border-navy-100 bg-white">
          <div className="flex flex-col gap-3 border-b border-navy-100 p-4 lg:flex-row lg:items-center">
            <div className="relative lg:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" aria-hidden />
              <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari agenda" aria-label="Cari agenda" className="input h-10 pl-9" />
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:flex">
              <select value={period} onChange={(e) => setPeriod(e.target.value)} className="input h-10 py-0" aria-label="Periode">
                <option value="mendatang">Hari ini & mendatang</option>
                <option value="lampau">Sudah lewat</option>
                <option value="semua">Semua tanggal</option>
              </select>
              <select value={leader} onChange={(e) => setLeader(e.target.value)} className="input h-10 py-0" aria-label="Pimpinan">
                <option value="semua">Semua pimpinan</option>
                {LEADERS.map((l) => <option key={l.id} value={l.id}>{l.short}</option>)}
              </select>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="input col-span-2 h-10 py-0 sm:col-span-1" aria-label="Jenis kegiatan">
                <option value="semua">Semua jenis</option>
                {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <button type="button" onClick={() => setConfirm({ type: 'reset' })} className="focus-ring inline-flex items-center gap-1.5 self-start rounded px-2 py-2 text-sm text-navy-500 hover:text-navy-900 lg:ml-auto lg:self-auto">
              <RotateCcw className="h-4 w-4" aria-hidden /> Pulihkan data contoh
            </button>
          </div>

          {!ready ? (
            <div className="h-64 animate-pulse bg-navy-50/50" />
          ) : rows.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="font-serif text-xl text-navy-900">Belum ada agenda yang sesuai</p>
              <p className="mt-2 text-sm text-navy-600">Ubah filter di atas, atau tambahkan agenda baru.</p>
              <button type="button" onClick={openCreate} className="btn-primary mt-5">
                <Plus className="h-4 w-4" aria-hidden /> Tambah agenda
              </button>
            </div>
          ) : (
            <>
              {/* Tabel (desktop) */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left text-sm">
                  <thead className="bg-navy-50/70 text-navy-600">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-semibold">Tanggal & waktu</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Kegiatan</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Pimpinan</th>
                      <th scope="col" className="px-4 py-3 font-semibold">Jenis</th>
                      <th scope="col" className="px-4 py-3 text-right font-semibold"><span className="sr-only">Aksi</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-100">
                    {rows.slice(0, limit).map((ev) => (
                      <tr key={ev.id} className={`align-top ${ev.date === todayKey ? 'bg-tan-50/60' : ''}`}>
                        <td className="whitespace-nowrap px-4 py-3.5">
                          <span className="block font-medium text-navy-900">{fmt(fromKey(ev.date), 'EEE, d MMM yyyy')}</span>
                          <span className="tabular-nums text-navy-500">{ev.start}–{ev.end}</span>
                        </td>
                        <td className="max-w-md px-4 py-3.5">
                          <span className="block text-navy-900">{ev.title}</span>
                          <span className="mt-0.5 flex items-center gap-2 text-navy-500">
                            {ev.location}
                            {!ev.isPublic && (
                              <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">
                                <EyeOff className="h-3 w-3" aria-hidden /> Internal
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-navy-700">{getLeader(ev.leader).short}</td>
                        <td className="px-4 py-3.5"><CategoryChip category={ev.category} /></td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-right">
                          <RowActions ev={ev} onEdit={openEdit} onDelete={(e) => setConfirm({ type: 'delete', event: e })} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Kartu (seluler) */}
              <ul className="divide-y divide-navy-100 md:hidden">
                {rows.slice(0, limit).map((ev) => (
                  <li key={ev.id} className="flex gap-3 p-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold tabular-nums text-navy-600">
                        {fmt(fromKey(ev.date), 'EEE, d MMM')} · {ev.start}–{ev.end}
                      </p>
                      <p className="mt-1 text-sm leading-snug text-navy-900">{ev.title}</p>
                      <p className="mt-1 text-xs text-navy-500">{getLeader(ev.leader).short}{!ev.isPublic ? ' (internal)' : ''}</p>
                    </div>
                    <RowActions ev={ev} onEdit={openEdit} onDelete={(e) => setConfirm({ type: 'delete', event: e })} />
                  </li>
                ))}
              </ul>

              <div className="flex items-center justify-between border-t border-navy-100 px-4 py-3 text-sm text-navy-500">
                <span>Menampilkan {Math.min(limit, rows.length)} dari {rows.length} agenda</span>
                {limit < rows.length && (
                  <button type="button" onClick={() => setLimit((l) => l + PAGE)} className="focus-ring rounded font-semibold text-navy-700 hover:text-navy-900">
                    Tampilkan lebih banyak
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <EventForm open={formOpen} initial={editing} onClose={closeForm} onSubmit={handleSubmit} />
      <ConfirmDialog confirm={confirm} onCancel={() => setConfirm(null)} onConfirm={handleConfirm} />

      <AnimatePresence>
        {toast && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-full bg-navy-900 px-5 py-3 text-sm text-white shadow-xl"
          >
            <CheckCircle2 className="h-4 w-4 text-tan-300" aria-hidden />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RowActions({ ev, onEdit, onDelete }) {
  return (
    <span className="inline-flex gap-1">
      <button type="button" onClick={() => onEdit(ev)} className="focus-ring rounded-lg p-2 text-navy-500 hover:bg-navy-50 hover:text-navy-900" aria-label={`Ubah agenda ${ev.title}`}>
        <Pencil className="h-4 w-4" />
      </button>
      <button type="button" onClick={() => onDelete(ev)} className="focus-ring rounded-lg p-2 text-navy-500 hover:bg-red-50 hover:text-red-700" aria-label={`Hapus agenda ${ev.title}`}>
        <Trash2 className="h-4 w-4" />
      </button>
    </span>
  );
}

function ConfirmDialog({ confirm, onCancel, onConfirm }) {
  const isDelete = confirm?.type === 'delete';
  return (
    <AnimatePresence>
      {confirm && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-navy-950/60" onClick={onCancel} aria-hidden />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="judul-konfirmasi"
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <h2 id="judul-konfirmasi" className="font-serif text-xl text-navy-900">
              {isDelete ? 'Hapus agenda ini?' : 'Pulihkan data contoh?'}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-navy-600">
              {isDelete
                ? `“${confirm.event.title}” akan dihapus dari portal. Tindakan ini tidak dapat dibatalkan.`
                : 'Semua perubahan yang Anda buat akan diganti dengan data contoh awal.'}
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={onCancel} className="btn-ghost">Batal</button>
              <button type="button" onClick={onConfirm} className={isDelete ? 'btn-danger' : 'btn-primary'}>
                {isDelete ? 'Hapus agenda' : 'Pulihkan data'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
