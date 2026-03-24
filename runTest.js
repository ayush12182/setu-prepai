import { renderToString } from 'react-dom/server';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

// Mock import.meta.env
global.import = { meta: { env: { VITE_SUPABASE_URL: "mock", VITE_SUPABASE_PUBLISHABLE_KEY: "mock" } } } as any;

// Use module alias or just run it via vitest/vite-node?
// Better: run via vite-node which automatically handles Vite environment and aliases!
