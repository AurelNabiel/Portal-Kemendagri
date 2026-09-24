import { addDays, startOfDay } from 'date-fns';
import { toKey, toMinutes } from './date';

/* ------------------------------------------------------------------ */
/* Referensi pimpinan & kategori                                       */
/* ------------------------------------------------------------------ */
export const LEADERS = [
  { id: 'menteri', name: 'Menteri Dalam Negeri', short: 'Mendagri' },
  { id: 'wamen', name: 'Wakil Menteri Dalam Negeri', short: 'Wamendagri' },
  { id: 'sekjen', name: 'Sekretaris Jenderal', short: 'Sekjen' },
  { id: 'irjen', name: 'Inspektur Jenderal', short: 'Irjen' },
];

// Kelas Tailwind ditulis lengkap agar tidak terhapus saat purge
export const CATEGORIES = [
  { id: 'rapat', label: 'Rapat Koordinasi', dot: 'bg-navy-700', chip: 'bg-navy-50 text-navy-700 ring-navy-200', border: 'border-navy-700', band: 'bg-navy-700' },
  { id: 'kunjungan', label: 'Kunjungan Kerja', dot: 'bg-tan-500', chip: 'bg-tan-50 text-tan-800 ring-tan-200', border: 'border-tan-500', band: 'bg-tan-500' },
  { id: 'seremonial', label: 'Pelantikan & Seremonial', dot: 'bg-navy-400', chip: 'bg-navy-50 text-navy-600 ring-navy-100', border: 'border-navy-400', band: 'bg-navy-400' },
  { id: 'media', label: 'Konferensi Pers & Media', dot: 'bg-tan-700', chip: 'bg-tan-100 text-tan-800 ring-tan-300', border: 'border-tan-700', band: 'bg-tan-700' },
  { id: 'internal', label: 'Audiensi & Internal', dot: 'bg-slate-500', chip: 'bg-slate-100 text-slate-700 ring-slate-200', border: 'border-slate-500', band: 'bg-slate-500' },
];

export const getLeader = (id) => LEADERS.find((l) => l.id === id) ?? LEADERS[0];
export const getCategory = (id) => CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];

/* ------------------------------------------------------------------ */
/* Data contoh (seed) — relatif terhadap hari ini agar selalu terisi   */
/* Ganti dengan data dari API/database saat integrasi backend.         */
/* ------------------------------------------------------------------ */
const TITLES = {
  rapat: [
    'Rapat Koordinasi Penyelenggaraan Pemerintahan Daerah',
    'Rapat Terbatas Evaluasi Pelaksanaan Otonomi Daerah',
    'Rapat Kerja bersama Komisi II DPR RI',
    'Rapat Koordinasi Pengendalian Inflasi Daerah',
    'Rapat Pimpinan Kementerian Dalam Negeri',
    'Rapat Koordinasi Percepatan Penyusunan APBD',
  ],
  kunjungan: [
    'Kunjungan Kerja ke Provinsi Jawa Tengah',
    'Peninjauan Layanan Administrasi Kependudukan di Kabupaten Bogor',
    'Kunjungan Kerja ke Provinsi Kalimantan Timur',
    'Peninjauan Kesiapan Pemilihan Kepala Desa Serentak',
    'Kunjungan Kerja ke Provinsi Sulawesi Selatan',
  ],
  seremonial: [
    'Pelantikan Pejabat Pimpinan Tinggi Pratama',
    'Penyerahan Penghargaan Kinerja Pemerintah Daerah',
    'Pelantikan Penjabat Kepala Daerah',
    'Upacara Peringatan Hari Otonomi Daerah',
  ],
  media: [
    'Konferensi Pers Capaian Kinerja Triwulan',
    'Keterangan Pers usai Rapat Terbatas',
    'Dialog Publik Tata Kelola Pemerintahan Desa',
  ],
  internal: [
    'Audiensi Asosiasi Pemerintah Kabupaten Seluruh Indonesia',
    'Penandatanganan Nota Kesepahaman dengan Badan Pusat Statistik',
    'Audiensi Forum Kepala Desa',
    'Rapat Internal Sekretariat Jenderal',
  ],
};

