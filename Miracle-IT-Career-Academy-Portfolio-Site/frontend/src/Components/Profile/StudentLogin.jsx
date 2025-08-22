import React, { useState, useContext } from 'react';
import { userAxiosInstance } from '../../api';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';
import { UserContext } from '../UserContext';

const StudentLogin = () => {
  const [credentials, setCredentials] = useState({ enrollment_id: '', date_of_birth: '' });
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  const handleChange = e => setCredentials({ ...credentials, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      console.log('Attempting student login with:', credentials);
      
      // Format date of birth as password (DDMMYYYY)
      const dobDate = new Date(credentials.date_of_birth);
      const day = String(dobDate.getDate()).padStart(2, '0');
      const month = String(dobDate.getMonth() + 1).padStart(2, '0');
      const year = dobDate.getFullYear();
      const formattedDOB = `${day}${month}${year}`;
      
      console.log('Formatted DOB password:', formattedDOB);
      
      // Send login request with enrollment_id and formatted DOB as password
      const res = await userAxiosInstance.post('student-login/', {
        enrollment_id: credentials.enrollment_id.trim(),
        date_of_birth: formattedDOB
      });
      
      console.log('Login response:', res.data);
      
      localStorage.setItem('access', res.data.access);
      localStorage.setItem('refresh', res.data.refresh);
      
      // Store user info
      const role = res.data.user.role;
      localStorage.setItem('role', role);
      setUser({ role, username: res.data.user.username });

      navigate('/student');
    } catch (err) {
      console.error('Login error:', err);
      console.error('Request data:', credentials);
      if (err.response && err.response.data) {
        console.error('Error response data:', err.response.data);
        alert('Login failed: ' + (err.response.data.detail || JSON.stringify(err.response.data)));
      } else {
        alert('Login failed. Please check your enrollment ID and date of birth.');
      }
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <h2>Student Login</h2>
      <div className="form-group">
        <label htmlFor="enrollment_id">Enrollment ID</label>
        <input 
          type="text" 
          id="enrollment_id"
          name="enrollment_id" 
          placeholder="Enter your enrollment ID" 
          value={credentials.enrollment_id}
          onChange={handleChange} 
          required 
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="date_of_birth">Date of Birth</label>
        <input 
          type="date" 
          id="date_of_birth"
          name="date_of_birth" 
          value={credentials.date_of_birth}
          onChange={handleChange} 
          required 
        />
        <small className="form-hint">Your password will be your date of birth in DDMMYYYY format</small>
      </div>
      
      <button type="submit">Login</button>
      
      <div className="login-options">
        <p>Not a student? <Link to="/login">Login as Faculty/Admin</Link></p>
      </div>
    </form>
  );
};

export default StudentLogin;