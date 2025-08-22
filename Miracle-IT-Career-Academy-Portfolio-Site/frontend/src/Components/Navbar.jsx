import React, { useContext, useState, useCallback, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from './UserContext';
import './Navbar.css';
import './Navbar-search.css';
import logo from './Images/Logo-miracle.png'
import { FaSignOutAlt, FaUserCircle, FaGlobe, FaSearch } from 'react-icons/fa';

const Navbar = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const userMenuRef = useRef(null);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    setUser(null);
    setUserMenuOpen(false);
    navigate('/login');
  }, [setUser, navigate]);

  const handleWebClick = useCallback(() => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    setUser(null);
    setTimeout(() => {
      navigate('/');
    }, 0);
  }, [setUser, navigate]);

  const toggleUserMenu = useCallback(() => {
    setUserMenuOpen(prevState => !prevState);
  }, []);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (user?.role === 'student') {
        console.log('Searching courses:', searchQuery);
      } else {
        console.log('Searching student details:', searchQuery);
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className={`navbar ${user ? 'logged-in' : ''}`}>
      {!user ? (
        // Non-logged in navbar
        <>
          <div className="nav-left">
            <img src={logo} alt="Miracle Logo" />
          </div>
          <div className="nav-right">
            <ul className="nav-list">
              <li><Link to="/explore">Explore</Link></li>
              <li><Link to="/login">Register</Link></li>
            </ul>
          </div>
        </>
      ) : (
        // Logged in navbar
        <>
          <div className="nav-center logged-in-center">
            <form onSubmit={handleSearchSubmit}>
              <div className="navbar-search-container">
                <FaSearch className="navbar-search-icon" />
                <input
                  type="text"
                  className="navbar-search-input"
                  placeholder={user.role === 'student' ? "Search courses..." : "Search student details..."}
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
            </form>
          </div>
          
          <div className="nav-right-logged-in">
            <ul className="nav-list">
              <li>
                <button onClick={handleWebClick} className="web-link">
                  <FaGlobe className="web-icon" /> Web
                </button>
              </li>
              <li className="user-menu-container" ref={userMenuRef}>
                <div 
                  className="user-profile-button" 
                  onClick={toggleUserMenu}
                >
                  <FaUserCircle className="user-icon" />
                  <span className="username">{user.username}</span>
                </div>
                
                {userMenuOpen && (
                  <div className="dropdown-menu">
                    <ul>
                      <li>
                        <button onClick={handleLogout} className="dropdown-button">
                          <FaSignOutAlt className="menu-icon" /> Logout
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </li>
            </ul>
          </div>
        </>
      )}
    </nav>
  );
};

export default React.memo(Navbar);