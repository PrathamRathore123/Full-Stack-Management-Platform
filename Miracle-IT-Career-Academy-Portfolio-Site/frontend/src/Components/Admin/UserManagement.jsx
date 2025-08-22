import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';
import './UserManagement.css';
import CreateFaculty from './CreateFaculty';
import { userAxiosInstance } from '../../api';

const UserManagement = () => {
  const [showCreateFaculty, setShowCreateFaculty] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch faculty users
      const facultyResponse = await userAxiosInstance.get('faculty/');
      
      // Format the data
      const formattedUsers = facultyResponse.data.map(faculty => ({
        id: faculty.id,
        name: faculty.user.username,
        email: faculty.user.email,
        role: 'faculty',
        department: faculty.department,
        status: 'Active'
      }));
      
      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFaculty = () => {
    setShowCreateFaculty(true);
  };

  const handleFacultyCreated = () => {
    fetchUsers();
  };

  const filteredUsers = users.filter(user => {
    if (filter !== 'all' && user.role !== filter) return false;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.department?.toLowerCase().includes(term)
      );
    }
    
    return true;
  });

  return (
    <div className="dashboard-container">
      <h1>User Management</h1>
      <div className="dashboard-content">
        <div className="user-management-header">
          <div className="search-filter">
            <input 
              type="text" 
              placeholder="Search users..." 
              className="search-input" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select 
              className="filter-select"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Users</option>
              <option value="faculty">Faculty</option>
            </select>
            <button className="btn-primary">Search</button>
          </div>
          <button className="btn-primary" onClick={handleCreateFaculty}>Add Faculty</button>
        </div>
        
        <div className="user-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="loading-cell">Loading users...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-cell">No users found</td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>FAC{user.id.toString().padStart(3, '0')}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>Faculty</td>
                    <td>{user.department || 'N/A'}</td>
                    <td className="status-active">{user.status}</td>
                    <td className="action-buttons">
                      <button className="btn-icon" title="Edit">✏️</button>
                      <button className="btn-icon" title="Reset Password">🔑</button>
                      <button className="btn-icon" title="Deactivate">🔒</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {users.length > 0 && (
          <div className="pagination">
            <button className="pagination-btn">Previous</button>
            <button className="pagination-btn active">1</button>
            <button className="pagination-btn">Next</button>
          </div>
        )}
      </div>
      
      {showCreateFaculty && (
        <CreateFaculty 
          onClose={() => setShowCreateFaculty(false)} 
          onSuccess={handleFacultyCreated}
        />
      )}
    </div>
  );
};

export default UserManagement;