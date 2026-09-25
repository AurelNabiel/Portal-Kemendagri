'use client';

import { useEffect, useState } from 'react';
import { FileCheck2, FileText, ShieldCheck, Users } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthProvider';
import { Panel } from './AdminCommon';

export default function DashboardOverview(){
  const {token,user,can}=useAuth();
  const [stats,setStats]=useState({agenda:null,content:null,pending:null,users:null});
  useEffect(()=>{
    let live=true;
    (async()=>{
      const next={agenda:null,content:null,pending:null,users:null};
      try{if(can('agenda.view')){const d=await apiFetch('/agendas',{token});next.agenda=d.items?.length||0}}catch{}
      try{if(can('content.view')){const d=await apiFetch('/contents',{token});next.content=d.items?.length||0}}catch{}
      try{if(can('approval.view')){const d=await apiFetch('/approvals?status=PENDING',{token});next.pending=d.items?.length||0}}catch{}
      try{if(can('users.view')){const d=await apiFetch('/users',{token});next.users=d.items?.length||0}}catch{}
      if(live)setStats(next);
    })(); return()=>{live=false};
  },[token,can]);
  const cards=[
    ['Agenda',stats.agenda,FileCheck2],['Konten CMS',stats.content,FileText],['Menunggu verifikasi',stats.pending,ShieldCheck],['Pengguna',stats.users,Users]
  ].filter(([,v])=>v!==null);
  return <div className="space-y-6"><div><h1 className="font-serif text-3xl text-navy-900">Dashboard Manajemen</h1><p className="mt-2 text-navy-600">Selamat datang, {user?.name}. Role: {user?.roles?.map(r=>r.name).join(', ')||'-'}.</p></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label,value,Icon])=><div key={label} className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="text-sm text-navy-500">{label}</span><Icon className="h-5 w-5 text-tan-600"/></div><div className="mt-3 font-serif text-4xl text-navy-900">{value}</div></div>)}</div><Panel title="Alur publikasi aktif" description="Konten publik hanya muncul setelah melewati workflow approval."><div className="grid gap-2 p-5 text-sm sm:grid-cols-5">{['1. Draft / Input','2. Submit','3. Verifikasi','4. Approved','5. Publish'].map((x,i)=><div key={x} className="rounded-xl bg-navy-50 px-4 py-4 text-center font-semibold text-navy-700">{x}</div>)}</div></Panel></div>;
}
