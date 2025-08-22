import React, { useState } from 'react';
import { resetStudentData } from '../../api';
import { FaTrash, FaSpinner } from 'react-icons/fa';
import './StudentList.css';

const ResetStudentData = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleReset = async () => {
    if (!confirmed) {
      setError('Please confirm the action by checking the confirmation box');
      return;
    }

    setLoading(true);
    setError(null);
    setProgress(0);
    
    try {
      // Delete all existing students
      await resetStudentData();
      
      // Reset the enrollment ID counter in localStorage
      localStorage.setItem('lastEnrollmentId', 'MIRA0000');
      
      setSuccess(true);
      setLoading(false);
      setProgress(100);
      
      // Close the modal after showing success message
      setTimeout(() => {
        onSuccess && onSuccess();
        onClose && onClose();
      }, 2000);
    } catch (err) {
      console.error('Error resetting student data:', err);
      setError('Failed to reset student data. Please try again or contact support.');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Reset Student Data</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">Student data has been reset successfully!</div>}
          
          <div className="warning-message">
            <FaTrash className="warning-icon" />
            <div>
              <h3>Warning: This action cannot be undone</h3>
              <p>This will delete all existing student data and reset the enrollment counter to start from MIRA001.</p>
            </div>
          </div>
          
          <div className="confirmation-checkbox">
            <label>
              <input 
                type="checkbox" 
                checked={confirmed} 
                onChange={() => setConfirmed(!confirmed)}
                disabled={loading || success}
              />
              I understand that this will permanently delete all student data
            </label>
          </div>
          
          {loading && (
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="progress-text">
                Resetting student data...
              </div>
            </div>
          )}
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="btn-secondary" 
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="button" 
            className="btn-danger" 
            onClick={handleReset}
            disabled={loading || success}
          >
            {loading ? (
              <>
                <FaSpinner className="spinner" /> Resetting...
              </>
            ) : 'Reset Student Data'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetStudentData;