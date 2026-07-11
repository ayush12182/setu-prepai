import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingNav from '@/components/landing/LandingNav';
import PricingSection from '@/components/landing/PricingSection';
import { Button } from '@/components/ui/button';
import {
  Check, Shield, Zap, Sparkles, Brain, Users, Target, HelpCircle, ChevronDown, ChevronUp, AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { startSubscriptionCheckout } from '@/lib/paymentEngine';
import { useToast } from '@/hooks/use-toast';

export const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    document.title = "Pricing Plans | PrepEntrance — Premium Exam Preparation";
    window.scrollTo({ top: 0 });
  }, []);

  const handleCheckout = async (amount: number) => {
    try {
      if (!user) {
        toast({
          title: 'Authentication Required',
          description: 'Please sign up or log in to get started.',
        });
        navigate('/signup');
        return;
      }
      setIsProcessing(true);
      toast({
        title: 'Connecting to Bank...',
        description: 'Securing transaction via Cashfree Payments.',
      });

      await startSubscriptionCheckout(amount, user);
      setIsProcessing(false);
    } catch (err: unknown) {
      setIsProcessing(false);
      toast({
        title: 'Payment Error',
        description: err instanceof Error ? err.message : 'Failed to initialize checkout',
        variant: 'destructive',
      });
    }
  };

  const faqData = [
    {
      q: "Can I cancel my subscription at any time?",
      a: "Yes, absolutely. There are no lock-in periods or hidden fees. You can cancel your subscription at any time with a single click from your profile settings."
    },
    {
      q: "What exams are covered under the ₹349 plan?",
      a: "A single subscription grants you complete, unrestricted access to JEE Main & Advanced, NEET UG, and CUET (UG) practice materials, topic tests, full-length mock series, and analytics."
    },
    {
      q: "How does the 24/7 AI Academic Mentor work?",
      a: "Our AI Mentor is integrated directly into your workspace. It can explain concepts, solve complex numerical chemistry or physics problems step-by-step, and recommend video modules based on your errors."
    },
    {
      q: "Is the payment gateway secure?",
      a: "Yes, all payments are securely processed by Cashfree Payments, one of India's leading payment processors, using standard PCI-DSS compliant 256-bit encryption."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 overflow-x-hidden font-sans">
      <LandingNav />

      {/* 1. HERO SECTION */}
      <section className="relative bg-gradient-to-b from-slate-100 via-white to-slate-50 border-b border-slate-100 pt-16 pb-20">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60" />
        
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5" /> SECURE CHECKOUT VIA CASHFREE
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-tight max-w-4xl mx-auto tracking-tight">
            One Subscription.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">
              Complete Preparation.
            </span>
          </h1>
          <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto font-medium">
            Gain full access to our adaptive prep platform. No hidden tiers, no yearly contracts. Just premium, personalized education.
          </p>
        </div>
      </section>

      {/* 2. THE PRICING PLANS */}
      <PricingSection />

      {/* 3. COMPARISON TABLE */}
      <section className="py-20 bg-slate-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              PrepEntrance vs Traditional Coaching
            </h2>
            <p className="text-slate-500 font-medium">
              See how we provide a hyper-personalized ecosystem at a fraction of standard tuition pricing.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold text-xs uppercase tracking-widest border-b border-slate-800">
                    <th className="p-5">Feature</th>
                    <th className="p-5 bg-blue-900/20 text-blue-300">PrepEntrance Pro</th>
                    <th className="p-5">Traditional Institutes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-semibold text-slate-700">
                  <tr>
                    <td className="p-5 font-bold text-slate-900">Monthly Cost</td>
                    <td className="p-5 bg-blue-50/40 text-blue-700 font-bold">₹349/month</td>
                    <td className="p-5 text-slate-500">₹8,000 to ₹15,000/month</td>
                  </tr>
                  <tr>
                    <td className="p-5 font-bold text-slate-900">Doubt Solving</td>
                    <td className="p-5 bg-blue-50/40 text-slate-800 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-500 fill-amber-500" /> Instant 24/7 AI Mentor
                    </td>
                    <td className="p-5 text-slate-500">Limited class hours / Scheduled slots</td>
                  </tr>
                  <tr>
                    <td className="p-5 font-bold text-slate-900">Practice Sheets</td>
                    <td className="p-5 bg-blue-50/40 text-slate-800">Adaptive (molds around student gaps)</td>
                    <td className="p-5 text-slate-500">Static booklets, identical for all ranks</td>
                  </tr>
                  <tr>
                    <td className="p-5 font-bold text-slate-900">Performance Analytics</td>
                    <td className="p-5 bg-blue-50/40 text-slate-800">Granular diagnostic gap mappings</td>
                    <td className="p-5 text-slate-500">Simple class average percentages</td>
                  </tr>
                  <tr>
                    <td className="p-5 font-bold text-slate-900">Focus Environments</td>
                    <td className="p-5 bg-blue-50/40 text-slate-800">Virtual Commune Focus Rooms</td>
                    <td className="p-5 text-slate-500">Self-guided study, alone at home</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FAQ ACCORDION SECTION */}
      <section className="py-20 bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12 space-y-4">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-500 font-medium">
              Everything you need to know about the PrepEntrance subscription and platform.
            </p>
          </div>

          <div className="space-y-4">
            {faqData.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-left font-bold text-slate-900 hover:bg-slate-50 transition-colors"
                  >
                    <span className="flex items-center gap-2.5">
                      <HelpCircle className="w-5 h-5 text-slate-400" />
                      {faq.q}
                    </span>
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {isOpen && (
                    <div className="p-5 bg-slate-50/60 border-t border-slate-200 text-slate-500 font-medium text-sm leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
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

export default PricingPage;
