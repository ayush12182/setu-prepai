import React from 'react';
import LandingNav from '@/components/landing/LandingNav';
import HeroSection from '@/components/landing/HeroSection';
import TrustStrip from '@/components/landing/TrustStrip';
import AboutSection from '@/components/landing/AboutSection';
import ExamTracksSection from '@/components/landing/ExamTracksSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import ResultsSection from '@/components/landing/ResultsSection';
import PricingSection from '@/components/landing/PricingSection';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import LeadershipSection from '@/components/landing/LeadershipSection';
import FinalCTA from '@/components/landing/FinalCTA';
import LandingFooter from '@/components/landing/LandingFooter';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#07111F] text-white overflow-x-hidden">
      <LandingNav />
      <HeroSection />
      <TrustStrip />
      <ExamTracksSection />
      <FeaturesSection />
      <AboutSection />
      <ResultsSection />
      <PricingSection />
      <TestimonialsSection />
      <LeadershipSection />
      <FinalCTA />
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
