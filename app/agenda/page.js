import Link from 'next/link';
import { ChevronRight, LockKeyhole } from 'lucide-react';
import AgendaAccessGate from '@/components/agenda/AgendaAccessGate';

export const metadata = {
  title: 'Agenda Pimpinan — Akses Internal',
  description: 'Agenda pimpinan Biro Administrasi Pimpinan. Akses terbatas untuk pengguna berwenang.',
};

export default function AgendaPage(){return <><section className="relative overflow-hidden bg-navy-900 text-white"><div className="kawung absolute inset-0" aria-hidden/><div className="container-page relative py-12 sm:py-14"><nav className="flex items-center gap-1.5 text-sm text-navy-200"><Link href="/" className="focus-ring rounded hover:text-white">Beranda</Link><ChevronRight className="h-3.5 w-3.5"/><span className="text-tan-200">Agenda Pimpinan</span></nav><div className="mt-4 flex items-center gap-3"><LockKeyhole className="h-7 w-7 text-tan-300"/><h1 className="font-serif text-3xl leading-tight sm:text-4xl">Agenda Pimpinan — Internal</h1></div><p className="mt-3 max-w-2xl leading-relaxed text-navy-100">Jadwal pimpinan, undangan kegiatan, dan memo disposisi hanya dapat dilihat oleh pengguna yang memiliki hak akses. Informasi ini tidak ditayangkan kepada masyarakat umum.</p></div><div className="h-1 bg-tan-400"/></section><AgendaAccessGate/></>}
