'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, RefreshCw, Send, Trash2, UploadCloud, X } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthProvider';
import { Empty, ErrorBox, Panel, StatusBadge } from './AdminCommon';

const blank = { type: 'NEWS', title: '', summary: '', body: '' };

export default function ContentManager() {
  const { token, can } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const [q, setQ] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { const data = await apiFetch('/contents', { token }); setItems(data.items || []); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [token]);
  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase(); return !k ? items : items.filter((x) => `${x.title} ${x.type} ${x.status}`.toLowerCase().includes(k));
  }, [items, q]);

  const startCreate = () => { setEditing(null); setForm(blank); setOpen(true); };
  const startEdit = (item) => { setEditing(item); setForm({ type: item.type, title: item.title, summary: item.summary || '', body: item.body || '' }); setOpen(true); };
  const save = async (e) => {
    e.preventDefault();
    try {
      if (editing) await apiFetch(`/contents/${editing.id}`, { method: 'PUT', token, body: form });
      else await apiFetch('/contents', { method: 'POST', token, body: form });
      setOpen(false); await load();
    } catch (e2) { alert(e2.message); }
  };
  const action = async (path, method = 'POST') => { try { await apiFetch(path, { method, token }); await load(); } catch (e) { alert(e.message); } };

  return <>
    <Panel title="Content Management System" description="Kelola berita, pengumuman, artikel, dan halaman melalui workflow approval." action={can('content.create') && <button className="btn-primary" onClick={startCreate}><Plus className="h-4 w-4" /> Tambah konten</button>}>
      <div className="flex gap-2 p-4"><input className="input h-10 max-w-md" value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Cari konten" /><button className="btn-ghost" onClick={load}><RefreshCw className="h-4 w-4" /> Refresh</button></div>
      <ErrorBox message={error} />
      {loading ? <div className="h-48 animate-pulse bg-navy-50/40" /> : filtered.length === 0 ? <Empty /> : <div className="overflow-x-auto"><table className="w-full text-left text-sm">
        <thead className="bg-navy-50/70 text-navy-600"><tr><th className="px-4 py-3">Jenis</th><th className="px-4 py-3">Judul</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Pembuat</th><th className="px-4 py-3 text-right">Aksi</th></tr></thead>
        <tbody className="divide-y divide-navy-100">{filtered.map(item => <tr key={item.id}>
          <td className="px-4 py-3 font-semibold text-navy-600">{item.type}</td><td className="px-4 py-3"><div className="font-medium text-navy-900">{item.title}</div><div className="line-clamp-1 max-w-xl text-xs text-navy-500">{item.summary}</div></td><td className="px-4 py-3"><StatusBadge status={item.status}/></td><td className="px-4 py-3 text-navy-600">{item.createdByName || '-'}</td>
          <td className="px-4 py-3"><div className="flex justify-end gap-1">
            {can('content.edit') && ['DRAFT','REVISION','REJECTED'].includes(item.status) && <button className="rounded-lg p-2 hover:bg-navy-50" title="Edit" onClick={()=>startEdit(item)}><Pencil className="h-4 w-4"/></button>}
            {can('content.submit') && ['DRAFT','REVISION','REJECTED'].includes(item.status) && <button className="rounded-lg p-2 hover:bg-amber-50" title="Ajukan verifikasi" onClick={()=>action(`/contents/${item.id}/submit`)}><Send className="h-4 w-4"/></button>}
            {can('content.publish') && item.status==='APPROVED' && <button className="rounded-lg p-2 hover:bg-emerald-50" title="Publikasikan" onClick={()=>action(`/contents/${item.id}/publish`)}><UploadCloud className="h-4 w-4"/></button>}
            {can('content.delete') && ['DRAFT','REVISION','REJECTED'].includes(item.status) && <button className="rounded-lg p-2 text-red-700 hover:bg-red-50" title="Hapus" onClick={()=>confirm('Hapus konten ini?')&&action(`/contents/${item.id}`,'DELETE')}><Trash2 className="h-4 w-4"/></button>}
          </div></td>
        </tr>)}</tbody>
      </table></div>}
    </Panel>

    {open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 p-4">
      <form onSubmit={save} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-navy-100 px-6 py-4"><h2 className="font-serif text-xl text-navy-900">{editing?'Ubah konten':'Tambah konten'}</h2><button type="button" className="p-2" onClick={()=>setOpen(false)}><X className="h-5 w-5"/></button></div>
        <div className="space-y-5 p-6">
          <div><label className="label">Jenis konten</label><select className="input" value={form.type} onChange={e=>setForm({...form,type:e.target.value})}><option>NEWS</option><option>ANNOUNCEMENT</option><option>ARTICLE</option><option>PAGE</option></select></div>
          <div><label className="label">Judul</label><input required minLength={5} className="input" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></div>
          <div><label className="label">Ringkasan</label><textarea className="input" rows={3} value={form.summary} onChange={e=>setForm({...form,summary:e.target.value})}/></div>
          <div><label className="label">Isi konten</label><textarea className="input" rows={10} value={form.body} onChange={e=>setForm({...form,body:e.target.value})}/></div>
        </div>
        <div className="flex justify-end gap-2 border-t border-navy-100 p-4"><button type="button" className="btn-ghost" onClick={()=>setOpen(false)}>Batal</button><button className="btn-primary">Simpan draft</button></div>
      </form>
    </div>}
  </>;
}
