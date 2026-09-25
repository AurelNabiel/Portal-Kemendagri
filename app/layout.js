import { Source_Serif_4, Public_Sans } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { AuthProvider } from '@/context/AuthProvider';
const serif=Source_Serif_4({subsets:['latin'],weight:['400','600','700'],variable:'--font-serif',display:'swap'});
const sans=Public_Sans({subsets:['latin'],weight:['400','500','600','700'],variable:'--font-sans',display:'swap'});
export const metadata={title:{default:'Biro Administrasi Pimpinan Kemendagri',template:'%s | Biro Administrasi Pimpinan Kemendagri'},description:'Portal informasi Biro Administrasi Pimpinan Kementerian Dalam Negeri Republik Indonesia.',icons:{icon:'/kemendagri.svg',shortcut:'/kemendagri.svg',apple:'/kemendagri.svg'}};
export const viewport={themeColor:'#0A1D38'};
export default function RootLayout({children}){return <html lang="id" className={`${serif.variable} ${sans.variable}`}><body className="flex min-h-screen flex-col"><AuthProvider><a href="#konten" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-tan-400 focus:px-4 focus:py-2 focus:text-navy-950">Langsung ke konten</a><Header/><main id="konten" className="flex-1">{children}</main><Footer/></AuthProvider></body></html>}
