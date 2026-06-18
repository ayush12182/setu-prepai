import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Bot, BarChart3, Trophy, Phone, Mail, Globe, Sparkles, MapPin, ShieldCheck } from 'lucide-react';

const FEATURE_CARDS = [
  {
    Icon: Target,
    title: 'Personalized Learning',
    desc: 'Study plans tailored to your goals, strengths, and weaknesses.',
  },
  {
    Icon: Bot,
    title: 'AI Mentor',
    desc: 'Get instant doubt solving, concept explanations, and study guidance 24/7.',
  },
  {
    Icon: BarChart3,
    title: 'Performance Analytics',
    desc: 'Track progress, identify weak areas, and improve strategically.',
  },
  {
    Icon: Trophy,
    title: 'Exam-Focused Preparation',
    desc: 'Mock tests, PYQs, revision plans, and exam-specific resources.',
  },
];

const CONTACT_CARDS = [
  {
    Icon: Phone,
    label: 'Phone',
    value: '+91 7022030404',
    link: 'tel:+917022030404',
  },
  {
    Icon: Mail,
    label: 'Email',
    value: 'contact.prepentrance@gmail.com',
    link: 'mailto:contact.prepentrance@gmail.com',
  },
  {
    Icon: MapPin,
    label: 'Headquarters',
    value: 'Bengaluru, Karnataka, India',
    link: '#',
  },
  {
    Icon: ShieldCheck,
    label: 'Company Status',
    value: 'Incorporated Firm',
    link: '#',
  },
];

const AboutSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-white py-24 px-6 md:px-20 select-none font-sans overflow-hidden border-t border-[#F0EDE6]/50">
      <div className="max-w-[1200px] mx-auto">
        
        {/* SECTION 1: HEADER & HEADLINE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start mb-20">
          
          {/* Left Column (Section Title & Saffron Eyebrow) */}
          <div className="lg:col-span-5 reveal">
            <span className="text-[11px] font-sans font-extrabold uppercase tracking-[2px] text-[#FF6B00] mb-3 block">
              ABOUT US
            </span>
            <h2 className="text-3xl sm:text-[44px] font-sans font-black text-[#0D1117] leading-tight tracking-tight">
              About PrepEntrance
            </h2>
            <div className="w-16 h-1 bg-[#FF6B00] rounded-full mt-4" />
          </div>

          {/* Right Column (Headline & Detailed Descriptions) */}
          <div className="lg:col-span-7 flex flex-col gap-6 font-sans text-[#374151] text-[16px] leading-[1.65] font-medium reveal">
            <h3 className="text-xl sm:text-[24px] font-sans font-extrabold text-[#0D1117] leading-snug tracking-tight mb-2">
              Empowering Every Student to Reach Their Dream College.
            </h3>
            
            <p className="text-[#374151]">
              PrepEntrance is an AI-powered learning platform built to make entrance exam preparation smarter, more personalized, and more effective.
            </p>
            
            <p className="text-[#374151]">
              Whether you're preparing for JEE, NEET, CUET, Olympiads, or school examinations, our platform combines structured study plans, intelligent practice, mock tests, PYQs, and an AI Mentor to guide you every step of the way.
            </p>
            
            <p className="text-[#374151]">
              We believe every student deserves access to high-quality preparation, clear guidance, and personalized support—regardless of their background or location.
            </p>
            
            <div className="pt-2">
              <span className="text-[#FF6B00] font-sans font-extrabold text-[12px] uppercase tracking-wider block mb-1">
                OUR MISSION IS SIMPLE
              </span>
              <p className="text-lg font-sans font-extrabold text-[#0D1117] leading-relaxed">
                Help students learn better, stay consistent, and achieve their academic goals with confidence.
              </p>
            </div>
          </div>

        </div>

        {/* SECTION 2: 2x2 DETAILED FEATURE CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-24">
          {FEATURE_CARDS.map((card, idx) => (
            <div
              key={idx}
              className="reveal flex items-start gap-5 p-7 rounded-[20px] bg-[#FAFAF7] border border-[#F0EDE6] shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:translate-y-[-6px] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all duration-300 cursor-default"
            >
              {/* Colored icon container (40px circle) */}
              <div className="w-11 h-11 rounded-full bg-[#FFF0E6] text-[#FF6B00] flex items-center justify-center shrink-0 shadow-sm">
                <card.Icon className="w-5.5 h-5.5 stroke-[1.8]" />
              </div>
              
              <div>
                <h4 className="font-sans font-extrabold text-lg text-[#0D1117] mb-1.5 leading-snug">
                  {card.title}
                </h4>
                <p className="font-sans font-medium text-sm text-[#374151] leading-relaxed">
                  {card.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* SECTION 3: MISSION & VISION SIDE-BY-SIDE PANELS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          
          {/* Mission Card */}
          <div className="reveal relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#FF6B00] to-[#E55A00] rounded-[20px] blur opacity-10 group-hover:opacity-20 transition duration-300" />
            <div className="relative p-9 rounded-[20px] bg-white border border-[#F0EDE6] shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col justify-between h-full hover:border-[#FF6B00]/20 transition-all duration-300">
              <div>
                <div className="w-10 h-10 rounded-full bg-[#FFF0E6] text-[#FF6B00] flex items-center justify-center mb-6 shadow-sm shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className="font-sans font-extrabold text-2xl text-[#0D1117] mb-4">
                  Our Mission
                </h4>
                <p className="font-sans font-medium text-[15px] text-[#374151] leading-[1.65]">
                  To democratize quality education by combining technology, artificial intelligence, and proven learning strategies so every student can unlock their true potential.
                </p>
              </div>
            </div>
          </div>

          {/* Vision Card */}
          <div className="reveal relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-[20px] blur opacity-10 group-hover:opacity-20 transition duration-300" />
            <div className="relative p-9 rounded-[20px] bg-white border border-[#F0EDE6] shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col justify-between h-full hover:border-indigo-500/20 transition-all duration-300">
              <div>
                <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center mb-6 shadow-sm shrink-0">
                  <Target className="w-5 h-5" />
                </div>
                <h4 className="font-sans font-extrabold text-2xl text-[#0D1117] mb-4">
                  Our Vision
                </h4>
                <p className="font-sans font-medium text-[15px] text-[#374151] leading-[1.65]">
                  To become India's most trusted AI-powered academic companion for students preparing for competitive and board examinations.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* SECTION 4: CONTACT & GET IN TOUCH */}
        <div className="border-t border-[#F0EDE6]/50 pt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Contact Left Column */}
          <div className="lg:col-span-5 reveal">
            <span className="text-[11px] font-sans font-extrabold uppercase tracking-[2px] text-[#FF6B00] mb-2 block">
              SUPPORT CHANNEL
            </span>
            <h3 className="text-2xl sm:text-[32px] font-sans font-extrabold text-[#0D1117] mb-3 leading-tight tracking-tight">
              Get in Touch
            </h3>
            <p className="font-sans font-medium text-sm text-[#374151] leading-relaxed max-w-[85%]">
              Have questions, feedback, or need assistance? We'd love to hear from you.
            </p>
          </div>

          {/* Contact Right Column (2x2 Grid of Channels) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 reveal">
            {CONTACT_CARDS.map((channel, idx) => {
              const isLink = channel.link !== '#';
              const cardClass = "flex flex-col items-center text-center p-6 rounded-[20px] bg-[#FAFAF7] border border-[#F0EDE6] hover:border-[#FF6B00]/30 hover:bg-white hover:translate-y-[-4px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-all duration-300 group";
              
              const innerContent = (
                <>
                  <div className="w-10 h-10 rounded-full bg-[#FFF0E6] text-[#FF6B00] flex items-center justify-center mb-3 shrink-0 shadow-sm">
                    <channel.Icon className="w-4.5 h-4.5 stroke-[1.8]" />
                  </div>
                  <span className="font-sans font-extrabold text-[12px] text-[#475569] uppercase tracking-wide">
                    {channel.label}
                  </span>
                  <span className="font-sans font-bold text-sm text-[#0D1117] mt-1 break-all select-all">
                    {channel.value}
                  </span>
                </>
              );

              return isLink ? (
                <a href={channel.link} key={idx} className={cardClass}>
                  {innerContent}
                </a>
              ) : (
                <div key={idx} className={cardClass}>
                  {innerContent}
                </div>
              );
            })}
          </div>

        </div>

        {/* SECTION 5: FINAL CTA BUTTON */}
        <div className="flex flex-col items-center justify-center text-center mt-20 pt-8 border-t border-[#F0EDE6]/50 reveal">
          <p className="font-sans font-bold text-[#374151] text-sm mb-4">
            Start Your Learning Journey
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="text-sm font-sans font-extrabold px-8 py-3.5 rounded-xl bg-[#FF6B00] hover:bg-gradient-to-r hover:from-[#FF6B00] hover:to-[#E55A00] text-white hover:scale-[1.03] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 shadow-md shadow-[#FF6B00]/10 cursor-pointer"
            aria-label="Start Free Trial"
          >
            Start Free Trial
          </button>
        </div>

      </div>
    </section>
  );
};

export default AboutSection;
