'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Save } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthProvider';
import { ErrorBox, Panel } from './AdminCommon';

export default function RolePermissionManager(){
  const {token}=useAuth();
  const [roles,setRoles]=useState([]); const [permissions,setPermissions]=useState([]); const [selected,setSelected]=useState(null); const [values,setValues]=useState([]); const [error,setError]=useState('');
  const load=useCallback(async()=>{setError('');try{const [r,p]=await Promise.all([apiFetch('/users/roles/permissions',{token}),apiFetch('/users/permissions',{token})]);setRoles(r.items||[]);setPermissions(p.items||[]);if(!selected&&r.items?.length){const first=r.items.find(x=>x.code!=='SUPER_ADMIN')||r.items[0];setSelected(first.id);setValues(first.permissions||[])}}catch(e){setError(e.message)}},[token,selected]);
  useEffect(()=>{load()},[load]);
  const role=roles.find(r=>String(r.id)===String(selected));
  const groups=useMemo(()=>permissions.reduce((acc,p)=>{(acc[p.module]??=[]).push(p);return acc},{}),[permissions]);
  const choose=(id)=>{const r=roles.find(x=>String(x.id)===String(id));setSelected(id);setValues(r?.permissions||[])};
  const toggle=(code)=>setValues(v=>v.includes(code)?v.filter(x=>x!==code):[...v,code]);
  const save=async()=>{try{await apiFetch(`/users/roles/${selected}/permissions`,{method:'PUT',token,body:{permissionCodes:values}});await load();alert('Hak akses role tersimpan.')}catch(e){alert(e.message)}};
  return <Panel title="Hak Akses per Role" description="Atur permission yang diperoleh setiap role. Permission Super Admin dikunci."><div className="p-5"><ErrorBox message={error}/><div className="grid gap-5 lg:grid-cols-[220px_1fr]"><div className="space-y-2">{roles.map(r=><button key={r.id} className={`w-full rounded-xl px-3 py-2 text-left text-sm font-semibold ${String(selected)===String(r.id)?'bg-navy-800 text-white':'bg-navy-50 text-navy-700'}`} onClick={()=>choose(r.id)}>{r.name}</button>)}</div><div>{role?.code==='SUPER_ADMIN'?<div className="rounded-xl bg-tan-50 p-4 text-sm text-tan-800">Super Admin selalu memiliki seluruh permission untuk mencegah sistem kehilangan akses administrasi.</div>:<><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{Object.entries(groups).map(([module,list])=><fieldset key={module} className="rounded-xl border border-navy-100 p-4"><legend className="px-1 text-sm font-bold uppercase tracking-wide text-navy-600">{module}</legend><div className="mt-2 space-y-2">{list.map(p=><label key={p.code} className="flex gap-2 text-sm text-navy-700"><input type="checkbox" checked={values.includes(p.code)} onChange={()=>toggle(p.code)} className="mt-0.5 accent-navy-700"/><span><b className="font-medium text-navy-900">{p.name}</b><span className="block text-xs text-navy-400">{p.code}</span></span></label>)}</div></fieldset>)}</div><div className="mt-4 flex justify-end"><button className="btn-primary" onClick={save}><Save className="h-4 w-4"/> Simpan hak akses</button></div></>}</div></div></div></Panel>;
}
