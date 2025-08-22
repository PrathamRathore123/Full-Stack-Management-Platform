import React, { useState } from 'react';
import './StudentList.css';

const ManualReset = ({ onClose, onSuccess }) => {
  const [confirmed, setConfirmed] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleReset = () => {
    if (!confirmed) {
      return;
    }
    
    // Reset the enrollment ID counter in localStorage
    localStorage.setItem('lastEnrollmentId', 'MIRA0000');
    
    setSuccess(true);
    
    // Close the modal after showing success message
    setTimeout(() => {
      onSuccess && onSuccess();
      onClose && onClose();
    }, 2000);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Reset Enrollment Counter</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {success && <div className="success-message">Enrollment counter has been reset successfully!</div>}
          
          <div className="info-message">
            <div>
              <h3>Reset Enrollment Counter Only</h3>
              <p>This will reset the enrollment counter to start from MIRA001 for new students. This does not delete any existing student data.</p>
              <p>Use this option if you want to start creating new students with IDs beginning from MIRA0001.</p>
            </div>
          </div>
          
          <div className="confirmation-checkbox">
            <label>
              <input 
                type="checkbox" 
                checked={confirmed} 
                onChange={() => setConfirmed(!confirmed)}
                disabled={success}
              />
              I want to reset the enrollment counter to start from MIRA0001
            </label>
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="btn-secondary" 
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            type="button" 
            className="btn-primary" 
            onClick={handleReset}
            disabled={!confirmed || success}
          >
            Reset Counter
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManualReset;