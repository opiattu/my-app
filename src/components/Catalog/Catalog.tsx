import React from 'react';

const Catalog: React.FC = () => {
  return (
    <div style={{ 
      background: 'white', 
      padding: '20px', 
      borderRadius: '8px',
      marginTop: '20px'
    }}>
      <h2 style={{ marginBottom: '16px' }}>Каталог аудиторий</h2>
      <div style={{ 
        padding: '40px', 
        textAlign: 'center', 
        background: '#ffebee',
        borderRadius: '8px',
        color: '#666'
      }}>
        Нет данных
      </div>
    </div>
  );
};

export default Catalog;  // ВАЖНО: default export
