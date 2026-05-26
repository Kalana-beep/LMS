import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Set default theme class on body
document.body.classList.add('default-bg');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);