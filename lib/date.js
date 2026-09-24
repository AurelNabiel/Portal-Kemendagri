import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

export const fmt = (date, pattern) => format(date, pattern, { locale: id });
export const formatLongDate = (date) => fmt(date, 'EEEE, d MMMM yyyy');
export const toKey = (date) => format(date, 'yyyy-MM-dd');
export const fromKey = (key) => parseISO(key);

export const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/** Status kegiatan relatif terhadap waktu sekarang: 'akan' | 'berlangsung' | 'selesai' */
export function eventStatus(event, now) {
  if (!now) return 'akan';
  const todayKey = toKey(now);
  if (event.date < todayKey) return 'selesai';
  if (event.date > todayKey) return 'akan';
  const minutes = now.getHours() * 60 + now.getMinutes();
  if (minutes < toMinutes(event.start)) return 'akan';
  if (minutes >= toMinutes(event.end)) return 'selesai';
  return 'berlangsung';
}

/** Persentase berjalannya kegiatan (0–100) */
export function eventProgress(event, now) {
  if (!now) return 0;
  const start = toMinutes(event.start);
  const end = toMinutes(event.end);
  const current = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  return Math.min(100, Math.max(0, ((current - start) / (end - start)) * 100));
}

export function minutesUntil(event, now) {
  return toMinutes(event.start) - (now.getHours() * 60 + now.getMinutes());
}

export function humanizeMinutes(total) {
  if (total < 60) return `${total} menit`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return m ? `${h} jam ${m} menit` : `${h} jam`;
}

/** Unduh berkas .ics agar agenda bisa disimpan ke kalender pribadi */
export function downloadIcs(event) {
  const esc = (s = '') => s.replace(/\\/g, '\\\\').replace(/[,;]/g, (c) => `\\${c}`).replace(/\n/g, '\\n');
  const d = event.date.replaceAll('-', '');
  const t = (hhmm) => `${hhmm.replace(':', '')}00`;
  const stamp = `${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;
  const body = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Kemendagri//Portal Agenda//ID',
    'BEGIN:VEVENT',
    `UID:${event.id}@portal-agenda`,
    `DTSTAMP:${stamp}`,
    `DTSTART;TZID=Asia/Jakarta:${d}T${t(event.start)}`,
    `DTEND;TZID=Asia/Jakarta:${d}T${t(event.end)}`,
    `SUMMARY:${esc(event.title)}`,
    `LOCATION:${esc(event.location)}`,
    `DESCRIPTION:${esc(event.description)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  const url = URL.createObjectURL(new Blob([body], { type: 'text/calendar;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `agenda-${event.date}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}
