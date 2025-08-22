import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../Sidebar.css';

const StudentSidebar = () => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Student Panel</h3>
      </div>
      <ul className="sidebar-menu">
        <li className={isActive('/student/dashboard')}>
          <Link to="/student/dashboard">
            <i className="fas fa-tachometer-alt"></i>
            <span>Dashboard</span>
          </Link>
        </li>
        <li className={isActive('/student/profile')}>
          <Link to="/student/profile">
            <i className="fas fa-user"></i>
            <span>Profile</span>
          </Link>
        </li>
        <li className={isActive('/student/courses')}>
          <Link to="/student/courses">
            <i className="fas fa-book"></i>
            <span>My Courses</span>
          </Link>
        </li>
        <li className={isActive('/student/projects')}>
          <Link to="/student/projects">
            <i className="fas fa-project-diagram"></i>
            <span>Projects</span>
          </Link>
        </li>
        <li className={isActive('/student/achievements')}>
          <Link to="/student/achievements">
            <i className="fas fa-trophy"></i>
            <span>Achievements</span>
          </Link>
        </li>
        <li className={isActive('/student/attendance')}>
          <Link to="/student/attendance">
            <i className="fas fa-calendar-check"></i>
            <span>Attendance</span>
          </Link>
        </li>
        <li className={isActive('/student/performance')}>
          <Link to="/student/performance">
            <i className="fas fa-chart-line"></i>
            <span>Performance</span>
          </Link>
        </li>
        <li className={isActive('/student/fees')}>
          <Link to="/student/fees">
            <i className="fas fa-money-bill-wave"></i>
            <span>Fees</span>
          </Link>
        </li>
        <li className={isActive('/student/documents')}>
          <Link to="/student/documents">
            <i className="fas fa-file-alt"></i>
            <span>Documents</span>
          </Link>
        </li>
        <li className={isActive('/student/notifications')}>
          <Link to="/student/notifications">
            <i className="fas fa-bell"></i>
            <span>Notifications</span>
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default StudentSidebar;