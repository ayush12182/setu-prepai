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
            <ul className="list-disc list-inside space-y-2">
              <li><strong className="text-white/90">Account Information:</strong> Name, email address, phone number, class (11th/12th), and target exam (JEE Main/Advanced) when you sign up.</li>
              <li><strong className="text-white/90">Study Data:</strong> Chapters studied, practice question attempts, quiz scores, time spent per topic, and revision history — used to build your personalized 21-day study plan.</li>
              <li><strong className="text-white/90">Uploaded Content:</strong> Handwritten notes or lecture videos you upload for AI-powered analysis via Lecture SETU.</li>
              <li><strong className="text-white/90">Chat Data:</strong> Conversations with Jeetu Bhaiya AI mentor to provide contextual academic guidance.</li>
              <li><strong className="text-white/90">Device & Usage Info:</strong> Browser type, device info, and session duration for platform optimization.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Generate adaptive practice questions tailored to your weak areas and difficulty level.</li>
              <li>Power your personalized 21-day preparation cycle with daily focus topics.</li>
              <li>Track syllabus progress across Physics, Chemistry, and Mathematics.</li>
              <li>Provide AI-generated notes, formula sheets, difference tables, and one-page summaries.</li>
              <li>Analyze your Major Test performance with subject-wise and chapter-wise breakdowns.</li>
              <li>Enable Jeetu Bhaiya AI to give you motivational and strategic exam guidance.</li>
            </ul>
            <p className="mt-3">We <strong className="text-white/90">never sell</strong> your personal information to third parties.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Data Storage & Security</h2>
            <p>All data is stored securely using industry-standard encryption on Lovable Cloud infrastructure. Your practice sessions, test results, notes, and uploaded content are accessible only to you through authenticated sessions. We implement Row Level Security (RLS) policies to ensure strict data isolation between users.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. AI & Third-Party Services</h2>
            <p>SETU uses AI models (Google Gemini, OpenAI) to generate questions, notes, and mentor responses. Your academic queries and uploaded content may be processed by these services solely to deliver features. No personal identity data is shared with AI providers. We do not use any third-party advertising or tracking services.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Cookies</h2>
            <p>We use essential cookies only — to keep you logged in and remember your preferences (language, theme). No third-party advertising or analytics cookies are used on SETU.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Your Rights</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Request access to all your stored personal and academic data.</li>
              <li>Request correction of inaccurate information.</li>
              <li>Request deletion of your account and all associated data.</li>
              <li>Export your study progress and test history.</li>
            </ul>
            <p className="mt-3">To exercise any of these rights, contact us at the email below.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Children's Privacy</h2>
            <p>SETU is designed for students aged 15 and above preparing for JEE. We do not knowingly collect data from children under 13. If you believe a child under 13 has provided us data, please contact us immediately.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">8. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date. Continued use of SETU after changes constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">9. Contact</h2>
            <p>For any privacy-related questions or data requests, reach out to us at <a href="mailto:setu.edu.1925@gmail.com" className="text-accent font-medium hover:underline">setu.edu.1925@gmail.com</a>.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
