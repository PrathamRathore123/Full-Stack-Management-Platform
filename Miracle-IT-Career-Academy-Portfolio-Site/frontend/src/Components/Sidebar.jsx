import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { UserContext } from './UserContext';
import './Sidebar.css';
import logo from './Images/Logo-miracle.png';
import { 
  FaHome, FaUserGraduate, FaBook, FaCalendarAlt, FaChartLine, 
  FaMoneyBillWave, FaFileAlt, FaUserCircle, FaUsers, FaCog, 
  FaClipboardList, FaReceipt, FaCertificate, FaGraduationCap, 
  FaBullhorn, FaListAlt
} from 'react-icons/fa';

const Sidebar = () => {
  const { user } = useContext(UserContext);

  // If no user or role, don't render sidebar
  if (!user || !user.role) return null;

  // Define navigation links based on user role
  const getNavLinks = () => {
    switch (user.role) {
      case 'admin':
        return [
          { to: '/admin', label: 'Dashboard', icon: <FaHome /> },
          { to: '/admin/user-management', label: 'User Management', icon: <FaUsers /> },
          { to: '/admin/registered-users', label: 'Registered Users', icon: <FaUserCircle /> },
          { to: '/admin/manage-courses', label: 'Course Management', icon: <FaBook /> },
          { to: '/admin/attendance-logs', label: 'Attendance Logs', icon: <FaCalendarAlt /> },
          { to: '/admin/fee-tracking', label: 'Fee Tracking', icon: <FaMoneyBillWave /> },
          { to: '/admin/certificates', label: 'Certificates', icon: <FaCertificate /> },
          { to: '/admin/system-settings', label: 'System Settings', icon: <FaCog /> },
        ];
      case 'faculty':
        return [
          { to: '/faculty', label: 'Dashboard', icon: <FaHome /> },
          { to: '/faculty/courses', label: 'Manage Courses', icon: <FaBook /> },
          { to: '/faculty/attendance', label: 'Student Attendance', icon: <FaCalendarAlt /> },
          { to: '/faculty/projects', label: 'Projects', icon: <FaListAlt /> },
          { to: '/faculty/gradebook', label: 'Gradebook', icon: <FaClipboardList /> },
          { to: '/faculty/announcements', label: 'Faculty Announcements', icon: <FaBullhorn /> },
          { to: '/faculty/students', label: 'Student List', icon: <FaUserGraduate /> },
          { to: '/faculty/registered-users', label: 'Registered Users', icon: <FaUserCircle /> },
        ];
      case 'student':
        return [
          { to: '/student', label: 'Dashboard', icon: <FaHome /> },
          { to: '/student/courses', label: 'Courses', icon: <FaBook /> },
          { to: '/student/attendance', label: 'Attendance', icon: <FaCalendarAlt /> },
          { to: '/student/performance', label: 'Performance Report', icon: <FaChartLine /> },
          { to: '/student/fees', label: 'Fee Management', icon: <FaMoneyBillWave /> },
          { to: '/student/documents', label: 'Documents & Certificates', icon: <FaFileAlt /> },
          { to: '/student/profile', label: 'Student Profile', icon: <FaUserCircle /> },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <Link to={`/${user.role}`}>
          <img src={logo} alt="Miracle Logo" className="sidebar-logo-img" />
        </Link>
      </div>
      <div className="sidebar-header">
        <h3>{user.role === 'student' ? 'Student Panel' : 
             user.role === 'admin' ? 'Admin Panel' : 
             'Faculty Dashboard'}</h3>
      </div>
      <ul className="sidebar-menu">
        {navLinks.map((link, index) => (
          <li key={index} className="sidebar-item">
            <Link to={link.to} className="sidebar-link">
              <span className="sidebar-icon">{link.icon}</span>
              <span className="sidebar-text">{link.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;