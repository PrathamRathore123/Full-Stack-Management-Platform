import React, { useState, useEffect } from 'react';
import { createAdminAccount } from '../../api';
import { useNavigate } from 'react-router-dom';
import './CreateAdmin.css';

const CreateAdmin = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    is_super_admin: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await createAdminAccount(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create admin account. An admin account may already exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-admin-container">
      <div className="create-admin-card">
        <h2>Create Admin Account</h2>
        <p className="admin-info">
          This is a one-time setup to create the administrator account.
          After this, the admin can create faculty accounts, and faculty can create student accounts.
        </p>
        
        {success ? (
          <div className="success-message">
            Admin account created successfully! Redirecting to login...
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="8"
              />
            </div>
            
            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="is_super_admin"
                name="is_super_admin"
                checked={formData.is_super_admin}
                onChange={handleChange}
              />
              <label htmlFor="is_super_admin">Super Admin</label>
            </div>
            
            <button 
              type="submit" 
              className="submit-button" 
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Admin Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateAdmin;