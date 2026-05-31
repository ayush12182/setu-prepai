import React from 'react';
import LandingNav from '@/components/landing/LandingNav';
import HeroSection from '@/components/landing/HeroSection';
import CoachingMarquee from '@/components/landing/CoachingMarquee';
import CourseDiscoverySection from '@/components/landing/CourseDiscoverySection';
import PrepJourneySection from '@/components/landing/PrepJourneySection';
import AIAssistantSection from '@/components/landing/AIAssistantSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import AboutSection from '@/components/landing/AboutSection';
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
      <CoachingMarquee />
      <CourseDiscoverySection />
      <PrepJourneySection />
      <AIAssistantSection />
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
