import React from 'react';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { HeroSection } from '@/components/landing/HeroSection';
import { MarqueeTicker } from '@/components/landing/MarqueeTicker';
import { ProgramsSection } from '@/components/landing/ProgramsSection';
import { PillarsSection } from '@/components/landing/PillarsSection';
import { LearningJourneySection } from '@/components/landing/LearningJourneySection';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { MentorSection } from '@/components/landing/MentorSection';
import { TrustSection } from '@/components/landing/TrustSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { CTASection } from '@/components/landing/CTASection';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { B2BSection } from '@/components/landing/B2BSection';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#1E2A3A] text-white overflow-x-hidden">
      <LandingHeader />
      <HeroSection />
      <MarqueeTicker />
      <ProgramsSection />
      <LearningJourneySection />
      <PillarsSection />
      <ProblemSection />
      <MentorSection />
      <HowItWorksSection />
      <TrustSection />
      <PricingSection />
      <B2BSection />
      <CTASection />
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
