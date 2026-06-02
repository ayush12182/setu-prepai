import React from 'react';
import LandingNav from '@/components/landing/LandingNav';
import FloatingAnnouncementBar from '@/components/landing/FloatingAnnouncementBar';
import HeroSection from '@/components/landing/HeroSection';
import SubjectTicker from '@/components/landing/SubjectTicker';
import StatsBar from '@/components/landing/StatsBar';
import ChallengeSection from '@/components/landing/ChallengeSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import WhyUs from '@/components/landing/WhyUs';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import PricingSection from '@/components/landing/PricingSection';
import AboutSection from '@/components/landing/AboutSection';
import LandingFooter from '@/components/landing/LandingFooter';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const LandingPage: React.FC = () => {
  // Activate scroll-reveal observations
  useScrollReveal();

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#0D1117] overflow-x-hidden selection:bg-[#FF6B00] selection:text-[#FAFAF7]">
      {/* 1. LandingNav (Stripe/Notion glassmorphic navigation) */}
      <LandingNav />
      
      {/* 2. FloatingAnnouncementBar */}
      <FloatingAnnouncementBar />
      
      {/* 3. HeroSection (staggered fade+slide-up on load for cards, headline, CTAs) */}
      <div id="hero">
        <HeroSection />
      </div>

      {/* 3.5. SubjectTicker (Saffron Horizontal Marquee) */}
      <SubjectTicker />
      
      {/* 4. StatsBar (Intersection Observer count-up on scroll) */}
      <StatsBar />
      
      {/* 5. ChallengeSection (2x3 interactive cards staggered 100ms on scroll) */}
      <div id="challenges">
        <ChallengeSection />
      </div>
      
      {/* 6. FeaturesSection (2x2 grid of cards with hover saffron border-lifts) */}
      <div id="features">
        <FeaturesSection />
      </div>

      {/* 6.5. WhyUs (Why choose PrepEntrance? comparison row) */}
      <WhyUs />
      
      {/* 7. TestimonialsSection (2-column toppers carousel, 5s auto-scroll) */}
      <TestimonialsSection />
      
      {/* 8. PricingSection (Student ₹249 vs Institute ₹349 side-by-side featured cards) */}
      <div id="pricing">
        <PricingSection />
      </div>

      {/* 8.5. AboutSection (Premium About Us component with id="about") */}
      <div id="about">
        <AboutSection />
      </div>
      
      {/* 9. LandingFooter (Brand columns with social Lucide icons & tagline) */}
      <div id="footer">
        <LandingFooter />
      </div>
    </div>
  );
};

export default LandingPage;
