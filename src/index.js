import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '../App'; // Points to App.jsx in the main folder

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
