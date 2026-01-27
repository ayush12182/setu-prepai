import React from 'react';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { HeroSection } from '@/components/landing/HeroSection';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { MentorSection } from '@/components/landing/MentorSection';
import { TrustSection } from '@/components/landing/TrustSection';
import { CTASection } from '@/components/landing/CTASection';
import { LandingFooter } from '@/components/landing/LandingFooter';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <LandingHeader />
      <HeroSection />
      <ProblemSection />
      <MentorSection />
      <TrustSection />
      <CTASection />
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
