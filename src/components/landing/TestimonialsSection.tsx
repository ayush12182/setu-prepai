import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

interface Testimonial {
  initials: string;
  name: string;
  tag: string;
  quote: string;
  avatarBg: string;
  avatarColor: string;
  rating: number;
}

const TESTIMONIALS: Testimonial[] = [
  {
    initials: 'PN',
    name: 'Priya Nair',
    tag: 'NEET Aspirant',
    quote: '"Daily study plans kept me consistent for 3 months straight. I never had to wonder what to study next."',
    avatarBg: 'bg-emerald-50',
    avatarColor: 'text-emerald-500',
    rating: 5,
  },
  {
    initials: 'AK',
    name: 'Arjun Kapoor',
    tag: 'JEE Main Aspirant',
    quote: '"Snap & Solve is unbelievable. I cleared my entire Physics backlog in one weekend. Highly recommend."',
    avatarBg: 'bg-[#FFF0E6]',
    avatarColor: 'text-[#FF6B00]',
    rating: 5,
  },
  {
    initials: 'MM',
    name: 'Mehul Mishra',
    tag: 'JEE Advanced Aspirant',
    quote: '"Mock tests and analytics helped me identify weak chapters quickly. My scores improved consistently."',
    avatarBg: 'bg-blue-50',
    avatarColor: 'text-blue-500',
    rating: 5,
  },
  {
    initials: 'GS',
    name: 'Gauri Sharma',
    tag: 'NEET Aspirant',
    quote: '"The AI Mentor feels like having a personal teacher available 24/7. Doubts get solved instantly."',
    avatarBg: 'bg-emerald-50',
    avatarColor: 'text-emerald-500',
    rating: 5,
  },
  {
    initials: 'UG',
    name: 'Unnati Gupta',
    tag: 'CUET Aspirant',
    quote: '"The study planner kept me disciplined throughout my CUET preparation. Everything was organized."',
    avatarBg: 'bg-purple-50',
    avatarColor: 'text-purple-500',
    rating: 5,
  },
  {
    initials: 'SA',
    name: 'Stuti Agarwal',
    tag: 'JEE Main Aspirant',
    quote: '"Previous year questions and revision plans saved me a lot of time before exams."',
    avatarBg: 'bg-amber-50',
    avatarColor: 'text-amber-500',
    rating: 5,
  },
  {
    initials: 'AS',
    name: 'Akshat Saxena',
    tag: 'NEET Aspirant',
    quote: '"PrepEntrance helped me stay focused and track my progress every day. Highly recommended."',
    avatarBg: 'bg-rose-50',
    avatarColor: 'text-rose-500',
    rating: 5,
  },
  {
    initials: 'RS',
    name: 'Rahul Sharma',
    tag: 'JEE Advanced Aspirant',
    quote: '"The AI mentor explained thermodynamics better than my coaching teacher. My mock score jumped from 85 to 142 in just 6 weeks."',
    avatarBg: 'bg-blue-50',
    avatarColor: 'text-blue-500',
    rating: 5,
  },
];

const TestimonialsSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Monitor screen size for adaptive slide widths and steps
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const itemsPerSlide = isMobile ? 1 : 2;

  const handleNext = () => {
    setActiveIndex((prev) => {
      const step = isMobile ? 1 : 2;
      const nextIndex = prev + step;
      return nextIndex >= TESTIMONIALS.length ? 0 : nextIndex;
    });
  };

  const handlePrev = () => {
    setActiveIndex((prev) => {
      const step = isMobile ? 1 : 2;
      const prevIndex = prev - step;
      if (prevIndex < 0) {
        return isMobile ? TESTIMONIALS.length - 1 : TESTIMONIALS.length - 2;
      }
      return prevIndex;
    });
  };

  // Touch Swipe Handlers for Mobile Viewports
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
  };

  // Auto-slide effect every 4 seconds
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      handleNext();
    }, 4000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, isMobile, activeIndex]);

  // Clickable pagination dots count
  const dotsCount = isMobile ? TESTIMONIALS.length : TESTIMONIALS.length / 2;

  const handleDotClick = (dotIndex: number) => {
    setActiveIndex(dotIndex * (isMobile ? 1 : 2));
  };

  return (
    <section 
      id="testimonials" 
      className="py-24 bg-[#FAFAF7] select-none overflow-hidden border-t border-[#F0EDE6]/40 relative reveal"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Decorative Blur Background Accent */}
      <div className="absolute top-[20%] right-[-10%] w-[30vw] h-[30vw] rounded-full bg-[#FF6B00]/[0.015] blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-10%] w-[35vw] h-[35vw] rounded-full bg-[#FF6B00]/[0.01] blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 sm:px-12 relative z-10">
        
        {/* Section Header & Navigation Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="text-left max-w-2xl">
            <h2 className="text-3xl sm:text-[44px] font-display font-black text-[#0D1117] leading-tight tracking-tight">
              What our <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B00] to-[#E55A00]">students</span> have to say?
            </h2>
            <p className="text-[#374151] text-base sm:text-lg font-sans mt-3 font-medium leading-relaxed">
              Trusted by aspirants preparing for JEE, NEET, CUET, and Board Exams across India.
            </p>
          </div>

          {/* Saffron Styled Navigation Arrows */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handlePrev}
              className="w-12 h-12 rounded-xl border border-[#F0EDE6] hover:border-[#FF6B00]/40 bg-white hover:bg-[#FFF0E6] flex items-center justify-center text-[#374151] hover:text-[#FF6B00] transition-all duration-300 shadow-sm active:scale-[0.95] cursor-pointer"
              aria-label="Previous Testimonials"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
            </button>
            <button
              onClick={handleNext}
              className="w-12 h-12 rounded-xl border border-[#F0EDE6] hover:border-[#FF6B00]/40 bg-white hover:bg-[#FFF0E6] flex items-center justify-center text-[#374151] hover:text-[#FF6B00] transition-all duration-300 shadow-sm active:scale-[0.95] cursor-pointer"
              aria-label="Next Testimonials"
            >
              <ChevronRight className="w-5 h-5 stroke-[2.2]" />
            </button>
          </div>
        </div>

        {/* Carousel sliding view */}
        <div 
          className="relative overflow-hidden w-full py-4 cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div 
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${activeIndex * (100 / itemsPerSlide)}%)` }}
          >
            {TESTIMONIALS.map((t, idx) => (
              <div 
                key={idx}
                className="w-full md:w-1/2 shrink-0 px-3 transition-opacity duration-300"
              >
                {/* Premium Glassmorphic Student Card */}
                <div className="rounded-3xl bg-white/75 backdrop-blur-md border-[1.5px] border-[#F0EDE6] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.015)] hover:shadow-[0_16px_36px_rgba(255,107,0,0.05)] hover:border-[#FF6B00]/30 hover:translate-y-[-4px] transition-all duration-300 flex flex-col justify-between h-full min-h-[220px] group">
                  <div>
                    {/* Top row: Avatar + Verified Badge + Student Name */}
                    <div className="flex items-center gap-4">
                      
                      {/* Custom Color Initials Avatar (56px) */}
                      <div className="relative shrink-0 select-none">
                        <div className={`w-14 h-14 rounded-full ${t.avatarBg} ${t.avatarColor} font-display font-black flex items-center justify-center text-lg shadow-sm group-hover:scale-105 transition-transform duration-200`}>
                          {t.initials}
                        </div>
                        {/* Verified Badge */}
                        <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-[#FF6B00] border-2 border-white text-white font-sans font-black flex items-center justify-center text-[10px] shadow-sm select-none">
                          ✓
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-[#0D1117] text-base font-extrabold font-sans leading-tight">
                          {t.name}
                        </h4>
                        <span className="inline-block px-3 py-0.5 rounded-full bg-[#F0F9FF] text-[#0369A1] font-sans font-extrabold text-[10px] mt-1 shadow-sm uppercase tracking-wide">
                          {t.tag}
                        </span>
                      </div>

                    </div>

                    {/* Animated Gold Stars Rating */}
                    <div className="flex items-center gap-2 my-4 select-none">
                      <div className="flex gap-0.5 text-[#FF6B00]">
                        {Array.from({ length: t.rating }).map((_, i) => (
                          <Star 
                            key={i} 
                            className="w-4 h-4 fill-[#FF6B00] stroke-[#FF6B00] transition-transform duration-200 group-hover:scale-110" 
                            style={{ transitionDelay: `${i * 40}ms` }}
                          />
                        ))}
                      </div>
                      <span className="font-sans font-extrabold text-sm text-[#FF6B00]">5.0</span>
                    </div>

                    {/* Testimonial Quote */}
                    <p className="text-[#374151] text-sm sm:text-[15px] font-sans font-bold italic leading-relaxed">
                      {t.quote}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Clickable Pagination Dots */}
        <div className="flex justify-center items-center gap-2 mt-10 select-none">
          {Array.from({ length: dotsCount }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleDotClick(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                activeIndex === idx * (isMobile ? 1 : 2) 
                  ? 'w-7 bg-[#FF6B00] shadow-sm' 
                  : 'w-2.5 bg-white border border-gray-300 hover:border-[#FF6B00]/40'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

      </div>
    </section>
  );
};

export default TestimonialsSection;
