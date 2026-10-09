import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import './index.css';

// Synchronize direct URL path access with HashRouter for seamless direct navigation and refresh
(function syncDirectUrlToHash() {
  if (typeof window === 'undefined') return;
  const { pathname, search, hash } = window.location;
  // If user navigated directly to /visualizer or /dsa without #
  if (!hash || hash === '' || hash === '#') {
    let cleanPath = pathname;
    const ghPagesPrefix = '/CODE3D-AI';
    if (cleanPath.startsWith(ghPagesPrefix)) {
      cleanPath = cleanPath.slice(ghPagesPrefix.length);
    }
    // Only redirect if there is an actual route path (not root / or /index.html)
    if (cleanPath && cleanPath !== '/' && cleanPath !== '/index.html') {
      const basePrefix = pathname.startsWith(ghPagesPrefix) ? ghPagesPrefix : '';
      const newUrl = `${window.location.origin}${basePrefix}/#${cleanPath}${search}`;
      window.history.replaceState(null, '', newUrl);
    }
  }
})();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
