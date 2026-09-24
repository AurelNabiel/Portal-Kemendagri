import HeroToday from '@/components/home/HeroToday';
import WeekStrip from '@/components/home/WeekStrip';
import NewsSlider from '@/components/home/NewsSlider';
import QuickServices from '@/components/home/QuickServices';

export default function HomePage() {
  return (
    <>
      <HeroToday />
      <WeekStrip />
      <NewsSlider />
      <QuickServices />
    </>
  );
}
