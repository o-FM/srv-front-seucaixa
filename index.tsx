import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import './styles/safearea.css';

// Error Boundary para capturar erros não tratados
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  state: {
    error?: any; hasError: boolean; 
};
  props: any;
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.error('[ErrorBoundary] Erro capturado:', error);
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: '#000',
          color: '#fff',
          fontFamily: 'monospace',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h2 style={{ marginBottom: '20px' }}>❌ Erro na Aplicação</h2>
          <p style={{ color: '#ff6b6b', marginBottom: '20px' }}>
            {this.state.error?.message || 'Erro desconhecido'}
          </p>
          <p style={{ color: '#888', fontSize: '12px' }}>
            Verifique o console (F12) para mais detalhes
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#7c3aed',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Recarregar Página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Service Worker Registration com melhor tratamento de erro
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('✅ SW registrado:', registration.scope);
      })
      .catch(error => {
        console.warn('⚠️ SW não disponível (normal em desenvolvimento):', error.message);
      });
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);