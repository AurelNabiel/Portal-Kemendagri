import { FileSearch, MessageSquareText, Scale, MapPinned, IdCard, Building2 } from 'lucide-react';

// Tautan contoh — arahkan ke URL layanan resmi masing-masing
const SERVICES = [
  { icon: FileSearch, title: 'Permohonan informasi publik', desc: 'Ajukan dan pantau permohonan informasi melalui PPID.', href: '#' },
  { icon: MessageSquareText, title: 'Pengaduan masyarakat', desc: 'Sampaikan laporan atau aspirasi terkait penyelenggaraan pemerintahan.', href: '#' },
  { icon: Scale, title: 'Produk hukum', desc: 'Telusuri peraturan menteri, keputusan, dan surat edaran.', href: '#' },
  { icon: IdCard, title: 'Administrasi kependudukan', desc: 'Informasi layanan dokumen kependudukan dan pencatatan sipil.', href: '#' },
  { icon: MapPinned, title: 'Data wilayah administrasi', desc: 'Kode dan data wilayah provinsi, kabupaten/kota, hingga desa.', href: '#' },
  { icon: Building2, title: 'Profil kementerian', desc: 'Struktur organisasi, tugas, dan fungsi unit kerja.', href: '#' },
];

export default function QuickServices() {
  return (
    <section id="layanan" className="bg-white">
      <div className="container-page py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_2fr]">
          <div>
            <h2 className="font-serif text-3xl text-navy-900">Layanan publik</h2>
            <p className="mt-3 max-w-sm leading-relaxed text-navy-600">
              Akses cepat ke layanan dan informasi yang paling sering dicari masyarakat.
            </p>
          </div>
          <ul className="grid gap-px overflow-hidden rounded-2xl border border-navy-100 bg-navy-100 sm:grid-cols-2">
            {SERVICES.map(({ icon: Icon, title, desc, href }) => (
              <li key={title} className="bg-white">
                <a href={href} className="focus-ring group flex h-full gap-4 p-5 transition-colors hover:bg-tan-50 sm:p-6">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-navy-700 transition-colors group-hover:bg-navy-800 group-hover:text-tan-200">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span>
                    <span className="block font-semibold text-navy-900">{title}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-navy-600">{desc}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
