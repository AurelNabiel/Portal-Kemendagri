import { Source_Serif_4, Public_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AgendaProvider } from "@/context/AgendaProvider";

// Google Font API via next/font (otomatis di-self-host saat build)
const serif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});
const sans = Public_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata = {
  title: {
    default: "Portal Informasi Kementerian Dalam Negeri",
    template: "%s | Portal Informasi Kemendagri",
  },
  description:
    "Portal informasi resmi Kementerian Dalam Negeri Republik Indonesia: agenda dan kegiatan pimpinan, berita, serta layanan publik.",
  icons: {
    icon: '/kemendagri.svg',
    shortcut: '/kemendagri.svg',
    apple: '/kemendagri.svg',
  },
};

export const viewport = {
  themeColor: "#0A1D38",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${serif.variable} ${sans.variable}`}>
      <body className="flex min-h-screen flex-col">
        <AgendaProvider>
          <a
            href="#konten"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-tan-400 focus:px-4 focus:py-2 focus:text-navy-950"
          >
            Langsung ke konten
          </a>
          <Header />
          <main id="konten" className="flex-1">
            {children}
          </main>
          <Footer />
        </AgendaProvider>
      </body>
    </html>
  );
}
