import React, { useState } from 'react';
import { FaTrash } from 'react-icons/fa';
import './StudentList.css';

const ManualDeleteStudent = ({ student, onClose, onSuccess }) => {
  const [confirmed, setConfirmed] = useState(false);

  const handleManualDelete = () => {
    if (!confirmed) {
      return;
    }
    
    // Just call the success callback to refresh the list
    // This doesn't actually delete from the database, just removes from UI
    onSuccess && onSuccess();
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Remove Student from List</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="info-message">
            <div>
              <h3>API Error - Manual Removal Only</h3>
              <p>The API endpoint for deleting students is not working correctly. This will only remove the student from your current view.</p>
              <p>Student: <strong>{student.name}</strong> (ID: {student.enrollmentId})</p>
              <p>Note: The student will reappear when you refresh the page.</p>
            </div>
          </div>
          
          <div className="confirmation-checkbox">
            <label>
              <input 
                type="checkbox" 
                checked={confirmed} 
                onChange={() => setConfirmed(!confirmed)}
              />
              I understand this is only a temporary removal
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
            className="btn-warning" 
            onClick={handleManualDelete}
            disabled={!confirmed}
          >
            Remove from List
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManualDeleteStudent;