import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { TripProvider } from './contexts/TripContext.jsx';
import { Toaster } from './components/ui/toaster.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <TripProvider>
          <App />
          <Toaster />
        </TripProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
