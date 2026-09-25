'use client';

import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthProvider';
import { Empty, ErrorBox, Panel } from './AdminCommon';

export default function AuditLog(){
  const {token}=useAuth(); const [items,setItems]=useState([]); const [loading,setLoading]=useState(true); const [error,setError]=useState('');
  const load=useCallback(async()=>{setLoading(true);setError('');try{const d=await apiFetch('/audit-logs?limit=150',{token});setItems(d.items||[])}catch(e){setError(e.message)}finally{setLoading(false)}},[token]);
  useEffect(()=>{load()},[load]);
  return <Panel title="Audit Log" description="Jejak aktivitas login, perubahan data, approval, publikasi, dan pengelolaan pengguna." action={<button className="btn-ghost" onClick={load}><RefreshCw className="h-4 w-4"/> Refresh</button>}><ErrorBox message={error}/>{loading?<div className="h-48 animate-pulse bg-navy-50/40"/>:items.length===0?<Empty/>:<div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-navy-50/70 text-navy-600"><tr><th className="px-4 py-3">Waktu</th><th className="px-4 py-3">Pengguna</th><th className="px-4 py-3">Modul</th><th className="px-4 py-3">Aksi</th><th className="px-4 py-3">Keterangan</th></tr></thead><tbody className="divide-y divide-navy-100">{items.map(i=><tr key={i.id}><td className="whitespace-nowrap px-4 py-3 text-navy-500">{i.createdAt}</td><td className="px-4 py-3">{i.userName}</td><td className="px-4 py-3">{i.module}</td><td className="px-4 py-3 font-semibold text-navy-700">{i.action}</td><td className="px-4 py-3 text-navy-600">{i.description||'-'}</td></tr>)}</tbody></table></div>}</Panel>;
}
