import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PrivacyPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-primary text-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-white/60 hover:text-white hover:bg-white/10 mb-8 -ml-2">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Home
        </Button>

        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-white/40 text-sm mb-10">Last updated: February 2026</p>

        <div className="space-y-8 text-white/70 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly — your name, email address, and study preferences when you create an account. We also collect usage data such as chapters studied, practice scores, and time spent to personalize your learning experience.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. How We Use Your Information</h2>
            <p>Your data is used to power your personalized study plan, track progress, generate adaptive questions, and improve the SETU platform. We never sell your personal information to third parties.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Data Storage & Security</h2>
            <p>All data is stored securely using industry-standard encryption. Your practice sessions, test results, and notes are stored in our secure cloud infrastructure and are accessible only to you.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Cookies</h2>
            <p>We use essential cookies to keep you logged in and remember your preferences. No third-party advertising cookies are used on SETU.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Your Rights</h2>
            <p>You can request access to, correction of, or deletion of your personal data at any time by contacting us. You may also export your study data from your profile settings.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Contact</h2>
            <p>For any privacy-related questions, reach out to us at <span className="text-accent font-medium">privacy@setu.app</span>.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
