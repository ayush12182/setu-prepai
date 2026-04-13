import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import App from './src/App.tsx';

try {
  const html = renderToString(
    <StaticRouter location="/teaching-room/pk-sir">
       <App />
    </StaticRouter>
  );
  console.log("Success rendering!");
} catch (e) {
  console.error("CRASH:", e);
}
