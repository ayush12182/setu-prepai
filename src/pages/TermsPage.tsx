import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TermsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-primary text-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-white/60 hover:text-white hover:bg-white/10 mb-8 -ml-2">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Home
        </Button>

        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-white/40 text-sm mb-10">Last updated: February 2026</p>

        <div className="space-y-8 text-white/70 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using SETU, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Use of Service</h2>
            <p>SETU is an AI-powered JEE preparation platform. You may use it for personal, non-commercial educational purposes. You agree not to misuse the platform, share your account credentials, or attempt to reverse-engineer any AI-generated content.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. User Accounts</h2>
            <p>You are responsible for maintaining the security of your account. You must provide accurate information during registration. SETU reserves the right to suspend accounts that violate these terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Content & Intellectual Property</h2>
            <p>All study materials, AI-generated questions, notes, and platform content are the intellectual property of SETU. You may not reproduce, distribute, or commercially exploit any content without prior written consent.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Free Plan & Pricing</h2>
            <p>SETU currently offers a free plan with full access to all features. Pricing for premium plans will be announced in the future. We will notify users before any changes to the pricing structure.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Limitation of Liability</h2>
            <p>SETU provides educational content on an "as is" basis. While we strive for accuracy, we do not guarantee specific exam results. SETU shall not be liable for any indirect or consequential damages arising from use of the platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Contact</h2>
            <p>For any questions about these terms, contact us at <span className="text-accent font-medium">setu.edu.1925@gmail.com</span>.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;
