import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Testimonial {
  initials: string;
  name: string;
  tag: string;
  quote: string;
  avatarBg: string;
  avatarColor: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    initials: 'RS',
    name: 'Rahul Sharma',
    tag: 'JEE Advanced Aspirant',
    quote: '"The AI mentor explained thermodynamics better than my coaching teacher. My mock score jumped from 85 to 142 in just 6 weeks."',
    avatarBg: 'bg-[#EFF6FF]',
    avatarColor: 'text-[#2563EB]',
  },
  {
    initials: 'PN',
    name: 'Priya Nair',
    tag: 'NEET Aspirant',
    quote: '"Daily study plans kept me consistent for 3 months straight. I never had to wonder what to study next."',
    avatarBg: 'bg-[#F0FDF4]',
    avatarColor: 'text-[#16A34A]',
  },
  {
    initials: 'AK',
    name: 'Arjun Kapoor',
    tag: 'JEE Mains Aspirant',
    quote: '"Snap & Solve is unbelievable. I cleared my entire Physics backlog in one weekend. Highly recommend."',
    avatarBg: 'bg-[#FFF7ED]',
    avatarColor: 'text-[#FF6B00]',
  },
  {
    initials: 'SM',
    name: 'Sneha Mehta',
    tag: 'CUET Aspirant',
    quote: '"The rank predictor was shockingly accurate. Helped me finalize my college strategy 2 months before the exam."',
    avatarBg: 'bg-[#FDF4FF]',
    avatarColor: 'text-[#9333EA]',
  },
];

const TestimonialsSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Since we show 2 testimonials at a time on desktop, total slides = length - 1
  const totalSlides = TESTIMONIALS.length - 1;

  const handleNext = () => {
    setActiveIndex((prev) => (prev >= totalSlides ? 0 : prev + 1));
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev <= 0 ? totalSlides : prev - 1));
  };

  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      handleNext();
    }, 5000); // 5s interval

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, activeIndex]);

  return (
    <section 
      id="testimonials" 
      className="py-20 bg-[#FAFAF7] select-none overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-20 relative z-10">
        
        {/* Header Section with Navigation controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="text-left">
            <h2 className="text-3xl sm:text-[42px] font-display font-black text-[#0D1117] leading-tight">
              What our <span className="text-[#FF6B00]">students</span> have to say?
            </h2>
            <p className="text-[#6B7280] text-base sm:text-lg font-sans mt-2">
              Hear it from the toppers.
            </p>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-3 self-start md:self-end">
            <button
              onClick={handlePrev}
              className="w-11 h-11 rounded-xl border border-[#F0EDE6] hover:border-[#FF6B00]/40 bg-white hover:bg-[#FF6B00]/5 flex items-center justify-center text-[#374151] hover:text-[#FF6B00] transition-all duration-300 shadow-sm"
              aria-label="Previous Testimonials"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="w-11 h-11 rounded-xl border border-[#F0EDE6] hover:border-[#FF6B00]/40 bg-white hover:bg-[#FF6B00]/5 flex items-center justify-center text-[#374151] hover:text-[#FF6B00] transition-all duration-300 shadow-sm"
              aria-label="Next Testimonials"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Carousel sliding view */}
        <div className="relative overflow-hidden w-full py-4">
          <div 
            className="flex transition-transform duration-500 ease-out gap-6"
            style={{ transform: `translateX(-${activeIndex * 50}%)` }}
          >
            {TESTIMONIALS.map((t, idx) => (
              <div 
                key={idx}
                className="reveal w-full md:w-[48%] shrink-0 whitespace-normal rounded-2xl bg-white border-[1.5px] border-[#F0EDE6] p-7 shadow-sm hover:border-[#FF6B00]/30 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Top row: Avatar circle + name + exam tag */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Initials Custom Color Avatar (44px circle) with Verified Badge */}
                      <div className="relative shrink-0 select-none">
                        <div className={`w-11 h-11 rounded-full ${t.avatarBg} ${t.avatarColor} font-display font-black flex items-center justify-center text-sm shadow-sm`}>
                          {t.initials}
                        </div>
                        {/* Small verified checkmark circle (16px, bg #FF6B00) */}
                        <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#FF6B00] border border-white text-white font-sans font-black flex items-center justify-center text-[9px] shadow-sm select-none">
                          ✓
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-[#0D1117] text-sm sm:text-base font-bold font-display leading-tight">{t.name}</h4>
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#F0F9FF] text-[#0369A1] font-sans font-bold text-[10px] mt-1 shadow-sm">
                          {t.tag}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stars + star count text */}
                  <div className="flex items-center gap-2 my-3 select-none">
                    <div className="flex gap-1 text-[#FF6B00] text-lg">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                    </div>
                    {/* Add star count text: "5.0" next to stars in Inter 600 14px #FF6B00 */}
                    <span className="font-sans font-semibold text-sm text-[#FF6B00] mt-0.5">5.0</span>
                  </div>

                  {/* Quote: Inter 400 15px #374151 italic */}
                  <p className="text-[#374151] text-sm sm:text-[15px] font-sans font-medium italic leading-relaxed">
                    {t.quote}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Indicator dots */}
        <div className="flex justify-center items-center gap-2 mt-8 select-none">
          {Array.from({ length: TESTIMONIALS.length - 1 }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                activeIndex === idx ? 'w-6 bg-[#FF6B00]' : 'w-2 bg-white/20 border border-gray-300'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

      </div>

      {/* Responsive mobile slider logical overlay */}
      <style>{`
        @media (max-width: 768px) {
          #testimonials .flex {
            transform: translateX(-${activeIndex * 100}%) !important;
          }
          #testimonials .shrink-0 {
            width: 100% !important;
          }
        }
      `}</style>
    </section>
  );
};

export default TestimonialsSection;
