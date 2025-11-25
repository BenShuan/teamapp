import React from 'react';

export const ErrorPage: React.FC = () => {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <h1 style={{ fontSize: '48px', color: '#333', marginBottom: '16px' }}>Oops!</h1>
      <p style={{ fontSize: '18px', color: '#666', marginBottom: '32px' }}>Something went wrong. Please try again.</p>
      <button
        onClick={handleReload}
        style={{
          padding: '12px 32px',
          fontSize: '16px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        Reload Page
      </button>
    </div>
  );
};