import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { AuthLayout, PublicLayout } from './Components/Layout';
import { userAxiosInstance, adminAxiosInstance } from './api';
import Home from './Components/Home/Home';
import About from './Components/About/About';
import Login from './Components/Profile/Login';
import Explore from './Components/Explore/Explore';
import AdminDashboard from './Components/Admin/AdminDashboard';
import FacultyDashboard from './Components/Faculty/FacultyDashboard';
import StudentDashboard from './Components/Student/StudentDashboard';
import StudentCourses from './Components/Student/StudentCourses';
import StudentAttendance from './Components/Student/StudentAttendance';
import StudentPerformance from './Components/Student/StudentPerformance';
import StudentProfile from './Components/Student/StudentProfile';
import StudentProjects from './Components/Student/StudentProjects';
import StudentFees from './Components/Student/StudentFees';
import StudentFeeManagement from './Components/Student/StudentFeeManagement';
import StudentFeeDetails from './Components/Student/StudentFeeDetails';
import StudentDocuments from './Components/Student/StudentDocuments';
import StudentAchievements from './Components/Student/StudentAchievements';
import Notifications from './Components/Student/Notifications';
import AttendanceView from './Components/Student/AttendanceView';
import AddCourse from './Components/Admin/AddCourse';
import AddWorkshop from './Components/Admin/AddWorkshop';
import CreateAdmin from './Components/Admin/CreateAdmin';
import CreateFaculty from './Components/Admin/CreateFaculty';
import UserManagement from './Components/Admin/UserManagement';
import CourseManagement from './Components/Admin/CourseManagement';
import ManageCourses from './Components/Admin/ManageCourses';
import RegisteredUsers from './Components/Admin/RegisteredUsers';
import WorkshopRegistrations from './Components/Admin/WorkshopRegistrations';
import AttendanceLogs from './Components/Admin/AttendanceLogs';
import SyllabusEditor from './Components/Admin/SyllabusEditor';
import SystemSettings from './Components/Admin/SystemSettings';
import Certificates from './Components/Admin/Certificates';
import FeeTracking from './Components/Admin/FeeManagement';
import FeeManagement from './Components/Admin/FeeManagement';
import CreateFeeStructure from './Components/Admin/CreateFeeStructure';
import FeeStructureList from './Components/Admin/FeeStructureList';
import FeeStructureDetails from './Components/Admin/FeeStructureDetails';
import AssignFeeToStudent from './Components/Admin/AssignFeeToStudent';
import RecordPayment from './Components/Admin/RecordPayment';
import PaymentHistory from './Components/Admin/PaymentHistory';
import StudentFeeStatus from './Components/Faculty/StudentFeeStatus';
import FacultyManageCourses from './Components/Faculty/ManageCourses';
import FacultyStudentAttendance from './Components/Faculty/StudentAttendance';
import ProjectManagement from './Components/Faculty/ProjectManagement';
import Gradebook from './Components/Faculty/Gradebook';
import FacultyAnnouncements from './Components/Faculty/FacultyAnnouncements';
import StudentList from './Components/Faculty/StudentList';
import FacultyRegisteredUsers from './Components/Faculty/RegisteredUsers';
import { UserProvider } from './Components/UserContext';
import './App.css';

