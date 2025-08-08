import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';

const rootElement = document.getElementById('root')!;
const root = ReactDOM.createRoot(rootElement);

// Se envuelve la aplicación completa en AuthProvider.
// Esto permite que cualquier componente dentro de App acceda al estado de autenticación
// (saber si hay un usuario logueado, quién es, etc.).
root.render(
  <React.StrictMode>
    <HashRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>
);