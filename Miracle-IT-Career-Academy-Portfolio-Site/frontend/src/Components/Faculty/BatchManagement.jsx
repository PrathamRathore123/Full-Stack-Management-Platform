import React, { useState, useEffect } from 'react';
import { userAxiosInstance } from '../../api';
import { FaPlus, FaUsers, FaEdit, FaTrash } from 'react-icons/fa';
import './StudentList.css';
import BatchStudentCreation from './BatchStudentCreation';

const BatchManagement = ({ courseId, courseName, onClose }) => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddStudentsModal, setShowAddStudentsModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    fetchBatches();
  }, [courseId]);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const response = await userAxiosInstance.get(`batches/?course=${courseId}`);
      setBatches(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching batches:', err);
      setError('Failed to load batches');
      setLoading(false);
    }
  };

  const fetchBatchStudents = async (batchId) => {
    try {
      setLoadingStudents(true);
      const response = await userAxiosInstance.get(`students/?batch_id=${batchId}`);
      setStudents(response.data);
      setLoadingStudents(false);
    } catch (err) {
      console.error('Error fetching batch students:', err);
      setLoadingStudents(false);
    }
  };

  const handleViewBatchStudents = (batch) => {
    setSelectedBatch(batch);
    fetchBatchStudents(batch.id);
  };

  const handleAddStudents = (batch) => {
    setSelectedBatch(batch);
    setShowAddStudentsModal(true);
  };

  const handleStudentCreationSuccess = () => {
    // Refresh the student list if a batch is selected
    if (selectedBatch) {
      fetchBatchStudents(selectedBatch.id);
    }
    setShowAddStudentsModal(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content batch-management">
        <div className="modal-header">
          <h2>Manage Batches for {courseName}</h2>
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
                      <tr key={batch.id} className={selectedBatch?.id === batch.id ? 'selected-row' : ''}>
                        <td>{batch.name}</td>
                        <td>{new Date(batch.created_at).toLocaleDateString()}</td>
                        <td className="actions">
                          <button 
                            className="action-btn view-btn"
                            onClick={() => handleViewBatchStudents(batch)}
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

            {selectedBatch && (
              <div className="batch-students">
                <h3>Students in {selectedBatch.name}</h3>
                {loadingStudents ? (
                  <div className="loading">Loading students...</div>
                ) : (
                  <>
                    {students.length === 0 ? (
                      <div className="no-students">
                        <p>No students in this batch.</p>
                        <button 
                          className="btn-primary"
                          onClick={() => handleAddStudents(selectedBatch)}
                        >
                          <FaPlus /> Add Students
                        </button>
                      </div>
                    ) : (
                      <table className="students-table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Enrollment ID</th>
                            <th>Email</th>
                          </tr>
                        </thead>
                        <tbody>
                          {students.map(student => (
                            <tr key={student.id}>
                              <td>{student.user.username}</td>
                              <td>{student.enrollment_id}</td>
                              <td>{student.user.email}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {showAddStudentsModal && (
        <BatchStudentCreation 
          onClose={() => setShowAddStudentsModal(false)}
          onSuccess={handleStudentCreationSuccess}
          selectedCourse={courseId}
          selectedBatch={selectedBatch.id}
        />
      )}
    </div>
  );
};

export default BatchManagement;