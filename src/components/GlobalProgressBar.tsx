import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

NProgress.configure({ 
  showSpinner: false, 
  speed: 400, 
  minimum: 0.1,
  barSelector: '[role="bar"]',
});

// We inject a custom style to make the bar match our branding (e.g. blue/indigo)
const injectStyles = () => {
  if (document.getElementById('nprogress-custom-styles')) return;
  const style = document.createElement('style');
  style.id = 'nprogress-custom-styles';
  style.innerHTML = `
    #nprogress .bar {
      background: #4f46e5 !important; /* Indigo 600 */
      height: 4px !important;
      z-index: 99999 !important;
    }
    #nprogress .peg {
      box-shadow: 0 0 10px #4f46e5, 0 0 5px #4f46e5 !important;
    }
  `;
  document.head.appendChild(style);
};

let fetchActiveCount = 0;

export const GlobalProgressBar = () => {
  const location = useLocation();

  // Route change progress
  useEffect(() => {
    injectStyles();
    NProgress.start();
    
    // Slight delay to allow the new page to render before completing the bar
    const timeout = setTimeout(() => {
      NProgress.done();
    }, 300);
    
    return () => clearTimeout(timeout);
  }, [location.pathname]);

  // Global Fetch interceptor for backend requests
  useEffect(() => {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      fetchActiveCount++;
      if (fetchActiveCount === 1) {
        NProgress.start();
      }
      
      try {
        const response = await originalFetch(...args);
        return response;
      } finally {
        fetchActiveCount--;
        if (fetchActiveCount <= 0) {
          fetchActiveCount = 0;
          NProgress.done();
        }
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return null;
};
