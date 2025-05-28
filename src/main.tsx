import React from 'react'
import ReactDOM from 'react-dom/client'
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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