const LOCATIONS = {
  rapat: ['Ruang Sidang Utama Gedung A, Kemendagri', 'Gedung Nusantara II DPR RI, Senayan', 'Ruang Rapat Sasana Bhakti Praja, Kemendagri', 'Daring melalui konferensi video'],
  kunjungan: ['Kantor Gubernur Jawa Tengah, Semarang', 'Kantor Bupati Bogor, Cibinong', 'Kantor Gubernur Kalimantan Timur, Samarinda', 'Kantor Gubernur Sulawesi Selatan, Makassar'],
  seremonial: ['Sasana Bhakti Praja, Kemendagri', 'Gedung B Kemendagri, Jakarta Pusat', 'Lapangan Upacara Kemendagri'],
  media: ['Media Center Kemendagri', 'Lobi Gedung A Kemendagri', 'Studio RRI Jakarta'],
  internal: ['Ruang Kerja Menteri, Gedung A', 'Ruang Rapat Sekretariat Jenderal', 'Gedung B Kemendagri, Jakarta Pusat'],
};

const DESCRIPTIONS = {
  rapat: 'Pembahasan langkah koordinasi lintas kementerian dan pemerintah daerah, dilanjutkan penyusunan tindak lanjut bersama unit kerja terkait.',
  kunjungan: 'Peninjauan langsung pelaksanaan program di daerah serta dialog dengan kepala daerah dan perangkat daerah setempat.',
  seremonial: 'Kegiatan resmi kelembagaan yang dihadiri pejabat di lingkungan Kementerian Dalam Negeri dan undangan terkait.',
  media: 'Penyampaian informasi kepada media mengenai kebijakan dan capaian program Kementerian Dalam Negeri.',
  internal: 'Pertemuan dengan mitra dan pemangku kepentingan untuk membahas kerja sama serta masukan kebijakan.',
};

const SLOTS = [
  ['08:00', '09:30'],
  ['09:00', '10:30'],
  ['10:30', '12:00'],
  ['13:00', '14:30'],
  ['14:00', '15:30'],
  ['15:30', '17:00'],
  ['19:00', '21:00'],
];

// PRNG deterministik agar data contoh konsisten
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = (rand, arr) => arr[Math.floor(rand() * arr.length)];

function makeEvent(rand, date, [start, end], idx, overrides = {}) {
  const category = overrides.category ?? pick(rand, CATEGORIES).id;
  return {
    id: `seed-${toKey(date)}-${idx}`,
    title: pick(rand, TITLES[category]),
    leader: overrides.leader ?? pick(rand, LEADERS).id,
    category,
    date: toKey(date),
    start,
    end,
    location: pick(rand, LOCATIONS[category]),
    description: DESCRIPTIONS[category],
    isPublic: overrides.isPublic ?? rand() > 0.08,
  };
}

export function generateSeedEvents(base = new Date()) {
  const today = startOfDay(base);
  const events = [];

  for (let offset = -35; offset <= 60; offset++) {
    const date = addDays(today, offset);
    const rand = rng(offset + 7919);

    if (offset === 0) {
      // Hari ini dibuat padat agar status "sedang berlangsung" terlihat sepanjang hari
      const todaySlots = [
        [['07:30', '08:30'], 'seremonial', 'menteri'],
        [['09:00', '11:00'], 'rapat', 'menteri'],
        [['10:00', '11:30'], 'internal', 'sekjen'],
        [['13:00', '15:00'], 'kunjungan', 'wamen'],
        [['15:30', '16:30'], 'media', 'menteri'],
        [['19:00', '21:00'], 'rapat', 'irjen'],
      ];
      todaySlots.forEach(([slot, category, leader], i) =>
        events.push(makeEvent(rand, date, slot, i, { category, leader, isPublic: true }))
      );
      continue;
    }

    const dow = date.getDay();
    const count = dow === 0 ? 0 : dow === 6 ? (rand() < 0.35 ? 1 : 0) : 1 + Math.floor(rand() * 3);
    const slots = [...SLOTS].sort(() => rand() - 0.5).slice(0, count);
    slots.forEach((slot, i) => events.push(makeEvent(rand, date, slot, i)));
  }
  return sortEvents(events);
}

/* ------------------------------------------------------------------ */
/* Helper                                                              */
/* ------------------------------------------------------------------ */
export function sortEvents(list) {
  return [...list].sort((a, b) =>
    a.date === b.date ? toMinutes(a.start) - toMinutes(b.start) : a.date < b.date ? -1 : 1
  );
}

export function groupByDate(list) {
  return list.reduce((acc, ev) => {
    (acc[ev.date] ||= []).push(ev);
    return acc;
  }, {});
}

export function filterEvents(list, { q = '', leaders = [], category = 'semua' } = {}) {
  const keyword = q.trim().toLowerCase();
  return list.filter((ev) => {
    if (leaders.length && !leaders.includes(ev.leader)) return false;
    if (category !== 'semua' && ev.category !== category) return false;
    if (!keyword) return true;
    const haystack = `${ev.title} ${ev.location} ${ev.description} ${getLeader(ev.leader).name}`.toLowerCase();
    return haystack.includes(keyword);
  });
}