// Set up axios defaults
axios.defaults.baseURL = 'http://localhost:8000';
axios.defaults.withCredentials = true;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('access');
    if (token) {
      // Fetch user profile
      userAxiosInstance.get('profile/')
        .then(response => {
          setUser(response.data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching user profile:', error);
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    setUser(null);
  };


  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="login" element={<Login />} />
            
            {/* Explore Routes */}
            <Route path="explore/*" element={<Explore />}>
              <Route path="certificates" element={<Explore />} />
              <Route path="workshops" element={<Explore />} />
              <Route path="workshops/:id" element={<Explore />} />
              <Route path="workshops/:id/register" element={<Explore />} />
              <Route path="quizzes" element={<Explore />} />
              <Route path="course/:courseId" element={<Explore />} />
              
              {/* Development Hub routes */}
              <Route path="courses/mern" element={<Explore />} />
              <Route path="courses/python" element={<Explore />} />
              <Route path="courses/full-stack-web-development" element={<Explore />} />
              <Route path="courses/c-cpp-data-structure" element={<Explore />} />
              <Route path="courses/java" element={<Explore />} />
              <Route path="courses/php" element={<Explore />} />
              
              {/* AI and ML Track routes */}
              <Route path="courses/artificial-intelligence" element={<Explore />} />
              <Route path="courses/machine-learning" element={<Explore />} />
              <Route path="courses/big-data" element={<Explore />} />
              <Route path="courses/data-science" element={<Explore />} />
              
              {/* Cloud Security routes */}
              <Route path="courses/it-security" element={<Explore />} />
              <Route path="courses/cloud-computing" element={<Explore />} />
              <Route path="courses/devops" element={<Explore />} />
              <Route path="courses/aws-azure" element={<Explore />} />
              
              {/* JOB Linked Program routes */}
              <Route path="courses/pgdse" element={<Explore />} />
              <Route path="courses/pgdie" element={<Explore />} />
              <Route path="courses/pgdfe" element={<Explore />} />
              <Route path="courses/pgdda" element={<Explore />} />
              <Route path="courses/aiml-advance-diploma" element={<Explore />} />
              
              {/* Category-based course listing */}
              <Route path="courses/category/:category" element={<Explore />} />
              
              {/* Fallback for other course routes */}
              <Route path="courses/*" element={<Explore />} />
            </Route>
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AuthLayout requiredRole="admin" />}>
            <Route index element={<AdminDashboard />} />
            <Route path="add-course" element={<AddCourse />} />
            <Route path="add-workshop" element={<AddWorkshop />} />
            <Route path="create-admin" element={<CreateAdmin />} />
            <Route path="create-faculty" element={<CreateFaculty />} />
            <Route path="user-management" element={<UserManagement />} />
            <Route path="course-management" element={<CourseManagement />} />
            <Route path="manage-courses" element={<ManageCourses />} />
            <Route path="registered-users" element={<RegisteredUsers />} />
            <Route path="workshop-registrations" element={<WorkshopRegistrations />} />
            <Route path="attendance-logs" element={<AttendanceLogs />} />
            <Route path="syllabus-editor" element={<SyllabusEditor />} />
            <Route path="system-settings" element={<SystemSettings />} />
            <Route path="certificates" element={<Certificates />} />
            <Route path="fee-tracking" element={<FeeTracking />} />
            <Route path="fee-management" element={<FeeManagement />} />
            <Route path="fee-structure" element={<FeeStructureList />} />
            <Route path="fee-structures/create" element={<CreateFeeStructure />} />
            <Route path="fee-structures/:id" element={<CreateFeeStructure />} />
            <Route path="fee-structures/:id/details" element={<FeeStructureDetails />} />
            <Route path="student-fees/assign" element={<AssignFeeToStudent />} />
            <Route path="student-fees/:feeId/record-payment" element={<RecordPayment />} />
            <Route path="student-fees/:feeId/payments" element={<PaymentHistory />} />
          </Route>

          {/* Faculty Routes */}
          <Route path="/faculty" element={<AuthLayout requiredRole="faculty" />}>
            <Route index element={<FacultyDashboard />} />
              <Route path="courses" element={<FacultyManageCourses />} />
              <Route path="add-course" element={<AddCourse />} />
              <Route path="add-workshop" element={<AddWorkshop />} />
              <Route path="courses/:courseId/syllabus" element={<SyllabusEditor />} />
              <Route path="attendance" element={<FacultyStudentAttendance />} />
              <Route path="gradebook" element={<Gradebook />} />
              <Route path="projects" element={<ProjectManagement />} />
              <Route path="announcements" element={<FacultyAnnouncements />} />
              <Route path="students" element={<StudentList />} />
              <Route path="workshop-registrations" element={<WorkshopRegistrations />} />
              <Route path="registered-users" element={<FacultyRegisteredUsers />} />
            <Route path="fee-status" element={<StudentFeeStatus />} />
            <Route path="fee-status/:batchId" element={<StudentFeeStatus />} />
          </Route>

          {/* Student Routes */}
          <Route path="/student" element={<AuthLayout requiredRole="student" />}>
            <Route index element={<StudentDashboard />} />
            <Route path="courses" element={<StudentCourses />} />
            <Route path="attendance" element={<StudentAttendance />} />
            <Route path="performance" element={<StudentPerformance />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="projects" element={<StudentProjects />} />
            <Route path="fees" element={<StudentFees />} />
            <Route path="fee-management" element={<StudentFeeManagement />} />
            <Route path="fee-details" element={<StudentFeeDetails />} />
            <Route path="documents" element={<StudentDocuments />} />
            <Route path="achievements" element={<StudentAchievements />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="attendance/:date" element={<AttendanceView />} />
          </Route>
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;