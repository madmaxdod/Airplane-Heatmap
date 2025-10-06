import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// We assume Tailwind is available (from index.html CDN load or build process)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);