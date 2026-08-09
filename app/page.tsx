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
    <div className="bg-background text-foreground min-h-screen">
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
