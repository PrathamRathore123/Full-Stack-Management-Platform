import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userAxiosInstance } from '../../api';
import './AdminSetup.css';

const AdminSetup = () => {
  const [adminExists, setAdminExists] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminExists = async () => {
      try {
        // Try to create an admin to see if one already exists
        // If it returns 403, an admin already exists
        await userAxiosInstance.post('create-admin/', {
          username: 'test',
          email: 'test@test.com',
          password: 'test12345'
        });
        // If no error, admin doesn't exist yet
        setAdminExists(false);
      } catch (error) {
        // If we get a 403 error, admin already exists
        if (error.response && error.response.status === 403) {
          setAdminExists(true);
        } else {
          // For other errors, we can't determine
          console.error('Error checking admin status:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    checkAdminExists();
  }, []);

  if (loading) {
    return (
      <div className="admin-setup-container">
        <div className="admin-setup-card">
          <h2>Checking System Status</h2>
          <div className="loading-spinner"></div>
          <p>Please wait while we check the system configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-setup-container">
      <div className="admin-setup-card">
        <h2>System Setup</h2>
        
        {adminExists === false ? (
          <>
            <div className="setup-message">
              <p>Welcome to the initial system setup!</p>
              <p>No administrator account has been detected. You need to create an admin account to start using the system.</p>
            </div>
            <Link to="/create-admin" className="setup-button">
              Create Admin Account
            </Link>
          </>
        ) : (
          <div className="setup-complete">
            <p>System is already configured with an administrator account.</p>
            <p>You can proceed to login if you have credentials.</p>
            <div className="setup-buttons">
              <Link to="/login" className="setup-button">
                Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSetup;