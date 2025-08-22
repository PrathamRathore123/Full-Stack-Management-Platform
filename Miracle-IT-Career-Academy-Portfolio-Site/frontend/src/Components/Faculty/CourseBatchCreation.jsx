import React, { useState, useEffect } from 'react';
import { userAxiosInstance } from '../../api';
import './StudentList.css';

const CourseBatchCreation = ({ onClose, onSuccess, courseId, courseName }) => {
  const [batchName, setBatchName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleBatchNameChange = (e) => {
    setBatchName(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!batchName.trim()) {
      setError('Batch name is required');
      return;
    }
    if (!courseId) {
      setError('Course ID is missing');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Create a batch associated with the selected course
      const response = await userAxiosInstance.post('batches/', {
        name: batchName.trim(),
        course_id: parseInt(courseId, 10) // Use course_id instead of course
      });
      console.log('Batch created successfully:', response.data);
      setLoading(false);
      onSuccess && onSuccess();
      onClose && onClose();
    } catch (err) {
      console.error('Error creating course batch:', err);
      // Extract more specific error message if available
      let errorMessage = 'Failed to create batch. Please try again.';
      
      if (err.response?.data) {
        // Handle different error formats
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.data.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response.data.course) {
          // Handle field-specific errors
          errorMessage = `Course error: ${err.response.data.course}`;
        } else if (err.response.data.name) {
          errorMessage = `Batch name error: ${err.response.data.name}`;
        } else if (typeof err.response.data === 'object') {
          // Convert object to string for any other error format
          errorMessage = Object.entries(err.response.data)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
        }
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };


  return (
    <div className="modal-overlay">
      <div className="modal-content batch-creation">
        <div className="modal-header">
          <h2>Create Batch for {courseName}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="batchName">Batch Name</label>
            <input
              type="text"
              id="batchName"
              name="batchName"
              value={batchName}
              onChange={handleBatchNameChange}
              required
              disabled={loading}
              placeholder="Enter batch name"
            />
            <small className="form-hint">Example: "Morning Batch", "Weekend Batch", "Batch 2023-A"</small>
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
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Batch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseBatchCreation;