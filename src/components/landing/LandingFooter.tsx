import React from 'react';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="relative py-10 px-4 sm:px-6 border-t border-gray-100 bg-white">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center hover:scale-[1.02] transition-transform">
          <img src="/setu-logo.png" alt="SETU" className="h-10 w-auto rounded-lg shadow-sm" />
        </div>
        <p className="text-sm text-gray-400 font-medium">
          © 2024 SETU. Built for serious students.
        </p>
      </div>
    </footer>
  );
};
