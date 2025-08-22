import React, { useContext, useEffect } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { UserContext } from './UserContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import './Layout.css';

// Layout for public pages - no special styling
export const PublicLayout = () => {
  const { user } = useContext(UserContext);
  const location = useLocation();
  
  // If user is already logged in, redirect to their dashboard
  // Only redirect if we're not already on the home page
  if (user && location.pathname !== '/') {
    console.log('PublicLayout redirecting to /' + user.role);
    return <Navigate to={`/${user.role}`} replace />;
  }
  
  // Don't show navbar on login page
  const isLoginPage = location.pathname === '/login';
  
  return (
    <div className="public-layout">
      {!isLoginPage && <Navbar />}
      <Outlet />
    </div>
  );
};

// Layout for authenticated pages with role-based access control
export const AuthLayout = ({ requiredRole }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  useEffect(() => {
    console.log('AuthLayout useEffect - user:', user);
    if (!user) {
      console.log('AuthLayout useEffect - redirecting to login');
      navigate('/login', { replace: true, state: { from: location } });
    }
  }, [user, navigate, location]);
  
  // If not authenticated, redirect handled in useEffect above
  if (!user) {
    return null; // Prevent rendering while redirecting
  }
  
  // If user doesn't have the required role, redirect to their dashboard
  if (requiredRole && user.role !== requiredRole) {
    console.log(`AuthLayout redirecting to /${user.role} due to role mismatch`);
    return <Navigate to={`/${user.role}`} replace />;
  }
  
  console.log('AuthLayout rendering children for user:', user);
  return (
    <div className="auth-layout">
      <Navbar />
      <Sidebar />
      <main className="dashboard-container">
        <div className="dashboard-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};