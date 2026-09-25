'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, RefreshCw, Save, X } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthProvider';
import { Empty, ErrorBox, Panel } from './AdminCommon';
import RolePermissionManager from './RolePermissionManager';

export default function UserManager() {
  const { token, can, user } = useAuth();
  const [items, setItems] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name:'', username:'', email:'', password:'', roleCode:'USER' });

  const load = useCallback(async()=>{
    setLoading(true); setError('');
    try {
      const [u, r] = await Promise.all([apiFetch('/users',{token}), apiFetch('/users/roles',{token})]);
      setItems(u.items||[]); setRoles(r.items||[]);
    } catch(e){setError(e.message)} finally {setLoading(false)}
  },[token]);
  useEffect(()=>{load()},[load]);

  const create = async(e)=>{
    e.preventDefault();
    try { await apiFetch('/users',{method:'POST',token,body:{name:form.name,username:form.username,email:form.email,password:form.password,roleCodes:[form.roleCode]}}); setOpen(false); setForm({name:'',username:'',email:'',password:'',roleCode:'USER'}); await load(); }
    catch(err){alert(err.message)}
  };
  const setRole = async(id, code)=>{ try {await apiFetch(`/users/${id}/roles`,{method:'PUT',token,body:{roleCodes:[code]}}); await load();}catch(e){alert(e.message)} };
  const setStatus = async(id, status)=>{ try {await apiFetch(`/users/${id}`,{method:'PATCH',token,body:{status}}); await load();}catch(e){alert(e.message)} };

  return <>
    <Panel title="Manajemen Pengguna" description="Role-Based Access Control untuk Super Admin, Verifikator, Operator, dan Pengguna." action={can('users.create')&&<button className="btn-primary" onClick={()=>setOpen(true)}><Plus className="h-4 w-4"/> Tambah pengguna</button>}>
      <div className="p-4"><button className="btn-ghost" onClick={load}><RefreshCw className="h-4 w-4"/> Refresh</button></div>
      <ErrorBox message={error}/>
      {loading?<div className="h-48 animate-pulse bg-navy-50/40"/>:items.length===0?<Empty/>:<div className="overflow-x-auto"><table className="w-full text-left text-sm">
        <thead className="bg-navy-50/70 text-navy-600"><tr><th className="px-4 py-3">Pengguna</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Login terakhir</th></tr></thead>
        <tbody className="divide-y divide-navy-100">{items.map(item=><tr key={item.id}>
          <td className="px-4 py-3"><div className="font-medium text-navy-900">{item.name}</div><div className="text-xs text-navy-500">@{item.username}{item.email?` · ${item.email}`:''}</div></td>
          <td className="px-4 py-3">{can('roles.manage')?<select disabled={String(item.id)===String(user.id)} title={String(item.id)===String(user.id)?'Role akun sendiri dikunci pada sesi aktif':'Ubah role'} className="input h-9 py-0 disabled:bg-slate-100" value={item.roles[0]||'USER'} onChange={e=>setRole(item.id,e.target.value)}>{roles.map(r=><option key={r.code} value={r.code}>{r.name}</option>)}</select>:item.roleNames}</td>
          <td className="px-4 py-3">{can('users.edit')&&String(item.id)!==String(user.id)?<select className="input h-9 py-0" value={item.status} onChange={e=>setStatus(item.id,e.target.value)}><option>ACTIVE</option><option>INACTIVE</option><option>SUSPENDED</option></select>:item.status}</td>
          <td className="px-4 py-3 text-navy-500">{item.lastLoginAt||'-'}</td>
        </tr>)}</tbody>
      </table></div>}
    </Panel>
    {open&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 p-4"><form onSubmit={create} className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-navy-100 px-6 py-4"><h2 className="font-serif text-xl text-navy-900">Tambah pengguna</h2><button type="button" onClick={()=>setOpen(false)}><X className="h-5 w-5"/></button></div>
      <div className="space-y-4 p-6"><div><label className="label">Nama</label><input required className="input" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div><div><label className="label">Username</label><input required className="input" value={form.username} onChange={e=>setForm({...form,username:e.target.value})}/></div><div><label className="label">Email</label><input type="email" className="input" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div><div><label className="label">Password</label><input required minLength={8} type="password" className="input" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></div><div><label className="label">Role</label><select className="input" value={form.roleCode} onChange={e=>setForm({...form,roleCode:e.target.value})}>{roles.map(r=><option key={r.code} value={r.code}>{r.name}</option>)}</select></div></div>
      <div className="flex justify-end gap-2 border-t border-navy-100 p-4"><button type="button" className="btn-ghost" onClick={()=>setOpen(false)}>Batal</button><button className="btn-primary"><Save className="h-4 w-4"/> Simpan</button></div>
    </form></div>}
    {can('roles.manage') && <RolePermissionManager />}
  </>;
}
