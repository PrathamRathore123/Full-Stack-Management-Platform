import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar-explore.css';
import { FaCertificate, FaChalkboardTeacher, FaQuestionCircle, FaCode, FaRobot, FaShieldAlt, FaBriefcase } from 'react-icons/fa';

const Sidebar = () => {
  const location = useLocation();
  const sidebarRef = useRef(null);
  
  useEffect(() => {
    // Add animation order to menu items
    if (sidebarRef.current) {
      const menuItems = sidebarRef.current.querySelectorAll('.sidebar-menu li, .category-menu li');
      menuItems.forEach((item, index) => {
        item.style.setProperty('--animation-order', index);
      });
    }
  }, []);
  
  return (
    <div className="sidebar-explore" ref={sidebarRef}>
      <h2>Explore</h2>
      <ul className="sidebar-menu-explore">
        <li className={location.pathname === "/explore/certificates" ? "active" : ""}>
          <Link to="/explore/certificates"><FaCertificate className="menu-icon" /> Earn a Certificate</Link>
        </li>
        <li className={location.pathname === "/explore/workshops" ? "active" : ""}>
          <Link to="/explore/workshops"><FaChalkboardTeacher className="menu-icon" /> Attend a Workshop</Link>
        </li>
        <li className={location.pathname === "/explore/quizzes" ? "active" : ""}>
          <Link to="/explore/quizzes"><FaQuestionCircle className="menu-icon" /> Take Quiz</Link>
        </li>
      </ul>
      
      <h3 className="category-heading"><FaCode className="heading-icon" /> Development Hub</h3>
      <ul className="category-menu">
        <li className={location.pathname === "/explore/courses/mern" ? "active" : ""}>
          <Link to="/explore/courses/mern">MERN</Link>
        </li>
        <li className={location.pathname === "/explore/courses/full-stack-web-development" ? "active" : ""}>
          <Link to="/explore/courses/full-stack-web-development">Full Stack Web Development</Link>
        </li>
        <li className={location.pathname === "/explore/courses/c-cpp-data-structure" ? "active" : ""}>
          <Link to="/explore/courses/c-cpp-data-structure">C/C++/Data Structure</Link>
        </li>
        <li className={location.pathname === "/explore/courses/java" ? "active" : ""}>
          <Link to="/explore/courses/java">Java</Link>
        </li>
        <li className={location.pathname === "/explore/courses/python" ? "active" : ""}>
          <Link to="/explore/courses/python">Python</Link>
        </li>
        <li className={location.pathname === "/explore/courses/php" ? "active" : ""}>
          <Link to="/explore/courses/php">PHP</Link>
        </li>
      </ul>
      
      <h3 className="category-heading"><FaRobot className="heading-icon" /> AI and ML Track</h3>
      <ul className="category-menu">
        <li className={location.pathname === "/explore/courses/artificial-intelligence" ? "active" : ""}>
          <Link to="/explore/courses/artificial-intelligence">Artificial Intelligence</Link>
        </li>
        <li className={location.pathname === "/explore/courses/machine-learning" ? "active" : ""}>
          <Link to="/explore/courses/machine-learning">Machine Learning</Link>
        </li>
        <li className={location.pathname === "/explore/courses/big-data" ? "active" : ""}>
          <Link to="/explore/courses/big-data">Big Data</Link>
        </li>
        <li className={location.pathname === "/explore/courses/data-science" ? "active" : ""}>
          <Link to="/explore/courses/data-science">Data Science and Data Analytics</Link>
        </li>
      </ul>
      
      <h3 className="category-heading"><FaShieldAlt className="heading-icon" /> Cloud Security</h3>
      <ul className="category-menu">
        <li className={location.pathname === "/explore/courses/it-security" ? "active" : ""}>
          <Link to="/explore/courses/it-security">IT Security and Ethical Hacking</Link>
        </li>
        <li className={location.pathname === "/explore/courses/cloud-computing" ? "active" : ""}>
          <Link to="/explore/courses/cloud-computing">Cloud Computing</Link>
        </li>
        <li className={location.pathname === "/explore/courses/devops" ? "active" : ""}>
          <Link to="/explore/courses/devops">DevOps</Link>
        </li>
        <li className={location.pathname === "/explore/courses/aws-azure" ? "active" : ""}>
          <Link to="/explore/courses/aws-azure">AWS/Azure</Link>
        </li>
      </ul>
      
      <h3 className="category-heading"><FaBriefcase className="heading-icon" /> JOB Linked Program</h3>
      <ul className="category-menu">
        <li className={location.pathname === "/explore/courses/pgdse" ? "active" : ""}>
          <Link to="/explore/courses/pgdse">PGDSE</Link>
        </li>
        <li className={location.pathname === "/explore/courses/pgdie" ? "active" : ""}>
          <Link to="/explore/courses/pgdie">PGDIE</Link>
        </li>
        <li className={location.pathname === "/explore/courses/pgdfe" ? "active" : ""}>
          <Link to="/explore/courses/pgdfe">PGDFE</Link>
        </li>
        <li className={location.pathname === "/explore/courses/pgdda" ? "active" : ""}>
          <Link to="/explore/courses/pgdda">PGDDA</Link>
        </li>
        <li className={location.pathname === "/explore/courses/aiml-advance-diploma" ? "active" : ""}>
          <Link to="/explore/courses/aiml-advance-diploma">AIML (Advance Diploma)</Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;