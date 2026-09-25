'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarPlus, Clock3, Download, FileText, MapPin, UserRound, X, CalendarDays, ClipboardCheck } from 'lucide-react';
import { getCategory, getLeader } from '@/lib/agenda-data';
import { downloadIcs, eventStatus, fmt, fromKey } from '@/lib/date';
import { apiDownload, apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthProvider';
import { CategoryChip, StatusBadge } from './parts';

const ATTENDANCE={PENDING:'Menunggu disposisi',ATTEND:'Pimpinan menghadiri',REPRESENTED:'Diwakilkan',NOT_ATTEND:'Tidak menghadiri'};
const FILE_LABEL={INVITATION:'Undangan',DISPOSITION_MEMO:'Memo disposisi',OTHER:'Dokumen lain'};

export default function EventModal({ event, onClose, now }) {
  const closeRef = useRef(null);
  const {token}=useAuth();
  const [files,setFiles]=useState([]);

  useEffect(() => {
    if (!event) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    apiFetch(`/agendas/${event.id}/files`,{token}).then(d=>setFiles(d.items||[])).catch(()=>setFiles([]));
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [event, onClose, token]);

  const download=async(file)=>{try{await apiDownload(`/agendas/files/${file.id}/download`,{token,filename:file.originalName})}catch(e){alert(e.message)}};

  return <AnimatePresence>{event&&<motion.div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
    <div className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm" onClick={onClose} aria-hidden/>
    <motion.div role="dialog" aria-modal="true" aria-labelledby="judul-agenda" initial={{y:48,opacity:0}} animate={{y:0,opacity:1}} exit={{y:48,opacity:0}} transition={{duration:.3,ease:[.22,1,.36,1]}} className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
      <div className={`h-1.5 ${getCategory(event.category).band}`} aria-hidden/>
      <div className="p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4"><div className="flex flex-wrap gap-2"><CategoryChip category={event.category}/><StatusBadge status={eventStatus(event,now)}/><span className="rounded-full bg-navy-100 px-2.5 py-1 text-xs font-semibold text-navy-700">INTERNAL</span></div><button ref={closeRef} type="button" onClick={onClose} className="focus-ring -mr-2 -mt-2 rounded-lg p-2 text-navy-500 hover:bg-navy-50" aria-label="Tutup detail agenda"><X className="h-5 w-5"/></button></div>
        <h2 id="judul-agenda" className="mt-4 font-serif text-2xl leading-snug text-navy-900">{event.title}</h2>
        <dl className="mt-6 grid gap-3.5 text-sm sm:grid-cols-2"><Row icon={UserRound}>{getLeader(event.leader).name}</Row><Row icon={CalendarDays}>{fmt(fromKey(event.date),'EEEE, d MMMM yyyy')}</Row><Row icon={Clock3}><span className="tabular-nums">{event.start} – {event.end} WIB</span></Row><Row icon={MapPin}>{event.location}</Row></dl>
        {event.description&&<p className="mt-6 border-t border-navy-100 pt-5 leading-relaxed text-navy-700">{event.description}</p>}

        <div className="mt-6 rounded-xl border border-navy-100 bg-navy-50/60 p-4"><div className="flex items-center gap-2 font-semibold text-navy-900"><ClipboardCheck className="h-4 w-4 text-tan-600"/> Disposisi Pimpinan</div><p className="mt-2 text-sm font-medium text-navy-800">{ATTENDANCE[event.attendanceStatus]||event.attendanceStatus}</p>{event.attendanceStatus==='REPRESENTED'&&<p className="mt-1 text-sm text-navy-600">Diwakili oleh <b>{event.representedByName}</b>{event.representedByPosition?` — ${event.representedByPosition}`:''}</p>}{event.dispositionNote&&<p className="mt-2 whitespace-pre-wrap text-sm text-navy-600">{event.dispositionNote}</p>}{event.dispositionByName&&<p className="mt-2 text-xs text-navy-400">Diperbarui oleh {event.dispositionByName}</p>}</div>

        <div className="mt-6"><h3 className="flex items-center gap-2 font-semibold text-navy-900"><FileText className="h-4 w-4 text-tan-600"/> Dokumen Agenda</h3>{files.length?<div className="mt-3 space-y-2">{files.map(file=><button key={file.id} onClick={()=>download(file)} className="flex w-full items-center justify-between gap-3 rounded-xl border border-navy-100 px-4 py-3 text-left hover:bg-navy-50"><span className="min-w-0"><span className="block text-xs font-semibold uppercase tracking-wide text-tan-700">{FILE_LABEL[file.fileType]||file.fileType}</span><span className="block truncate text-sm text-navy-800">{file.originalName}</span></span><Download className="h-4 w-4 shrink-0 text-navy-500"/></button>)}</div>:<p className="mt-2 text-sm text-navy-400">Belum ada file undangan atau memo disposisi.</p>}</div>

        <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className="btn-ghost">Tutup</button><button type="button" onClick={()=>downloadIcs(event)} className="btn-primary"><CalendarPlus className="h-4 w-4"/> Simpan ke kalender</button></div>
      </div>
    </motion.div>
  </motion.div>}</AnimatePresence>;
}
function Row({icon:Icon,children}){return <div className="flex gap-3"><Icon className="mt-0.5 h-4 w-4 shrink-0 text-tan-600"/><dd className="text-navy-800">{children}</dd></div>}
