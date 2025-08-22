import React, { useState, useEffect } from 'react';
import { userAxiosInstance, fetchCourseSpecificBatches } from '../../api';
import { FaPlus, FaUsers, FaEdit, FaTrash } from 'react-icons/fa';
import './StudentList.css';
import BatchStudentCreation from './BatchStudentCreation';
import BatchStudentList from './BatchStudentList';

const ViewBatches = ({ courseId, courseName, onClose }) => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddStudentsModal, setShowAddStudentsModal] = useState(false);
  const [showStudentListModal, setShowStudentListModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);

  useEffect(() => {
    fetchBatches();
  }, [courseId]);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const response = await fetchCourseSpecificBatches(courseId);
      setBatches(response);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching batches:', err);
      setError('Failed to load batches');
      setLoading(false);
    }
  };

  const handleAddStudents = (batch) => {
    setSelectedBatch(batch);
    setShowAddStudentsModal(true);
  };

  const handleViewStudents = (batch) => {
    setSelectedBatch(batch);
    setShowStudentListModal(true);
  };

  const handleStudentCreationSuccess = () => {
    fetchBatches();
    setShowAddStudentsModal(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content batch-management">
        <div className="modal-header">
          <h2>Batches for {courseName}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Loading batches...</div>
        ) : (
          <div className="batch-container">
            {batches.length === 0 ? (
              <div className="no-batches">
                <p>No batches found for this course.</p>
                <p>Create a batch first to add students.</p>
              </div>
            ) : (
              <div className="batches-list">
                <h3>Available Batches</h3>
                <table className="batches-table">
                  <thead>
                    <tr>
                      <th>Batch Name</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batches.map(batch => (
                      <tr key={batch.id}>
                        <td>{batch.name}</td>
                        <td>{new Date(batch.created_at).toLocaleDateString()}</td>
                        <td className="actions">
                          <button 
                            className="action-btn view-btn"
                            onClick={() => handleViewStudents(batch)}
                            title="View Students"
                          >
                            <FaUsers />
                          </button>
                          <button 
                            className="action-btn add-btn"
                            onClick={() => handleAddStudents(batch)}
                            title="Add Students"
                          >
                            <FaPlus />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {showAddStudentsModal && selectedBatch && (
        <BatchStudentCreation 
          onClose={() => setShowAddStudentsModal(false)}
          onSuccess={handleStudentCreationSuccess}
          selectedCourse={courseId}
          selectedBatch={selectedBatch.id}
        />
      )}

      {showStudentListModal && selectedBatch && (
        <BatchStudentList
          batchId={selectedBatch.id}
          batchName={selectedBatch.name}
          onClose={() => setShowStudentListModal(false)}
        />
      )}
    </div>
  );
};

export default ViewBatches;