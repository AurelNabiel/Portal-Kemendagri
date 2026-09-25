'use client';

import Link from 'next/link';
import { LockKeyhole } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';
import AgendaExplorer from './AgendaExplorer';

export default function AgendaAccessGate(){
  const {ready,user,can}=useAuth();
  if(!ready)return <div className="container-page py-24"><div className="h-64 animate-pulse rounded-2xl bg-navy-50"/></div>;
  if(!user)return <Restricted title="Agenda Pimpinan merupakan informasi internal" text="Silakan masuk melalui Panel Pengelola menggunakan akun yang memiliki hak akses agenda."/>;
  if(!can('agenda.view'))return <Restricted title="Akses agenda tidak diberikan untuk akun ini" text="Hak akses agenda diatur melalui Role-Based Access Control oleh Super Admin."/>;
  return <AgendaExplorer/>;
}

function Restricted({title,text}){
  return <div className="container-page py-20"><div className="mx-auto max-w-xl rounded-2xl border border-navy-100 bg-white p-8 text-center shadow-sm"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-navy-50 text-navy-800"><LockKeyhole className="h-6 w-6"/></div><h2 className="mt-5 font-serif text-2xl text-navy-900">{title}</h2><p className="mt-3 leading-relaxed text-navy-600">{text}</p><Link href="/admin" className="btn-primary mt-6">Masuk ke Panel Pengelola</Link></div></div>;
}
