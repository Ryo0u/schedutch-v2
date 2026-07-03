import HeroSection from '@/features/home/components/HeroSection';
import StepsSection from '@/features/home/components/StepsSection';
import ComparisonSection from '@/features/home/components/ComparisonSection';
import ExtractSection from '@/features/home/components/ExtractSection';
import FeaturesSection from '@/features/home/components/FeaturesSection';
import CtaSection from '@/features/home/components/CtaSection';
import LpFooter from '@/features/home/components/LpFooter';
import MobileCtaBar from '@/features/home/components/MobileCtaBar';

export default function Page() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <HeroSection />
      <StepsSection />
      <ComparisonSection />
      <ExtractSection />
      <FeaturesSection />
      <CtaSection />
      <LpFooter />
      <MobileCtaBar />
    </div>
  );
}
