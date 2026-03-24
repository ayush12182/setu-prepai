import { renderToString } from 'react-dom/server';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import TestPage from './src/pages/TestPage';
import { ExamModeProvider } from './src/contexts/ExamModeContext';
import { ClassProvider } from './src/contexts/ClassContext';

try {
  console.log("Starting render...");
  
  // Mock contexts temporarily if needed, but using actual providers should work
  const App = () => (
    <MemoryRouter>
      <ExamModeProvider>
        <ClassProvider>
          <TestPage />
        </ClassProvider>
      </ExamModeProvider>
    </MemoryRouter>
  );

  const html = renderToString(<App />);
  console.log("Render successful, length:", html.length);
} catch (e: any) {
  console.error("RENDER ERROR ENCOUNTERED:");
  console.error(e.message);
  console.error(e.stack);
}
