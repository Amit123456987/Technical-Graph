import React from 'react';

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalStyle = {
  background: 'white',
  padding: '24px',
  borderRadius: '8px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
  minWidth: '320px',
};

const cancelButtonStyle = {
  padding: '8px 16px',
  border: '1px solid #ccc',
  borderRadius: '4px',
  background: 'white',
  cursor: 'pointer',
};

const deleteButtonStyle = {
  padding: '8px 16px',
  border: 'none',
  borderRadius: '4px',
  background: '#c00',
  color: 'white',
  cursor: 'pointer',
};

function DeleteConfirmModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <p style={{ margin: '0 0 20px', fontSize: '16px' }}>
          Do you want to delete this Graph?
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} style={cancelButtonStyle}>
            Cancel
          </button>
          <button type="button" onClick={onConfirm} style={deleteButtonStyle}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmModal;
