import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingNav from '@/components/landing/LandingNav';
import {
  ArrowRight, BookOpen, Clock, Heart, Share2, Filter, Award, Target, Eye
} from 'lucide-react';

interface Article {
  id: string;
  title: string;
  category: 'jee' | 'neet' | 'cuet' | 'study-skills' | 'ai-learning';
  categoryLabel: string;
  readTime: string;
  excerpt: string;
  publishDate: string;
  image: string;
  author: string;
}

export const BlogPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    document.title = "PrepEntrance Blog & Resources — Strategy Guides & About Us";
    window.scrollTo({ top: 0 });
  }, []);

  const categories = [
    { value: 'all', label: 'All Articles' },
    { value: 'jee', label: 'JEE Prep' },
    { value: 'neet', label: 'NEET Prep' },
    { value: 'cuet', label: 'CUET Prep' },
    { value: 'study-skills', label: 'Study Skills' },
    { value: 'ai-learning', label: 'AI & Learning' },
  ];

  const articles: Article[] = [
    {
      id: 'jee-2027',
      title: 'How to Crack JEE in 2027: Syllabus Strategy & Roadmap',
      category: 'jee',
      categoryLabel: 'JEE Prep',
      readTime: '6 min read',
      excerpt: 'Struggling to manage Class 11 chapters with class schedules? Here is a breakdown of physics, math, and chemistry preparation tactics.',
      publishDate: 'June 15, 2026',
      image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80',
      author: 'Academic Operations Team'
    },
    {
      id: 'neet-strategy',
      title: 'NEET Preparation Strategy: Biology Diagrams & Chemistry Formula Mastery',
      category: 'neet',
      categoryLabel: 'NEET Prep',
      readTime: '8 min read',
      excerpt: 'Achieve 340+ in biology by mastering diagrams and structural classifications. We outline the high-yield sections you need to memorize.',
      publishDate: 'June 10, 2026',
      image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80',
      author: 'Biology Subject Head'
    },
    {
      id: 'cuet-guide',
      title: 'CUET Preparation Guide: Cracking Language & General Tests',
      category: 'cuet',
      categoryLabel: 'CUET Prep',
      readTime: '5 min read',
      excerpt: 'How to balance Domain subjects alongside the General Aptitude modules. Key speed techniques for numerical and logic questions.',
      publishDate: 'June 08, 2026',
      image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=600&q=80',
      author: 'CUET Strategy Planner'
    },
    {
      id: 'study-skills-hacks',
      title: 'Top 5 Study Skills & Productivity Hacks for Long-Duration Retention',
      category: 'study-skills',
      categoryLabel: 'Study Skills',
      readTime: '4 min read',
      excerpt: 'Why passive reading fails. Discover the scientifically-proven advantages of active recall, spacing, and memory visual mapping.',
      publishDate: 'June 04, 2026',
      image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=600&q=80',
      author: 'Cognitive Science Expert'
    },
    {
      id: 'ai-learning-future',
      title: 'AI Learning & Study Planning: Why One-Size-Fits-All Classrooms are Obsolete',
      category: 'ai-learning',
      categoryLabel: 'AI & Learning',
      readTime: '7 min read',
      excerpt: 'Discover how machine learning dynamically tracks student preparation metrics to target conceptual weak points in real-time.',
      publishDate: 'May 28, 2026',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
      author: 'PrepEntrance AI Team'
    }
  ];

  const filteredArticles = selectedCategory === 'all'
    ? articles
    : articles.filter(a => a.category === selectedCategory);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 overflow-x-hidden font-sans">
      <LandingNav />

      {/* 1. HERO SECTION */}
      <section className="bg-gradient-to-b from-slate-100 to-white border-b border-slate-100 py-16 text-center">
        <div className="max-w-4xl mx-auto px-6 space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" /> Strategy &amp; Growth
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Knowledge &amp; Strategy Hub
          </h1>
          <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">
            Expert strategies, memory hacks, and prep guides to help you perform and succeed on exam day.
          </p>
        </div>
      </section>

      {/* 2. CATEGORY FILTERS & ARTICLES GRID */}
      <section className="py-16 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Categories Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-12 border-b border-slate-200 pb-8">
          <Filter className="w-4 h-4 text-slate-400 mr-2" />
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4.5 py-2 text-xs font-bold rounded-lg transition-all ${
                selectedCategory === cat.value
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white border border-slate-200 hover:border-slate-300 text-slate-600'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Articles list grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.map((art) => (
            <article key={art.id} className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden hover:shadow-lg hover:border-blue-500/20 hover:translate-y-[-2px] transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="relative h-48 bg-slate-100 overflow-hidden">
                  <img src={art.image} alt={art.title} className="w-full h-full object-cover" />
                  <span className="absolute top-4 left-4 bg-slate-900/90 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-md backdrop-blur-xs">
                    {art.categoryLabel}
                  </span>
                </div>
                
                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-3 text-slate-400 text-xs font-bold uppercase tracking-widest">
                    <span>{art.publishDate}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {art.readTime}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 leading-snug hover:text-blue-600 cursor-pointer">
                    {art.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed font-medium">
                    {art.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black uppercase tracking-wider text-slate-600 border border-slate-200">
                    {art.author.charAt(0)}
                  </div>
                  <span className="text-xs font-bold text-slate-600">{art.author}</span>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                    <Heart className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 3. ABOUT PREPENTRANCE BRAND BLOCK */}
      <section className="py-20 bg-slate-900 text-white border-b border-slate-950">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
                <Target className="w-3.5 h-3.5" /> Who We Are
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                About PrepEntrance
              </h2>
              <p className="text-slate-300 font-medium leading-relaxed">
                PrepEntrance is an AI-powered preparation platform helping students prepare smarter for JEE, NEET and CUET through adaptive practice, personalized study plans, intelligent analytics and a 24×7 AI Mentor.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                <div className="space-y-2 border-l-2 border-blue-500 pl-4">
                  <h4 className="font-extrabold uppercase text-xs text-blue-400 tracking-widest">Our Mission</h4>
                  <p className="text-slate-100 font-bold text-lg">Prepare. Perform. Succeed.</p>
                  <p className="text-slate-400 text-xs font-medium">To empower every aspirant with an adaptive workspace that ensures concept confidence.</p>
                </div>
                
                <div className="space-y-2 border-l-2 border-violet-500 pl-4">
                  <h4 className="font-extrabold uppercase text-xs text-violet-400 tracking-widest">Our Vision</h4>
                  <p className="text-slate-100 font-bold text-lg">Personalized preparation at scale</p>
                  <p className="text-slate-400 text-xs font-medium">To build India's most personalized exam preparation platform accessible to everyone.</p>
                </div>
              </div>
            </div>

            {/* Aesthetic card for the logo badge / branding */}
            <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              
              <div className="brand-logo-container rounded-2xl w-20 h-20 mx-auto bg-white flex items-center justify-center shadow-lg">
                <img 
                  src="/prepentrance-logo.png" 
                  alt="PrepEntrance Logo" 
                  className="brand-logo-img" 
                />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black tracking-tight text-white">PrepEntrance</h3>
                <p className="text-slate-400 text-xs font-extrabold uppercase tracking-[0.2em]">Prepare. Perform. Succeed.</p>
              </div>

              <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl max-w-sm mx-auto text-xs font-semibold text-slate-300">
                🔒 Secure, AI-driven practice environments mapped directly to official NTA syllabus definitions.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FOUNDER STORY */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5" /> Founder Story
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            How PrepEntrance Started
          </h2>
          <p className="text-slate-500 font-medium leading-relaxed text-left max-w-2xl mx-auto">
            PrepEntrance was conceptualized by educators and software engineers who noticed a critical flaw in current coaching systems: classrooms teach at a generic pace, ignoring individual speed thresholds and conceptual gaps. By using machine learning, we built a tool that molds itself around the student.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                👤
              </div>
              <div className="text-left">
                <h5 className="font-bold text-slate-900">Ayush Dixit</h5>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Founder, PrepEntrance</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-8 mb-10">

            {/* Brand */}
            <div className="col-span-2 sm:col-span-4 lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="brand-logo-container rounded-xl w-12 h-12 bg-white flex items-center justify-center">
                  <img 
                    src="/prepentrance-logo.png" 
                    alt="PrepEntrance Logo" 
                    className="brand-logo-img" 
                  />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="font-black text-[20px] text-white tracking-tight">PrepEntrance</span>
                  <span className="text-[9px] font-bold text-slate-400 tracking-[0.18em] uppercase mt-0.5">Prepare. Perform. Succeed.</span>
                </div>
              </div>
              <p className="text-[13px] text-slate-400 font-medium leading-relaxed max-w-xs">
                AI-first personalized practice workspace built to help students crack JEE, NEET and CUET.
              </p>
            </div>

            {/* Exams */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-black text-white uppercase tracking-widest">Exams</h4>
              <ul className="space-y-2.5">
                {['JEE', 'NEET', 'CUET'].map((e) => (
                  <li key={e}>
                    <button onClick={() => navigate(`/${e.toLowerCase()}`)} className="text-[13px] text-slate-400 font-semibold hover:text-white transition-colors">{e}</button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-black text-white uppercase tracking-widest">Resources</h4>
              <ul className="space-y-2.5">
                <li>
                  <button onClick={() => navigate('/blog')} className="text-[13px] text-slate-400 font-semibold hover:text-white transition-colors">Blog</button>
                </li>
                <li>
                  <button onClick={() => navigate('/login')} className="text-[13px] text-slate-400 font-semibold hover:text-white transition-colors">Study Material</button>
                </li>
                <li>
                  <button onClick={() => navigate('/practice-tests')} className="text-[13px] text-slate-400 font-semibold hover:text-white transition-colors">Mock Tests</button>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-black text-white uppercase tracking-widest">Company</h4>
              <ul className="space-y-2.5">
                <li>
                  <button onClick={() => navigate('/blog')} className="text-[13px] text-slate-400 font-semibold hover:text-white transition-colors">About</button>
                </li>
                <li>
                  <button onClick={() => navigate('/login')} className="text-[13px] text-slate-400 font-semibold hover:text-white transition-colors">Contact</button>
                </li>
                <li>
                  <button onClick={() => navigate('/login')} className="text-[13px] text-slate-400 font-semibold hover:text-white transition-colors">Careers</button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom row */}
          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] font-semibold text-slate-500">
            <span>© {new Date().getFullYear()} PrepEntrance. All rights reserved.</span>
            <div className="flex gap-5">
              <button onClick={() => navigate('/privacy')} className="hover:text-slate-300 transition-colors">Privacy Policy</button>
              <button onClick={() => navigate('/terms')} className="hover:text-slate-300 transition-colors">Terms of Service</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BlogPage;
