import { Suspense } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import AgendaExplorer from '@/components/agenda/AgendaExplorer';

export const metadata = {
  title: 'Agenda Pimpinan',
  description: 'Jadwal harian, mingguan, dan bulanan pimpinan Kementerian Dalam Negeri.',
};

export default function AgendaPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-navy-900 text-white">
        <div className="kawung absolute inset-0" aria-hidden />
        <div className="container-page relative py-12 sm:py-14">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-navy-200">
            <Link href="/" className="focus-ring rounded hover:text-white">
              Beranda
            </Link>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            <span className="text-tan-200">Agenda Pimpinan</span>
          </nav>
          <h1 className="mt-4 max-w-3xl font-serif text-3xl leading-tight sm:text-4xl">
            Agenda dan kegiatan pimpinan
          </h1>
          <p className="mt-3 max-w-2xl leading-relaxed text-navy-100">
            Jadwal Menteri, Wakil Menteri, dan pejabat pimpinan tinggi Kementerian Dalam Negeri. Pilih tampilan
            bulan, minggu, hari, atau daftar, lalu saring berdasarkan pimpinan dan jenis kegiatan.
          </p>
        </div>
        <div className="h-1 bg-tan-400" aria-hidden />
      </section>
      <Suspense fallback={<div className="container-page py-24 text-navy-500">Memuat agenda…</div>}>
        <AgendaExplorer />
      </Suspense>
    </>
  );
}
