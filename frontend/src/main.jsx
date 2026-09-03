import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import App from './App.jsx';
import './index.css';

// Automatically detect host IP so API calls work seamlessly on Phone, Tablet & PC
const host = window.location.hostname || 'localhost';
axios.defaults.baseURL = `http://${host}:5000`;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
