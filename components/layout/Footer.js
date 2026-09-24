import Link from 'next/link';
import { MapPin, Phone, Mail } from 'lucide-react';
import Emblem from './Emblem';

export default function Footer() {
  return (
    <footer className="relative mt-auto overflow-hidden bg-navy-950 text-navy-200">
      <div className="h-1 bg-tan-400" aria-hidden />
      <div className="kawung absolute inset-0 opacity-50" aria-hidden />
      <div className="container-page relative grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <Emblem />
            <div>
              <p className="font-serif text-lg font-semibold text-white">Kementerian Dalam Negeri</p>
              <p className="text-sm text-navy-300">Republik Indonesia</p>
            </div>
          </div>
          <ul className="mt-6 space-y-3 text-sm">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-tan-300" aria-hidden />
              Jl. Medan Merdeka Utara No. 7, Jakarta Pusat 10110
            </li>
            <li className="flex gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-tan-300" aria-hidden />
              (021) 3450038
            </li>
            <li className="flex gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-tan-300" aria-hidden />
              pusdatin@kemendagri.go.id
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-serif text-base font-semibold text-white">Portal</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link href="/" className="focus-ring rounded hover:text-tan-200">Beranda</Link></li>
            <li><Link href="/agenda" className="focus-ring rounded hover:text-tan-200">Agenda pimpinan</Link></li>
            <li><Link href="/#berita" className="focus-ring rounded hover:text-tan-200">Berita</Link></li>
            <li><Link href="/#layanan" className="focus-ring rounded hover:text-tan-200">Layanan publik</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="font-serif text-base font-semibold text-white">Informasi</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><a href="#" className="focus-ring rounded hover:text-tan-200">PPID</a></li>
            <li><a href="#" className="focus-ring rounded hover:text-tan-200">Kebijakan privasi</a></li>
            <li><a href="#" className="focus-ring rounded hover:text-tan-200">Syarat penggunaan</a></li>
            <li><Link href="/admin" className="focus-ring rounded hover:text-tan-200">Masuk pengelola</Link></li>
          </ul>
        </div>
      </div>
      <div className="relative border-t border-navy-800">
        <p className="container-page py-5 text-xs text-navy-400">
          © {new Date().getFullYear()} Kementerian Dalam Negeri Republik Indonesia. Hak cipta dilindungi.
        </p>
      </div>
    </footer>
  );
}
