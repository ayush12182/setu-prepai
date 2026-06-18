import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LandingNav from '@/components/landing/LandingNav';
import { blogArticles, BlogArticle } from '@/data/blogArticles';
import {
  Clock, Calendar, User, ArrowLeft, ArrowRight, BookOpen, 
  CheckCircle2, AlertTriangle, Lightbulb, GraduationCap, MessagesSquare
} from 'lucide-react';

export const BlogDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string>('');

  // Find the article matching the slug
  const article = blogArticles.find((a) => a.slug === slug);

  useEffect(() => {
    if (!article) {
      navigate('/blog', { replace: true });
      return;
    }

    // Set page title for SEO
    document.title = article.seoTitle;

    // Set page meta description dynamically
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', article.seoDescription);

    window.scrollTo({ top: 0 });
  }, [article, navigate]);

  // Set up intersection observer for Table of Contents active highlights
  useEffect(() => {
    if (!article) return;

    const headingIds = article.sections.map((s) => s.id);
    const elements = headingIds.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-10% 0px -70% 0px' }
    );

    elements.forEach((el) => observer.observe(el));
    return () => elements.forEach((el) => observer.unobserve(el));
  }, [article]);

  if (!article) return null;

  // Grab related articles: prioritize same category, fallback to others
  const related = blogArticles
    .filter((a) => a.slug !== article.slug && a.category === article.category)
    .slice(0, 2);
  if (related.length < 2) {
    const others = blogArticles
      .filter((a) => a.slug !== article.slug && a.category !== article.category)
      .slice(0, 2 - related.length);
    related.push(...others);
  }

  // Smooth scroll handler
  const handleScrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 overflow-x-hidden font-sans pb-16">
      <LandingNav />

      {/* 1. BACK NAVIGATION & CATEGORY BAR */}
      <div className="max-w-7xl mx-auto px-6 pt-8">
        <button
          onClick={() => navigate('/blog')}
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Knowledge Hub
        </button>
      </div>

      {/* 2. HERO HEADER SECTION */}
      <header className="max-w-4xl mx-auto px-6 pt-6 pb-8 text-left space-y-5">
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
          {article.categoryLabel}
        </span>
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          {article.title}
        </h1>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-5">
          <div className="flex items-center gap-1.5">
            <User className="w-4 h-4 text-slate-400" />
            <span>By <span className="text-slate-900">{article.author}</span> ({article.authorRole})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>{article.publishDate}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>{article.readTime}</span>
          </div>
        </div>
      </header>

      {/* 3. COVER IMAGE */}
      <div className="max-w-5xl mx-auto px-6 mb-12">
        <div className="relative rounded-3xl overflow-hidden aspect-[21/9] shadow-lg border border-slate-200">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* 4. MAIN ARTICLE GRID BODY */}
      <main className="max-w-7xl mx-auto px-6 grid lg:grid-cols-[1fr_300px] gap-12 items-start">
        {/* Left Column: Article Body */}
        <article className="space-y-8 text-left">
          
          {/* Quick Summary Block */}
          <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-6 md:p-8 shadow-inner space-y-3">
            <h3 className="text-base font-extrabold text-blue-900 uppercase tracking-widest flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-600" /> Quick Summary
            </h3>
            <p className="text-blue-950 font-medium leading-relaxed text-sm md:text-base">
              {article.quickSummary}
            </p>
          </div>

          {/* Dynamic Sections Render */}
          {article.sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24 space-y-4">
              <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight pb-2 border-b border-slate-100">
                {section.title}
              </h2>
              
              <div className="space-y-4">
                {section.content.map((p, i) => {
                  // Style bullet points if they start with a bullet character
                  if (p.startsWith('• ')) {
                    return (
                      <li key={i} className="list-none pl-5 relative text-slate-600 font-medium leading-relaxed text-sm md:text-base">
                        <span className="absolute left-0 text-blue-500 font-black">•</span>
                        {p.substring(2)}
                      </li>
                    );
                  }
                  return (
                    <p key={i} className="text-slate-600 font-medium leading-relaxed text-sm md:text-base">
                      {p}
                    </p>
                  );
                })}
              </div>

              {/* Callout box / Tip box */}
              {section.tips && section.tips.map((tip, idx) => (
                <div key={idx} className="bg-amber-50/80 border-l-4 border-amber-500 rounded-r-xl p-5 my-6 space-y-1.5">
                  <h4 className="text-xs font-black text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-600" /> Pro-Tip &amp; Insight
                  </h4>
                  <p className="text-slate-700 text-sm font-semibold leading-relaxed">
                    {tip}
                  </p>
                </div>
              ))}
            </section>
          ))}

          {/* Common Mistakes Highlight Block */}
          <section className="bg-rose-50/70 border border-rose-100 rounded-2xl p-6 md:p-8 space-y-4">
            <h3 className="text-base font-extrabold text-rose-900 uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" /> Common Mistakes to Avoid
            </h3>
            
            <div className="space-y-4">
              {article.commonMistakes.map((item, idx) => (
                <div key={idx} className="border-b border-rose-100 pb-3 last:border-b-0 last:pb-0 space-y-1.5">
                  <div className="text-sm font-black text-rose-950 flex items-start gap-1.5">
                    <span className="text-rose-500 mt-0.5">❌</span>
                    <span>{item.mistake}</span>
                  </div>
                  <div className="text-xs md:text-sm font-semibold text-slate-600 pl-6 flex items-start gap-1.5">
                    <span className="text-emerald-500">✔️</span>
                    <span><strong>Fix:</strong> {item.fix}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Recommended Action Plan Step-by-Step */}
          <section className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-6 md:p-8 space-y-4">
            <h3 className="text-base font-extrabold text-emerald-900 uppercase tracking-widest flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Recommended Action Plan
            </h3>

            <div className="space-y-4">
              {article.actionPlan.map((step, idx) => (
                <div key={idx} className="flex gap-4 items-start">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-black flex items-center justify-center shrink-0">
                    {idx + 1}
                  </div>
                  <p className="text-slate-700 text-sm md:text-base font-semibold leading-relaxed pt-0.5">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Key Takeaways Summary Block */}
          <section className="border border-slate-200 bg-slate-50/50 rounded-2xl p-6 md:p-8 space-y-3">
            <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-widest">
              Key Takeaways
            </h3>
            <ul className="space-y-2.5">
              {article.keyTakeaways.map((takeaway, idx) => (
                <li key={idx} className="list-none pl-6 relative text-slate-600 text-sm md:text-base font-semibold leading-relaxed">
                  <span className="absolute left-0 text-blue-600 font-bold">✓</span>
                  {takeaway}
                </li>
              ))}
            </ul>
          </section>

          {/* Bottom Dual Action PrepEntrance CTA Banner */}
          <section className="bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-violet-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
            
            <div className="space-y-3 relative z-10 max-w-xl mx-auto">
              <h3 className="text-xl md:text-2xl font-black text-white leading-tight">
                Ready to Implement These Strategies?
              </h3>
              <p className="text-slate-400 text-xs md:text-sm font-semibold leading-relaxed">
                Take the guesswork out of preparation. Practice syllabus chapters under our adaptive test engines and access study frameworks customized directly for you.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 relative z-10">
              <button
                onClick={() => navigate('/auth')}
                className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-xs md:text-sm shadow-md transition-all active:scale-[0.98] flex items-center gap-2"
              >
                Start Free Practice Test <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/ask-prepentrance')}
                className="px-6 py-3 rounded-xl border border-white/20 hover:border-white/40 hover:bg-white/5 text-white font-black text-xs md:text-sm transition-all active:scale-[0.98] flex items-center gap-2"
              >
                <MessagesSquare className="w-4 h-4" /> Talk To AI Mentor
              </button>
            </div>
          </section>
        </article>

        {/* Right Column: Sticky Sidebar Panel */}
        <aside className="space-y-8 lg:sticky lg:top-24">
          
          {/* Table of Contents Sticky Block */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 text-left shadow-xs">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
              Table of Contents
            </h4>
            <nav className="space-y-2.5">
              {article.sections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => handleScrollToSection(sec.id)}
                  className={`block text-left text-xs font-bold transition-colors w-full leading-normal ${
                    activeSection === sec.id
                      ? 'text-blue-600 border-l-2 border-blue-600 pl-2'
                      : 'text-slate-500 hover:text-slate-900 pl-2'
                  }`}
                >
                  {sec.title.replace(/^\d+\.\s*/, '')}
                </button>
              ))}
            </nav>
          </div>

          {/* Related Articles Widgets */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 text-left shadow-xs space-y-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Related Articles
            </h4>
            <div className="space-y-4">
              {related.map((rel) => (
                <div
                  key={rel.slug}
                  onClick={() => navigate(`/blog/${rel.slug}`)}
                  className="cursor-pointer group space-y-1.5"
                >
                  <div className="aspect-[16/10] bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                    <img
                      src={rel.image}
                      alt={rel.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <span className="inline-block text-[9px] font-black uppercase text-blue-600 tracking-wider">
                    {rel.categoryLabel}
                  </span>
                  <h5 className="text-xs font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
                    {rel.title}
                  </h5>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>

      {/* 5. FOOTER */}
      <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800 mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] font-semibold text-slate-500">
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

export default BlogDetailPage;
