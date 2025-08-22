import React, { useState, useEffect } from 'react';
import { userAxiosInstance, fetchStudents as fetchStudentsApi } from '../../api';
import './StudentList.css';
import { FaSearch, FaTrash, FaEdit } from 'react-icons/fa';

const BatchStudentList = ({ batchId, batchName, onClose }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStudents();
  }, [batchId]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      console.log(`Fetching students for batch ID: ${batchId}`);
      // Use the API function directly from the imported module
      const data = await fetchStudentsApi(batchId);
      console.log('Students response:', data);
      setStudents(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load students');
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredStudents = students.filter(student => 
    student.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.enrollment_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="modal-overlay">
      <div className="modal-content student-list">
        <div className="modal-header">
          <h2>Students in {batchName}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="search-container">
          <div className="search-input-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, ID or email..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Loading students...</div>
        ) : (
          <>
            {filteredStudents.length === 0 ? (
              <div className="no-students">
                <p>No students found in this batch.</p>
              </div>
            ) : (
              <div className="students-table-container">
                <table className="students-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Enrollment ID</th>
                      <th>Email</th>
                      <th>Date of Birth</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map(student => (
                      <tr key={student.id}>
                        <td>{student.user.username}</td>
                        <td>{student.enrollment_id}</td>
                        <td>{student.user.email}</td>
                        <td>{new Date(student.date_of_birth).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BatchStudentList;