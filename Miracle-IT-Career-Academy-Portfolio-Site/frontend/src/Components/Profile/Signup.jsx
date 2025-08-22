import React, { useState } from 'react';
import axios from 'axios';  // Use plain axios here to avoid Authorization header
import { useNavigate, Link } from 'react-router-dom';
import './Signup.css';

const Signup = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'student' });
  const navigate = useNavigate();

  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/register/', formData);
      alert('Signup successful');
      navigate('/login');
    } catch (err) {
      if (err.response && err.response.data) {
        alert('Signup failed: ' + JSON.stringify(err.response.data));
      } else {
        alert('Signup failed');
      }
    }
  };

  return (
    <form className="signup-form" onSubmit={handleSubmit}>
      <h2>Signup</h2>
      <input type="text" name="username" placeholder="Username" onChange={handleChange} required />
      <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
      <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
      <select name="role" onChange={handleChange}>
        <option value="student">Student</option>
        <option value="faculty">Faculty</option>
        <option value="admin">Admin</option>
      </select>
      <button type="submit">Signup</button>
      <p>Already have an account? <Link to="/login">Login here</Link></p>
    </form>
  );
};

export default Signup;
