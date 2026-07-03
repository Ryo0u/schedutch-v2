import '@/features/home/home.css';
import {
  HeroSection,
  StepsSection,
  ComparisonSection,
  ExtractSection,
  FeaturesSection,
  CtaSection,
  MobileCtaBar,
} from '@/features/home';

export default function Page() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <HeroSection />
      <StepsSection />
      <ComparisonSection />
      <ExtractSection />
      <FeaturesSection />
      <CtaSection />
      <MobileCtaBar />
    </div>
  );
}
