'use client';

import { getCategory, getLeader } from '@/lib/agenda-data';
import { eventStatus, toKey, toMinutes } from '@/lib/date';
import { StatusBadge } from './parts';

const START_H = 6;
const END_H = 22;
const HOUR = 64; // tinggi 1 jam dalam px

// Membagi kegiatan yang bertabrakan ke dalam lajur; lebar dihitung per kelompok tumpang-tindih
function layoutLanes(list) {
  const sorted = [...list].sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
  const placed = [];
  let cluster = [];
  let laneEnds = [];
  let clusterEnd = -1;

  const flush = () => {
    cluster.forEach((item) => (item.laneCount = laneEnds.length || 1));
    cluster = [];
    laneEnds = [];
  };

  sorted.forEach((ev) => {
    const s = toMinutes(ev.start);
    const e = toMinutes(ev.end);
    if (s >= clusterEnd) flush();
    let lane = laneEnds.findIndex((end) => end <= s);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(0);
    }
    laneEnds[lane] = e;
    clusterEnd = Math.max(clusterEnd, e);
    const item = { ev, lane, laneCount: 1 };
    cluster.push(item);
    placed.push(item);
  });
  flush();
  return placed;
}

export default function DayView({ cursor, events, now, onSelect }) {
  const key = toKey(cursor);
  const list = events.filter((e) => e.date === key);
  const placed = layoutLanes(list);
  const hours = Array.from({ length: END_H - START_H + 1 }, (_, i) => START_H + i);
  const isToday = now && key === toKey(now);
  const nowMin = now ? now.getHours() * 60 + now.getMinutes() : 0;
  const clamp = (m) => Math.min(Math.max(m, START_H * 60), END_H * 60);
  const y = (m) => ((clamp(m) - START_H * 60) / 60) * HOUR;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="overflow-hidden rounded-2xl border border-navy-100 bg-white">
        <div className="relative grid grid-cols-[3.5rem_1fr]" style={{ height: (END_H - START_H) * HOUR + 16 }}>
          <div className="relative border-r border-navy-100">
            {hours.map((h) => (
              <span
                key={h}
                className="absolute right-2 -translate-y-1/2 text-xs tabular-nums text-navy-400"
                style={{ top: (h - START_H) * HOUR + 8 }}
              >
                {String(h).padStart(2, '0')}.00
              </span>
            ))}
          </div>
          <div className="relative" style={{ marginTop: 8 }}>
            {hours.map((h) => (
              <div key={h} className="absolute inset-x-0 border-t border-navy-100" style={{ top: (h - START_H) * HOUR }} />
            ))}

            {placed.map(({ ev, lane, laneCount }) => {
              const top = y(toMinutes(ev.start));
              const height = Math.max(44, y(toMinutes(ev.end)) - top - 4);
              const status = eventStatus(ev, now);
              return (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => onSelect(ev)}
                  className={`focus-ring absolute overflow-hidden rounded-lg border-l-4 px-3 py-2 text-left transition-colors ${
                    getCategory(ev.category).border
                  } ${status === 'berlangsung' ? 'bg-tan-50 ring-1 ring-tan-300' : status === 'selesai' ? 'bg-navy-50/60' : 'bg-navy-50 hover:bg-navy-100'}`}
                  style={{
                    top: top + 2,
                    height,
                    left: `calc(${(lane / laneCount) * 100}% + 6px)`,
                    width: `calc(${100 / laneCount}% - 12px)`,
                  }}
                >
                  <span className="block text-xs font-semibold tabular-nums text-navy-600">
                    {ev.start}–{ev.end}
                  </span>
                  <span className={`mt-0.5 block text-sm leading-snug ${status === 'selesai' ? 'text-navy-500' : 'text-navy-900'} line-clamp-2`}>
                    {ev.title}
                  </span>
                  {height > 80 && <span className="mt-1 block truncate text-xs text-navy-500">{ev.location}</span>}
                </button>
              );
            })}

            {isToday && nowMin >= START_H * 60 && nowMin <= END_H * 60 && (
              <div className="pointer-events-none absolute inset-x-0 z-10 flex items-center" style={{ top: y(nowMin) }} aria-hidden>
                <span className="-ml-1.5 h-3 w-3 rounded-full bg-tan-500 ring-4 ring-tan-100" />
                <span className="h-0.5 flex-1 bg-tan-500" />
              </div>
            )}

            {list.length === 0 && (
              <p className="absolute inset-x-0 top-24 text-center text-sm text-navy-400">Tidak ada agenda pada tanggal ini.</p>
            )}
          </div>
        </div>
      </div>

      <aside className="space-y-3 lg:sticky lg:top-28 lg:self-start">
        <h3 className="font-serif text-lg text-navy-900">Ringkasan hari</h3>
        {list.length === 0 ? (
          <p className="rounded-xl bg-navy-50 p-4 text-sm text-navy-600">Belum ada kegiatan terjadwal.</p>
        ) : (
          <ul className="space-y-2">
            {list.map((ev) => (
              <li key={ev.id}>
                <button
                  type="button"
                  onClick={() => onSelect(ev)}
                  className="focus-ring w-full rounded-xl border border-navy-100 bg-white p-3.5 text-left hover:border-navy-300"
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold tabular-nums text-navy-700">{ev.start}</span>
                    <StatusBadge status={eventStatus(ev, now)} />
                  </span>
                  <span className="mt-1.5 block text-sm leading-snug text-navy-900">{ev.title}</span>
                  <span className="mt-1 block text-xs text-navy-500">{getLeader(ev.leader).name}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}
