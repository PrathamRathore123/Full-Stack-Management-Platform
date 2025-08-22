import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../Sidebar.css';

const FacultySidebar = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Faculty Panel</h3>
      </div>
      <ul className="sidebar-menu">
        <li className={isActive('/faculty/dashboard')}>
          <Link to="/faculty/dashboard">
            <i className="fas fa-tachometer-alt"></i>
            <span>Dashboard</span>
          </Link>
        </li>
        <li className={isActive('/faculty/students')}>
          <Link to="/faculty/students">
            <i className="fas fa-user-graduate"></i>
            <span>Students</span>
          </Link>
        </li>
        <li className={isActive('/faculty/create-student')}>
          <Link to="/faculty/create-student">
            <i className="fas fa-user-plus"></i>
            <span>Create Student</span>
          </Link>
        </li>
        <li className={isActive('/faculty/attendance')}>
          <Link to="/faculty/attendance">
            <i className="fas fa-clipboard-check"></i>
            <span>Attendance</span>
          </Link>
        </li>
        <li className={isActive('/faculty/batch-management')}>
          <Link to="/faculty/batch-management">
            <i className="fas fa-users"></i>
            <span>Batch Management</span>
          </Link>
        </li>
        <li className={isActive('/faculty/courses')}>
          <Link to="/faculty/courses">
            <i className="fas fa-book"></i>
            <span>Courses</span>
          </Link>
        </li>
        <li className={isActive('/faculty/projects')}>
          <Link to="/faculty/projects">
            <i className="fas fa-project-diagram"></i>
            <span>Projects</span>
          </Link>
        </li>
        <li className={isActive('/faculty/gradebook')}>
          <Link to="/faculty/gradebook">
            <i className="fas fa-chart-line"></i>
            <span>Gradebook</span>
          </Link>
        </li>
        <li className={isActive('/faculty/announcements')}>
          <Link to="/faculty/announcements">
            <i className="fas fa-bullhorn"></i>
            <span>Announcements</span>
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default FacultySidebar;