'use client';

import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { A11y, Autoplay, Keyboard, Pagination } from 'swiper/modules';
import { subDays } from 'date-fns';
import { Award, BarChart3, ChevronLeft, ChevronRight, FileText, IdCard, Landmark, Map } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/pagination';
import { NEWS } from '@/lib/news-data';
import { apiFetch } from '@/lib/api';
import { fmt } from '@/lib/date';
import { jakartaNow } from '@/hooks/useNow';

const ICONS = { landmark: Landmark, id: IdCard, map: Map, chart: BarChart3, award: Award, file: FileText };

export default function NewsSlider() {
  const [swiper, setSwiper] = useState(null);
  const [today, setToday] = useState(null);
  const [news, setNews] = useState(NEWS);
  useEffect(() => setToday(jakartaNow()), []);
  useEffect(() => {
    apiFetch('/contents/public?type=NEWS')
      .then((data) => {
        if (!data.items?.length) return;
        setNews(data.items.map((item, index) => ({
          id: item.id,
          title: item.title,
          excerpt: item.summary || item.body?.slice(0, 180) || '',
          category: 'Berita',
          publishedAt: item.publishedAt,
          icon: 'file',
          tone: index % 2 ? 'tan' : 'navy',
        })));
      })
      .catch(() => {});
  }, []);

  return (
    <section id="berita" className="bg-navy-50">
      <div className="container-page py-16 sm:py-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-3xl text-navy-900">Berita terkini</h2>
            <p className="mt-2 max-w-xl text-navy-600">Informasi kebijakan dan kegiatan Kementerian Dalam Negeri.</p>
          </div>
          <div className="hidden gap-2 sm:flex">
            <button
              type="button"
              onClick={() => swiper?.slidePrev()}
              className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-full border border-navy-200 bg-white text-navy-700 hover:border-navy-400"
              aria-label="Berita sebelumnya"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => swiper?.slideNext()}
              className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-full bg-navy-800 text-white hover:bg-navy-900"
              aria-label="Berita berikutnya"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <Swiper
          className="news-swiper mt-8 !pb-12"
          modules={[Autoplay, Pagination, A11y, Keyboard]}
          onSwiper={setSwiper}
          spaceBetween={20}
          slidesPerView={1.08}
          breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}
          autoplay={{ delay: 6000, disableOnInteraction: false, pauseOnMouseEnter: true }}
          pagination={{ clickable: true }}
          keyboard={{ enabled: true }}
          a11y={{ prevSlideMessage: 'Berita sebelumnya', nextSlideMessage: 'Berita berikutnya', paginationBulletMessage: 'Ke berita {{index}}' }}
          loop
        >
          {news.map((item) => {
            const Icon = ICONS[item.icon] ?? FileText;
            const navy = item.tone === 'navy';
            return (
              <SwiperSlide key={item.id} className="!h-auto">
                <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-navy-100 bg-white">
                  <div className={`relative flex h-44 items-end overflow-hidden p-5 ${navy ? 'bg-navy-800' : 'bg-tan-300'}`}>
                    <div className="kawung absolute inset-0" aria-hidden />
                    <Icon
                      className={`absolute -right-4 -top-4 h-36 w-36 transition-transform duration-700 group-hover:rotate-6 ${
                        navy ? 'text-navy-600' : 'text-tan-400'
                      }`}
                      strokeWidth={1}
                      aria-hidden
                    />
                    <span className={`relative rounded-full px-3 py-1 text-xs font-semibold ${navy ? 'bg-tan-300 text-navy-950' : 'bg-navy-800 text-white'}`}>
                      {item.category}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <time className="text-sm text-navy-500" suppressHydrationWarning>
                      {item.publishedAt ? fmt(new Date(String(item.publishedAt).replace(' ', 'T')), 'd MMMM yyyy') : today ? fmt(subDays(today, item.daysAgo || 0), 'd MMMM yyyy') : '\u00A0'}
                    </time>
                    <h3 className="mt-2 font-serif text-xl leading-snug text-navy-900">
                      <a href="#" className="focus-ring rounded after:absolute after:inset-0 hover:text-navy-700">
                        {item.title}
                      </a>
                    </h3>
                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-navy-600">{item.excerpt}</p>
                  </div>
                </article>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </section>
  );
}
