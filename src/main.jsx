import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './assets/styles/index.css';

// Register Service Worker for PWA, background notifications & prayer alerts
const registerServiceWorker = () => {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        reg.update().catch(() => {});
      })
      .catch((err) => {
        console.warn('Service Worker registration skipped:', err);
      });
  }
};

if (typeof window !== 'undefined') {
  if (
    document.readyState === 'complete' ||
    document.readyState === 'interactive'
  ) {
    registerServiceWorker();
  } else {
    window.addEventListener('load', registerServiceWorker);
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
