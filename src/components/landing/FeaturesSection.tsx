import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Bot, Camera, BarChart3 } from 'lucide-react';

interface FeatureItem {
  Icon: React.ComponentType<any>;
  iconBg: string;
  iconColor: string;
  title: string;
  desc: string;
  isPopular?: boolean;
}

const FEATURES: FeatureItem[] = [
  {
    Icon: Calendar,
    iconBg: 'bg-[#EFF6FF]',
    iconColor: 'text-[#2563EB]',
    title: 'Daily Study Plans',
    desc: 'Personalized schedules built around your weak areas and exam date.',
  },
  {
    Icon: Bot,
    iconBg: 'bg-[#FFF7ED]',
    iconColor: 'text-[#FF6B00]',
    title: 'AI Mentor (24/7)',
    desc: 'Ask anything, get instant concept explanations. 50,000+ questions answered.',
    isPopular: true,
  },
  {
    Icon: Camera,
    iconBg: 'bg-[#F0FDF4]',
    iconColor: 'text-[#16A34A]',
    title: 'Snap & Solve',
    desc: 'Snap a photo, get your solution. Step-by-step solutions in under 3 seconds.',
  },
  {
    Icon: BarChart3,
    iconBg: 'bg-[#FDF4FF]',
    iconColor: 'text-[#9333EA]',
    title: 'Rank Predictor',
    desc: 'See your expected rank based on your mock performance. Plan smarter.',
  },
];

const FeaturesSection: React.FC = () => {
  const navigate = useNavigate();

  const handleTryFeature = () => {
    navigate('/signup');
  };

  return (
    <section id="features" className="py-20 bg-white select-none">
      <div className="max-w-7xl mx-auto px-5 sm:px-20">
        
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-bold uppercase tracking-[2px] text-[#FF6B00] mb-3 font-sans">
            WHAT YOU GET
          </p>
          <h2 className="text-3xl sm:text-[42px] font-display font-black text-[#0D1117] leading-tight">
            Everything You Need to <span className="text-[#FF6B00]">Crack the Exam</span>
          </h2>
          <p className="text-[#6B7280] text-base sm:text-lg font-sans mt-3">
            One platform. Every tool. Zero compromise.
          </p>
        </div>

        {/* 2x2 Grid of Feature Cards */}
        <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto mt-12">
          {FEATURES.map((item, index) => (
            <div
              key={index}
              style={{ contentVisibility: 'auto' }}
              className="reveal rounded-2xl bg-[#FAFAF7] border-[1.5px] border-[#F0EDE6] hover:border-[#FF6B00] p-7 transition-all duration-200 cursor-default overflow-hidden relative group hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(255,107,0,0.06)]"
            >
              {/* Optional "POPULAR" Badge at top-right corner */}
              {item.isPopular && (
                <span className="absolute top-4 right-4 bg-[#FF6B00] text-white font-sans font-extrabold text-[10px] px-3 py-1 rounded-full shadow-sm select-none">
                  POPULAR
                </span>
              )}

              {/* 56x56px rounded square icon container */}
              <div className={`w-14 h-14 rounded-2xl ${item.iconBg} ${item.iconColor} flex items-center justify-center mb-5 shrink-0 shadow-sm transition-transform duration-200 group-hover:scale-105`}>
                <item.Icon className="w-7 h-7 stroke-[1.8]" />
              </div>

              {/* Title (Nunito, 800, 20px) */}
              <h3 className="text-xl sm:text-[20px] font-bold text-[#0D1117] font-display mb-2">
                {item.title}
              </h3>

              {/* Description (Inter, 400, 15px) */}
              <p className="text-[#6B7280] text-sm sm:text-[15px] font-sans leading-relaxed mb-4">
                {item.desc}
              </p>

              {/* Saffron Try this feature link */}
              <button
                onClick={handleTryFeature}
                className="text-[14px] font-bold text-[#FF6B00] hover:underline flex items-center gap-0.5 bg-transparent border-none p-0 cursor-pointer"
              >
                Try this feature →
              </button>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default FeaturesSection;
