import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Instagram, Linkedin } from 'lucide-react';

const LandingFooter: React.FC = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: 'Product',
      links: [
        { label: 'Features',        action: () => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }) },
        { label: 'AI Engine',       action: () => document.getElementById('ai-engine')?.scrollIntoView({ behavior: 'smooth' }) },
        { label: 'Analytics',       action: () => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' }) },
        { label: 'Pricing',         action: () => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }) },
      ],
    },
    {
      title: 'Exams',
      links: [
        { label: 'JEE Main',        action: () => navigate('/auth?exam=jee') },
        { label: 'JEE Advanced',    action: () => navigate('/auth?exam=jee') },
        { label: 'NEET UG',         action: () => navigate('/auth?exam=neet') },
        { label: 'CUET UG',         action: () => navigate('/auth?exam=cuet') },
        { label: 'Class 11',        action: () => navigate('/auth?class=11') },
        { label: 'Class 12',        action: () => navigate('/auth?class=12') },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About',           action: () => navigate('/about') },
        { label: 'Leadership',      action: () => navigate('/about') },
        { label: 'Contact Us',      action: () => window.open('mailto:setu.edu.1925@gmail.com') },
        { label: 'Testimonials',    action: () => document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' }) },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Terms of Service', action: () => {} },
        { label: 'Privacy Policy',   action: () => {} },
        { label: 'Refund Policy',    action: () => {} },
      ],
    },
  ];

  const socials = [
    { Icon: Instagram, href: 'https://www.instagram.com/setu.prep?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==', label: 'Instagram' },
    { Icon: Linkedin,  href: 'https://www.linkedin.com/company/setu.ai/', label: 'LinkedIn' },
    { Icon: Mail,      href: 'mailto:setu.edu.1925@gmail.com', label: 'Email' },
  ];

  return (
    <footer className="border-t border-white/[0.06] bg-[#07111F]">
      {/* Main grid */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-16 pb-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-10 mb-14">

          {/* Brand column */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1 space-y-5">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-3 group"
            >
              <img src="/setu-logo.png" alt="SETU" className="h-9 w-9 object-contain" />
              <div>
                <span className="font-bold text-xl text-white tracking-wide">SETU</span>
                <p className="text-[#94A3B8] text-[10px] leading-none mt-0.5">AI Academic OS</p>
              </div>
            </button>
            <p className="text-[#94A3B8] text-sm leading-relaxed max-w-xs">
              Your AI Academic Operating System for JEE, NEET, and CUET. Precision preparation for Class 11 & 12 aspirants.
            </p>

            {/* Social links */}
            <div>
              <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">Connect</p>
              <div className="flex items-center gap-3">
                {socials.map(({ Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="w-9 h-9 rounded-xl border border-white/[0.1] flex items-center justify-center text-[#94A3B8] hover:text-white hover:border-[#FF9B54]/40 hover:bg-[#FF9B54]/8 transition-all"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* App badges placeholder */}
            <div className="flex gap-3">
              <div className="px-4 py-2.5 rounded-xl border border-white/[0.1] text-center hover:border-white/20 transition cursor-pointer group">
                <p className="text-[9px] text-white/40 group-hover:text-white/60">GET IT ON</p>
                <p className="text-xs text-white font-semibold">Google Play</p>
              </div>
              <div className="px-4 py-2.5 rounded-xl border border-white/[0.1] text-center hover:border-white/20 transition cursor-pointer group">
                <p className="text-[9px] text-white/40 group-hover:text-white/60">DOWNLOAD ON</p>
                <p className="text-xs text-white font-semibold">App Store</p>
              </div>
            </div>
          </div>

          {/* Link columns */}
          {sections.map(s => (
            <div key={s.title}>
              <p className="text-white text-xs font-bold uppercase tracking-[0.15em] mb-5">{s.title}</p>
              <ul className="space-y-3.5">
                {s.links.map(l => (
                  <li key={l.label}>
                    <button
                      onClick={l.action}
                      className="text-[#94A3B8] text-sm hover:text-white transition-colors text-left leading-relaxed"
                    >
                      {l.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.06] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#94A3B8]/45 text-xs">
            © {new Date().getFullYear()} SETU. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <p className="text-[#94A3B8]/30 text-xs">Built for serious aspirants · India</p>
            <button
              onClick={() => navigate('/auth?mode=signup')}
              className="text-xs font-semibold px-4 py-2 rounded-xl bg-[#FF9B54]/10 border border-[#FF9B54]/25 text-[#FF9B54] hover:bg-[#FF9B54]/15 transition"
            >
              Start Free →
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
