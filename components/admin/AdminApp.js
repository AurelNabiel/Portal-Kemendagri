'use client';

import { useMemo, useState } from 'react';
import { BookOpenCheck, BriefcaseBusiness, Building2, Camera, ClipboardCheck, FileText, LayoutDashboard, LockKeyhole, LogOut, ShieldCheck, Users, UsersRound } from 'lucide-react';
import Emblem from '@/components/layout/Emblem';
import { useAuth } from '@/context/AuthProvider';
import AgendaManager from './AgendaManager';
import ContentManager from './ContentManager';
import ApprovalManager from './ApprovalManager';
import UserManager from './UserManager';
import AuditLog from './AuditLog';
import DashboardOverview from './DashboardOverview';
import OfficialManager from './OfficialManager';
import BureauManager from './BureauManager';
import ProgramManager from './ProgramManager';
import ActivityManager from './ActivityManager';

export default function AdminApp(){
  const {ready,user}=useAuth();
  if(!ready)return <div className="min-h-[60vh] animate-pulse bg-navy-50/40"/>;
  return user?<AdminPanel/>:<Login/>;
}

function Login(){
  const {login}=useAuth();
  const [username,setUsername]=useState(''); const [password,setPassword]=useState(''); const [error,setError]=useState(''); const [busy,setBusy]=useState(false);
  const submit=async(e)=>{e.preventDefault();setBusy(true);setError('');try{await login(username,password)}catch(err){setError(err.message)}finally{setBusy(false)}};
  return <section className="kawung-light flex min-h-[calc(100vh-6rem)] items-center py-16"><form onSubmit={submit} className="mx-auto w-full max-w-md rounded-2xl border border-navy-100 bg-white p-7 shadow-[0_30px_80px_-40px_rgba(10,29,56,0.45)] sm:p-9"><div className="flex items-center gap-3"><Emblem/><div><h1 className="font-serif text-2xl text-navy-900">Masuk pengelola</h1><p className="text-sm text-navy-500">CMS, agenda, verifikasi, dan pengguna</p></div></div><div className="mt-8 space-y-4"><div><label className="label">Nama pengguna</label><input autoComplete="username" required className="input h-11" value={username} onChange={e=>setUsername(e.target.value)}/></div><div><label className="label">Kata sandi</label><input type="password" autoComplete="current-password" required className="input h-11" value={password} onChange={e=>setPassword(e.target.value)}/></div>{error&&<p className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-800">{error}</p>}<button disabled={busy} className="btn-primary h-11 w-full"><LockKeyhole className="h-4 w-4"/>{busy?'Memproses...':'Masuk'}</button></div><p className="mt-6 rounded-lg bg-navy-50 px-3 py-2.5 text-xs leading-relaxed text-navy-600">Login sekarang divalidasi oleh backend dan database. Buat Super Admin pertama melalui <code>npm run seed:admin</code> di folder backend.</p></form></section>;
}

function AdminPanel(){
  const {user,logout,can}=useAuth();
  const menus=useMemo(()=>[
    {id:'dashboard',label:'Dashboard',icon:LayoutDashboard,show:true},
    {id:'officials',label:'Profil Pejabat',icon:UsersRound,show:can('officials.view')},
    {id:'bureau',label:'Tugas & Fungsi',icon:Building2,show:can('bureau.view')},
    {id:'programs',label:'Program Kerja',icon:BriefcaseBusiness,show:can('programs.view')},
    {id:'activities',label:'Aktivitas',icon:Camera,show:can('activities.view')},
    {id:'agenda',label:'Agenda Internal',icon:BookOpenCheck,show:can('agenda.view')},
    {id:'content',label:'CMS Konten',icon:FileText,show:can('content.view')},
    {id:'approval',label:'Verifikasi',icon:ClipboardCheck,show:can('approval.view')},
    {id:'users',label:'Pengguna & Role',icon:Users,show:can('users.view')},
    {id:'audit',label:'Audit Log',icon:ShieldCheck,show:can('audit.view')},
  ].filter(x=>x.show),[can]);
  const [tab,setTab]=useState('dashboard');
  const current=menus.some(m=>m.id===tab)?tab:'dashboard';
  return <div className="bg-navy-50/50 py-8 sm:py-10"><div className="container-page"><div className="mb-6 flex flex-col gap-4 rounded-2xl bg-navy-900 p-5 text-white sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm text-tan-200">Panel Manajemen</p><h1 className="mt-1 font-serif text-2xl">{user.name}</h1><p className="mt-1 text-sm text-navy-200">{user.roles?.map(r=>r.name).join(', ')}</p></div><button className="inline-flex items-center gap-2 self-start rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold hover:bg-white/10" onClick={logout}><LogOut className="h-4 w-4"/> Keluar</button></div><div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]"><aside className="h-fit rounded-2xl border border-navy-100 bg-white p-2 shadow-sm"><nav className="space-y-1">{menus.map(m=>{const Icon=m.icon;return <button key={m.id} onClick={()=>setTab(m.id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold ${current===m.id?'bg-navy-800 text-white':'text-navy-700 hover:bg-navy-50'}`}><Icon className="h-4 w-4"/>{m.label}</button>})}</nav></aside><main className="min-w-0">{current==='dashboard'&&<DashboardOverview/>}{current==='officials'&&<OfficialManager/>}{current==='bureau'&&<BureauManager/>}{current==='programs'&&<ProgramManager/>}{current==='activities'&&<ActivityManager/>}{current==='agenda'&&<AgendaManager/>}{current==='content'&&<ContentManager/>}{current==='approval'&&<ApprovalManager/>}{current==='users'&&<UserManager/>}{current==='audit'&&<AuditLog/>}</main></div></div></div>;
}
