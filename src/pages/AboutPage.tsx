import React from 'react';
import LandingNav from '@/components/landing/LandingNav';
import LandingFooter from '@/components/landing/LandingFooter';
import LeadershipSection from '@/components/landing/LeadershipSection';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#07111F] text-white overflow-x-hidden flex flex-col">
      <LandingNav />
      
      {/* Spacer for fixed nav */}
      <div className="pt-24" />

      <main className="flex-grow">
        <LeadershipSection />
      </main>

      <LandingFooter />
    </div>
  );
};

export default AboutPage;
