import React from 'react';

const AlertModal = ({ isOpen, title, message, type = 'alert', onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 2000
        }}>
            <div className="card" style={{ width: '90%', maxWidth: '400px', backgroundColor: '#fff', padding: '2rem', textAlign: 'center', borderRadius: '8px' }}>
                <h3 style={{ marginTop: 0, color: type === 'danger' ? '#dc2626' : 'var(--primary-color)' }}>{title}</h3>
                <p style={{ color: '#475569', marginBottom: '2rem', fontSize: '1rem' }}>{message}</p>
                
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                    {type === 'confirm' && (
                        <button 
                            onClick={onCancel} 
                            className="btn btn-outline" 
                            style={{ padding: '0.5rem 1.5rem' }}
                        >
                            Cancelar
                        </button>
                    )}
                    <button 
                        onClick={onConfirm} 
                        className="btn" 
                        style={{ 
                            padding: '0.5rem 1.5rem', 
                            backgroundColor: type === 'danger' ? '#dc2626' : 'var(--primary-color)',
                            borderColor: type === 'danger' ? '#dc2626' : 'var(--primary-color)',
                            color: '#fff'
                        }}
                    >
                        {type === 'alert' ? 'Entendido' : 'Confirmar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AlertModal;
