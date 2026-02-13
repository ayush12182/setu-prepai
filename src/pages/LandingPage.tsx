import React from 'react';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { HeroSection } from '@/components/landing/HeroSection';
import { PillarsSection } from '@/components/landing/PillarsSection';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { MentorSection } from '@/components/landing/MentorSection';
import { TrustSection } from '@/components/landing/TrustSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { CTASection } from '@/components/landing/CTASection';
import { LandingFooter } from '@/components/landing/LandingFooter';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <LandingHeader />
      <HeroSection />
      <PillarsSection />
      <ProblemSection />
      <MentorSection />
      <HowItWorksSection />
      <TrustSection />
      <PricingSection />
      <CTASection />
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
