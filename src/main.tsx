import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import "./i18n/config";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Diagnostic logging patch
try {
  const sendToServer = (type: string, message: string, stack?: string) => {
    fetch('http://localhost:8081/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, message, stack })
    }).catch(() => {});
  };

  const originalError = console.error;
  const originalLog = console.log;
  const originalWarn = console.warn;

  console.log = (...args) => {
    originalLog.apply(console, args);
    sendToServer('log', args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
  };

  console.warn = (...args) => {
    originalWarn.apply(console, args);
    sendToServer('warn', args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
  };

  console.error = (...args) => {
    originalError.apply(console, args);
    const firstArg = args[0];
    const stack = firstArg instanceof Error ? firstArg.stack : undefined;
    sendToServer('error', args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '), stack);
  };

  window.addEventListener('error', (event) => {
    sendToServer('uncaught-error', event.message, event.error?.stack);
  });

  window.addEventListener('unhandledrejection', (event) => {
    sendToServer('unhandled-rejection', String(event.reason), event.reason?.stack);
  });
} catch (e) {}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
