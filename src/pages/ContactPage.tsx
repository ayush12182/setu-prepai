import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingNav from '@/components/landing/LandingNav';
import { 
  MapPin, Mail, Phone, Building2, Send, CheckCircle2, ShieldCheck, Trophy, Sparkles, Brain
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    document.title = "Contact PrepEntrance — Help, Support & Partnerships";
    window.scrollTo({ top: 0 });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API request
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      // Clear success banner after 5 seconds
      setTimeout(() => setIsSuccess(false), 5000);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 overflow-x-hidden font-sans">
      <LandingNav />

      {/* 1. HERO SECTION */}
      <section className="relative bg-gradient-to-b from-slate-100 to-white border-b border-slate-100 py-20 text-center">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-50" />
        
        <div className="relative max-w-4xl mx-auto px-6 space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5" /> Support Channels
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Contact PrepEntrance
          </h1>
          <p className="text-slate-500 font-medium text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            We're here to help students, parents, mentors, and partners. Let's make your prep journey seamless.
          </p>
        </div>
      </section>

      {/* 2. MAIN LAYOUT GRID (Cards + Form) */}
      <section className="py-16 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Contact Cards & Partnerships (5 Columns) */}
          <div className="lg:col-span-5 space-y-8 text-left">
            
            {/* Info Cards Container */}
            <div className="space-y-4">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider mb-2">Corporate Directory</h3>
              
              {/* HQ Card */}
              <div className="flex gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-400 text-xs uppercase tracking-wider">Headquarters</h4>
                  <p className="text-slate-900 font-bold text-sm md:text-base mt-0.5">Bengaluru, Karnataka, India</p>
                </div>
              </div>

              {/* Email Card */}
              <a 
                href="mailto:contact.prepentrance@gmail.com"
                className="flex gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-500/30 hover:shadow-md transition-all block group"
              >
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-400 text-xs uppercase tracking-wider">Email Address</h4>
                  <p className="text-slate-900 font-bold text-sm md:text-base mt-0.5 group-hover:text-blue-600 transition-colors">
                    contact.prepentrance@gmail.com
                  </p>
                </div>
              </a>

              {/* Phone Card */}
              <a 
                href="tel:+917022030404"
                className="flex gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-500/30 hover:shadow-md transition-all block group"
              >
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-400 text-xs uppercase tracking-wider">Phone Support</h4>
                  <p className="text-slate-900 font-bold text-sm md:text-base mt-0.5 group-hover:text-blue-600 transition-colors">
                    +91 7022030404
                  </p>
                </div>
              </a>

              {/* Company Status Card */}
              <div className="flex gap-4 p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-400 text-xs uppercase tracking-wider">Company Status</h4>
                  <p className="text-slate-900 font-bold text-sm md:text-base mt-0.5">Incorporated Firm</p>
                </div>
              </div>
            </div>

            {/* Partnership Block */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 space-y-4">
              <div className="space-y-1.5">
                <h3 className="text-base font-black text-amber-400 uppercase tracking-widest">
                  Partnership Channels
                </h3>
                <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                  We collaborate with forward-thinking academic mentors, coaching centers, schools, educators, and investment partners to extend personalized learning across India.
                </p>
              </div>
              
              <div className="border-t border-slate-800/80 pt-3 flex flex-wrap gap-2 text-xs font-semibold">
                <span className="bg-slate-800 px-2 py-1 rounded text-slate-300">Mentors</span>
                <span className="bg-slate-800 px-2 py-1 rounded text-slate-300">Educators</span>
                <span className="bg-slate-800 px-2 py-1 rounded text-slate-300">Schools</span>
                <span className="bg-slate-800 px-2 py-1 rounded text-slate-300">Coaching Partners</span>
                <span className="bg-slate-800 px-2 py-1 rounded text-slate-300">Investors</span>
              </div>

              <div className="text-sm font-bold flex items-center gap-2 pt-2">
                <span>Direct Contact:</span>
                <a 
                  href="mailto:contact.prepentrance@gmail.com" 
                  className="text-amber-400 hover:text-amber-300 underline font-extrabold"
                >
                  contact.prepentrance@gmail.com
                </a>
              </div>
            </div>

          </div>

          {/* Right Column: Contact Form (7 Columns) */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 md:p-10 shadow-xs text-left">
            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Send Us a Message</h3>
            <p className="text-slate-500 font-semibold text-sm mb-6 leading-relaxed">
              Have specific prep roadblocks, billing queries, or login issues? Fill out the details below, and our support team will reply within 24 hours.
            </p>

            {isSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 mb-6 flex items-start gap-3 text-sm font-semibold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-emerald-950 font-bold">Message Sent Successfully!</p>
                  <p className="text-xs text-emerald-800/95 mt-0.5">Thank you for writing. Our support desk has received your ticket and will write back shortly.</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label htmlFor="name" className="text-xs font-black text-slate-500 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl p-3 text-sm font-semibold text-slate-800 outline-none transition-colors"
                  />
                </div>
                {/* Email */}
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-xs font-black text-slate-500 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. name@domain.com"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl p-3 text-sm font-semibold text-slate-800 outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone Number */}
                <div className="space-y-1.5">
                  <label htmlFor="phone" className="text-xs font-black text-slate-500 uppercase tracking-wider">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. +91 9876543210"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl p-3 text-sm font-semibold text-slate-800 outline-none transition-colors"
                  />
                </div>
                {/* Subject Selection */}
                <div className="space-y-1.5">
                  <label htmlFor="subject" className="text-xs font-black text-slate-500 uppercase tracking-wider">Subject</label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl p-3 text-sm font-semibold text-slate-800 outline-none transition-colors"
                  >
                    <option value="">Select a subject...</option>
                    <option value="student-support">Student Academic Support</option>
                    <option value="parent-query">Parent Query & Account</option>
                    <option value="partnership">School / Coaching Partnership</option>
                    <option value="billing">Subscription & Billing</option>
                    <option value="other">Other Inquiry</option>
                  </select>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label htmlFor="message" className="text-xs font-black text-slate-500 uppercase tracking-wider">Message</label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="How can we help you?"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl p-3 text-sm font-semibold text-slate-800 outline-none transition-colors resize-none"
                />
              </div>

              {/* CTA Send Message */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Sending Message...</span>
                ) : (
                  <>
                    <span>Send Message</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

        </div>
      </section>

      {/* 3. TRUST ELEMENTS SUMMARY SECTION */}
      <section className="bg-slate-100 py-16 border-t border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Our Trust &amp; Corporate Foundations</h2>
            <p className="text-slate-500 text-sm font-semibold leading-relaxed">
              PrepEntrance operates under institutional standards to guarantee high-integrity exam preparation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Incorporated Firm",
                desc: "Legally compliant educational services operation with transparent corporate structures.",
                icon: <Building2 className="w-5 h-5 text-blue-600" />
              },
              {
                title: "Bengaluru Headquarters",
                desc: "Located in the heart of India's technology ecosystem to attract premier engineering talent.",
                icon: <MapPin className="w-5 h-5 text-indigo-600" />
              },
              {
                title: "Serving National Aspirants",
                desc: "Targeted curriculum suites mapped directly to NTA syllabus standards for JEE, NEET & CUET.",
                icon: <Trophy className="w-5 h-5 text-violet-600" />
              },
              {
                title: "AI-Powered Learning Platform",
                desc: "Advanced adaptive practice models delivering structured prep metrics for student success.",
                icon: <Brain className="w-5 h-5 text-emerald-600" />
              }
            ].map((card, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 text-left space-y-3 shadow-2xs">
                <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                  {card.icon}
                </div>
                <h4 className="font-extrabold text-slate-900 text-sm">{card.title}</h4>
                <p className="text-slate-500 text-xs font-semibold leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FOOTER */}
      <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-8 mb-10 text-left">

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
                  <button onClick={() => navigate('/blog')} className="text-[13px] text-slate-400 font-semibold hover:text-white transition-colors">About Us</button>
                </li>
                <li>
                  <button onClick={() => navigate('/blog')} className="text-[13px] text-slate-400 font-semibold hover:text-white transition-colors">Blog</button>
                </li>
                <li>
                  <button onClick={() => navigate('/contact')} className="text-[13px] text-slate-400 font-semibold hover:text-white transition-colors">Contact Us</button>
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

export default ContactPage;
