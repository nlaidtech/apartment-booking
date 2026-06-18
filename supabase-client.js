// supabase-client.js
// Initializes Supabase client (browser). Requires supabase-config.js to set
// window.APARTLY_SUPABASE_CONFIG before this module is loaded.
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const cfg = window.APARTLY_SUPABASE_CONFIG || {};
let supabase = null;

if (cfg.url && cfg.anonKey && cfg.anonKey !== 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11d2dobGh1YXVneXdjemVybHBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3ODk4NzAsImV4cCI6MjA5NzM2NTg3MH0.OqdWFbwRFFp90qYva5j7Glt4tXd2DUG8_pMEW7VKBt4') {
  try {
    supabase = createClient(cfg.url, cfg.anonKey);
    // expose globally for non-module scripts
    window.supabase = supabase;
    console.info('Supabase client initialized');
  } catch (err) {
    console.warn('Failed to init Supabase client', err);
  }
} else {
  console.info('Supabase config not provided or contains placeholders; running in local-only mode');
}

export { supabase };
