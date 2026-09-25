'use client';

import { useCallback, useEffect, useState } from 'react';
import { Check, RefreshCw, RotateCcw, UploadCloud, X } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthProvider';
import { Empty, ErrorBox, Panel, StatusBadge } from './AdminCommon';

export default function ApprovalManager() {
  const { token, can } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('PENDING');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const query = status === 'ALL' ? '' : `?status=${status}`;
      const data = await apiFetch(`/approvals${query}`, { token });
      setItems(data.items || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [token, status]);
  useEffect(() => { load(); }, [load]);

  const review = async (item, action) => {
    const notes = action === 'approve' ? '' : (prompt('Catatan verifikasi:') || '');
    if ((action === 'reject' || action === 'revision') && !notes.trim()) return;
    try {
      await apiFetch(`/approvals/${item.id}/${action}`, { method: 'POST', token, body: { notes } });
      await load();
    } catch (e) { alert(e.message); }
  };

  const publish = async (item) => {
    const base = item.entityType === 'AGENDA' ? 'agendas' : 'contents';
    try {
      await apiFetch(`/${base}/${item.entityId}/publish`, { method: 'POST', token });
      await load();
    } catch (e) { alert(e.message); }
  };

  return <Panel title="Verifikasi & Publikasi" description="Permintaan dari Operator diperiksa sebelum publikasi konten atau finalisasi agenda internal." action={<button className="btn-ghost" onClick={load}><RefreshCw className="h-4 w-4"/> Refresh</button>}>
    <div className="flex flex-wrap gap-2 border-b border-navy-100 p-4">
      {['PENDING','APPROVED','REVISION','REJECTED','ALL'].map(s => <button key={s} className={`rounded-full px-3 py-1.5 text-sm ${status===s?'bg-navy-800 text-white':'bg-navy-50 text-navy-700'}`} onClick={()=>setStatus(s)}>{s==='ALL'?'Semua':s}</button>)}
    </div>
    <ErrorBox message={error}/>
    {loading ? <div className="h-48 animate-pulse bg-navy-50/40"/> : items.length===0 ? <Empty>Tidak ada permintaan pada status ini.</Empty> : <div className="overflow-x-auto"><table className="w-full text-left text-sm">
      <thead className="bg-navy-50/70 text-navy-600"><tr><th className="px-4 py-3">Tipe</th><th className="px-4 py-3">Judul</th><th className="px-4 py-3">Diajukan oleh</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Aksi</th></tr></thead>
      <tbody className="divide-y divide-navy-100">{items.map(item=><tr key={item.id}>
        <td className="px-4 py-3 font-semibold text-navy-600">{item.entityType}</td>
        <td className="px-4 py-3"><div className="font-medium text-navy-900">{item.title}</div><div className="text-xs text-navy-500">{item.submittedAt}</div></td>
        <td className="px-4 py-3">{item.submittedByName || '-'}</td><td className="px-4 py-3"><StatusBadge status={item.entityStatus || item.status}/></td>
        <td className="px-4 py-3"><div className="flex justify-end gap-1">
          {item.status==='PENDING' && can('approval.approve') && <button className="rounded-lg p-2 text-emerald-700 hover:bg-emerald-50" title="Setujui" onClick={()=>review(item,'approve')}><Check className="h-4 w-4"/></button>}
          {item.status==='PENDING' && can('approval.revision') && <button className="rounded-lg p-2 text-amber-700 hover:bg-amber-50" title="Minta revisi" onClick={()=>review(item,'revision')}><RotateCcw className="h-4 w-4"/></button>}
          {item.status==='PENDING' && can('approval.reject') && <button className="rounded-lg p-2 text-red-700 hover:bg-red-50" title="Tolak" onClick={()=>review(item,'reject')}><X className="h-4 w-4"/></button>}
          {item.status==='APPROVED' && item.entityStatus==='APPROVED' && can(item.entityType==='AGENDA'?'agenda.publish':'content.publish') && <button className="rounded-lg p-2 text-navy-700 hover:bg-navy-50" title={item.entityType==='AGENDA'?'Finalisasi internal':'Publikasikan'} onClick={()=>publish(item)}><UploadCloud className="h-4 w-4"/></button>}
        </div></td>
      </tr>)}</tbody>
    </table></div>}
  </Panel>;
}
