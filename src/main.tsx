import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { db } from './lib/db' // Import to initialize

// Initialize database
db.open().catch(err => {
  console.error('Failed to open database:', err);
});

// Temporary: Add database test function to global scope for debugging
if (import.meta.env.DEV) {
  import('./utils/dbTest').then(({ testDatabase, fixExistingPresets }) => {
    (window as any).__testDB = testDatabase;
    (window as any).__fixPresets = fixExistingPresets;
    console.log('Debug functions available: __testDB() and __fixPresets()');
  });
}

// Initialize theme before React renders to prevent flash
const initializeTheme = () => {
  const stored = localStorage.getItem('theme');
  const theme = stored && ['light', 'dark', 'system'].includes(stored) ? stored : 'system';
  
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  
  if (theme === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    root.classList.add(systemTheme);
  } else {
    root.classList.add(theme);
  }
};

// Apply theme immediately
initializeTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
