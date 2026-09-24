'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { CATEGORIES, LEADERS } from '@/lib/agenda-data';
import { toKey, toMinutes } from '@/lib/date';
import { jakartaNow } from '@/hooks/useNow';

const empty = () => ({
  title: '',
  leader: 'menteri',
  category: 'rapat',
  date: toKey(jakartaNow()),
  start: '09:00',
  end: '10:00',
  location: '',
  description: '',
  isPublic: true,
});

export default function EventForm({ open, initial, onClose, onSubmit }) {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const isEdit = Boolean(initial?.id);

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...empty(), ...initial } : empty());
      setErrors({});
    }
  }, [open, initial]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const validate = () => {
    const next = {};
    if (form.title.trim().length < 5) next.title = 'Isi nama kegiatan minimal 5 karakter.';
    if (!form.date) next.date = 'Pilih tanggal kegiatan.';
    if (!form.start || !form.end) next.time = 'Isi jam mulai dan jam selesai.';
    else if (toMinutes(form.end) <= toMinutes(form.start)) next.time = 'Jam selesai harus setelah jam mulai.';
    if (!form.location.trim()) next.location = 'Isi lokasi kegiatan.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const { id, ...data } = form;
    onSubmit({ ...data, title: data.title.trim(), location: data.location.trim(), description: data.description.trim() });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm" onClick={onClose} aria-hidden />
          <motion.form
            onSubmit={submit}
            noValidate
            role="dialog"
            aria-modal="true"
            aria-labelledby="judul-form"
            initial={{ y: 48, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 48, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
          >
            <div className="flex items-center justify-between border-b border-navy-100 px-6 py-4">
              <h2 id="judul-form" className="font-serif text-xl text-navy-900">
                {isEdit ? 'Ubah agenda' : 'Tambah agenda'}
              </h2>
              <button type="button" onClick={onClose} className="focus-ring rounded-lg p-2 text-navy-500 hover:bg-navy-50" aria-label="Tutup formulir">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-5 overflow-y-auto px-6 py-6 sm:grid-cols-2">
              <Field label="Nama kegiatan" error={errors.title} className="sm:col-span-2">
                <input id="f-title" value={form.title} onChange={set('title')} className="input" placeholder="Contoh: Rapat Koordinasi Pengendalian Inflasi Daerah" />
              </Field>
              <Field label="Pimpinan">
                <select value={form.leader} onChange={set('leader')} className="input">
                  {LEADERS.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </Field>
              <Field label="Jenis kegiatan">
                <select value={form.category} onChange={set('category')} className="input">
                  {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </Field>
              <Field label="Tanggal" error={errors.date}>
                <input type="date" value={form.date} onChange={set('date')} className="input" />
              </Field>
              <Field label="Waktu (WIB)" error={errors.time}>
                <div className="flex items-center gap-2">
                  <input type="time" value={form.start} onChange={set('start')} className="input" aria-label="Jam mulai" />
                  <span className="text-navy-400">–</span>
                  <input type="time" value={form.end} onChange={set('end')} className="input" aria-label="Jam selesai" />
                </div>
              </Field>
              <Field label="Lokasi" error={errors.location} className="sm:col-span-2">
                <input value={form.location} onChange={set('location')} className="input" placeholder="Contoh: Ruang Sidang Utama Gedung A, Kemendagri" />
              </Field>
              <Field label="Keterangan" className="sm:col-span-2">
                <textarea value={form.description} onChange={set('description')} rows={3} className="input resize-y" placeholder="Ringkasan kegiatan yang ditampilkan kepada publik" />
              </Field>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-navy-100 p-4 sm:col-span-2">
                <input type="checkbox" checked={form.isPublic} onChange={set('isPublic')} className="mt-0.5 h-4 w-4 rounded border-navy-300 accent-navy-700" />
                <span>
                  <span className="block text-sm font-medium text-navy-900">Tampilkan di portal publik</span>
                  <span className="block text-sm text-navy-500">Kosongkan untuk agenda yang hanya dilihat pengelola.</span>
                </span>
              </label>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-navy-100 px-6 py-4 sm:flex-row sm:justify-end">
              <button type="button" onClick={onClose} className="btn-ghost">Batal</button>
              <button type="submit" className="btn-primary">{isEdit ? 'Simpan perubahan' : 'Tambah agenda'}</button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({ label, error, className = '', children }) {
  return (
    <div className={className}>
      <span className="label">{label}</span>
      {children}
      {error && <p className="mt-1.5 text-sm text-red-700">{error}</p>}
    </div>
  );
}
