import React, { useState, useEffect } from 'react';
import './FacultyDashboard.css';
import './StudentList.css';
import CreateStudent from './CreateStudent';
import EditStudent from './EditStudent';
import { userAxiosInstance } from '../../api';

const StudentList = () => {
  const [showCreateStudent, setShowCreateStudent] = useState(false);
  const [showEditStudent, setShowEditStudent] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [students, setStudents] = useState([]);
  const [expandedStudentId, setExpandedStudentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedBatch, setSelectedBatch] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    onLeaveStudents: 0,
    inactiveStudents: 0
  });
  const studentsPerPage = 10;

  useEffect(() => {
    fetchAllData();
  }, []);
  
  // Update available batches when course selection changes
  useEffect(() => {
    if (selectedCourse !== 'all') {
      // Filter batches based on selected course
      const filteredBatches = batches.filter(batch => 
        batch.course && batch.course.id === parseInt(selectedCourse)
      );
      if (filteredBatches.length === 0) {
        console.log('No batches found for the selected course');
      }
      // Reset batch selection when course changes
      setSelectedBatch('all');
    }
  }, [selectedCourse, batches]);
  
  // Update localStorage with highest enrollment ID when students change
  useEffect(() => {
    if (students.length > 0) {
      const enrollmentIds = students.map(s => s.enrollmentId);
      const highestId = enrollmentIds.reduce((max, id) => {
        const currentNum = parseInt(id.replace('MIRA', ''));
        const maxNum = parseInt(max.replace('MIRA', ''));
        return currentNum > maxNum ? id : max;
      }, 'MIRA0000');
      
      localStorage.setItem('lastEnrollmentId', highestId);
    }
  }, [students]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel for better performance
      const [studentsResponse, batchesResponse, coursesResponse] = await Promise.all([
        userAxiosInstance.get('students/'),
        userAxiosInstance.get('batches/'),
        userAxiosInstance.get('courses/')
      ]);
      
      console.log('API Responses:', {
        students: studentsResponse.data,
        batches: batchesResponse.data,
        courses: coursesResponse.data
      });
      
      // Log the exact structure of coursesResponse to debug
      console.log('Courses response structure:', {
        type: typeof coursesResponse.data,
        isArray: Array.isArray(coursesResponse.data),
        keys: coursesResponse.data ? Object.keys(coursesResponse.data) : [],
        data: coursesResponse.data
      });
      
      // Process batches data
      const batchesMap = {};
      batchesResponse.data.forEach(batch => {
        batchesMap[batch.id] = batch;
      });
      setBatches(batchesResponse.data);
      
      // Process courses data
      const coursesMap = {};
      // Check if coursesResponse.data is an array before using forEach
      if (Array.isArray(coursesResponse.data)) {
        coursesResponse.data.forEach(course => {
          coursesMap[course.id] = course;
        });
      } else {
        console.log('Courses data is not an array:', coursesResponse.data);
      }
      
      // Format the students data
      const formattedStudents = studentsResponse.data.map(student => {
        // Get batch details and associated course
        const batchId = student.batch?.id;
        const batchDetails = batchId && batchesMap[batchId] ? batchesMap[batchId] : null;
        
        // If student has a batch, use the course from that batch
        let courseTitle = 'Not Assigned';
        let courseId = null;
        
        if (batchDetails && batchDetails.course) {
          courseTitle = batchDetails.course.title;
          courseId = batchDetails.course.id;
        } else if (student.course) {
          courseTitle = student.course.title;
          courseId = student.course.id;
        }
        
        // Format the admission date if it exists
        const formattedAdmissionDate = student.admission_date ? student.admission_date : 'Not Available';
        
        // Determine student status (use actual status from API if available)
        const status = student.status || 'Active';
        
        return {
          id: student.id,
          name: student.user.username,
          email: student.user.email,
          enrollmentId: student.enrollment_id,
          dateOfBirth: student.date_of_birth,
          admissionDate: formattedAdmissionDate,
          course: courseTitle,
          courseId: courseId,
          batch: batchDetails ? batchDetails.name : (student.batch ? student.batch.name : 'Not Assigned'),
          batchId: batchId,
          attendance: student.attendance_percentage || '95%',
          performance: student.performance_grade || 'A (90%)',
          status: status
        };
      });
      
      setStudents(formattedStudents);
      
      // Calculate statistics
      const activeStudents = formattedStudents.filter(s => s.status === 'Active').length;
      const onLeaveStudents = formattedStudents.filter(s => s.status === 'On Leave').length;
      const inactiveStudents = formattedStudents.filter(s => s.status === 'Inactive').length;
      
      setStats({
        totalStudents: formattedStudents.length,
        activeStudents,
        onLeaveStudents,
        inactiveStudents
      });
      
      // Check if coursesResponse.data is an object with results property (common API pattern)
      if (coursesResponse.data && typeof coursesResponse.data === 'object' && coursesResponse.data.results) {
        console.log('Using courses from results array:', coursesResponse.data.results);
        setCourses(coursesResponse.data.results);
      } else if (Array.isArray(coursesResponse.data)) {
        console.log('Using courses directly from array:', coursesResponse.data);
        setCourses(coursesResponse.data);
      } else {
        console.log('No valid courses data found, using empty array');
        setCourses([]);
      }
      
      // Debug log to check if students are being loaded correctly
      console.log('Loaded students:', formattedStudents.length);
      console.log('Student course IDs:', formattedStudents.map(s => s.courseId));
      console.log('Student batch IDs:', formattedStudents.map(s => s.batchId));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchBatches = async () => {
    try {
      const response = await userAxiosInstance.get('batches/');
      setBatches(response.data);
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };

  const handleCreateStudent = () => {
    setShowCreateStudent(true);
  };
  
  const handleEditStudent = (student) => {
    setSelectedStudent(student);
    setShowEditStudent(true);
  };
  
  const handleViewStudent = (studentId) => {
    if (expandedStudentId === studentId) {
      setExpandedStudentId(null); // collapse if already expanded
    } else {
      setExpandedStudentId(studentId); // expand this student
    }
  };
  
  const handleDeleteStudent = async (studentId) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await userAxiosInstance.delete(`students/${studentId}/`);
        fetchAllData(); // Refresh all data after deletion
      } catch (error) {
        console.error('Error deleting student:', error);
        alert('Failed to delete student. Please try again.');
      }
    }
  };

  const handleStudentCreated = () => {
    fetchAllData();
    setShowCreateStudent(false);
  };
  
  const handleStudentUpdated = () => {
    console.log('Student updated, refreshing student list');
    // Add a small delay to ensure the backend has processed the update
    setTimeout(() => {
      fetchAllData();
      setShowEditStudent(false);
    }, 300);
  };
  
  const handleBatchChange = (e) => {
    setSelectedBatch(e.target.value);
    setCurrentPage(1); // Reset to first page when filter changes
  };
  
  const handleCourseChange = (e) => {
    setSelectedCourse(e.target.value);
    setCurrentPage(1); // Reset to first page when filter changes
  };
  
  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
    setCurrentPage(1); // Reset to first page when filter changes
  };
  
  const filteredStudents = students.filter(student => {
    // First filter by course
    if (selectedCourse !== 'all') {
      if (!student.courseId && selectedCourse) return false;
      if (student.courseId && String(student.courseId) !== String(selectedCourse)) return false;
    }
    
    // Then filter by batch if a course is selected
    if (selectedBatch !== 'all') {
      if (!student.batchId && selectedBatch) return false;
      if (student.batchId && String(student.batchId) !== String(selectedBatch)) return false;
    }
    
    if (selectedStatus !== 'all' && student.status !== selectedStatus) return false;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        student.name.toLowerCase().includes(term) ||
        student.email.toLowerCase().includes(term) ||
        student.enrollmentId.toLowerCase().includes(term)
      );
    }
    
    return true;
  });
  
  const handleExportList = () => {
    // Create CSV content
    const headers = ['Enrollment ID', 'Name', 'Course', 'Batch', 'Email', 'Admission Date', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredStudents.map(student => [
        student.enrollmentId,
        student.name,
        student.course,
        student.batch,
        student.email,
        student.admissionDate,
        student.status
      ].join(','))
    ].join('\n');
    
    // Create a blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `students_list_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pagination logic
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    
    // Previous button
    buttons.push(
      <button 
        key="prev" 
        className="pagination-btn" 
        onClick={() => paginate(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </button>
    );
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 || 
        i === totalPages || 
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        buttons.push(
          <button
            key={i}
            className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
            onClick={() => paginate(i)}
          >
            {String(i)}
          </button>
        );
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        buttons.push(<span key={`ellipsis-${i}`} className="pagination-ellipsis">...</span>);
      }
    }
    
    // Next button
    buttons.push(
      <button 
        key="next" 
        className="pagination-btn" 
        onClick={() => paginate(currentPage + 1)}
        disabled={currentPage === totalPages || totalPages === 0}
      >
        Next
      </button>
    );
    
    return buttons;
  };

  return (
    <div className="dashboard-container-studentlist">
      <h1 className="page-title">Student List</h1>
      <div className="dashboard-content-studentlist">
        <div className="student-filters">
          <div className="search-filter">
            <input 
              type="text" 
              placeholder="Search students..." 
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select 
              className="filter-select"
              value={selectedCourse}
              onChange={handleCourseChange}
            >
              <option value="all">All Courses</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
            <select 
              className="filter-select"
              value={selectedBatch}
              onChange={handleBatchChange}
              disabled={selectedCourse === 'all'}
            >
              <option value="all">All Batches</option>
              {batches
                .filter(batch => selectedCourse === 'all' || 
                  (batch.course && batch.course.id === parseInt(selectedCourse)))
                .map(batch => (
                  <option key={batch.id} value={batch.id}>
                    {batch.name}
                  </option>
                ))}
            </select>
            <select 
              className="filter-select"
              value={selectedStatus}
              onChange={handleStatusChange}
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>
          <div className="filter-actions">
            <button className="btn-primary-student" onClick={handleCreateStudent}>
              <span className="btn-icon-text">+ Add Student</span>
            </button>
            <button className="btn-secondary-student" onClick={handleExportList}>
              <span className="btn-icon-text">↓ Export List</span>
            </button>
          </div>
        </div>
        
        <div className="student-stats">
          <div className="stat-card">
            <h3>Total Students</h3>
            <p className="stat-number">{stats.totalStudents}</p>
          </div>
          <div className="stat-card">
            <h3>Active</h3>
            <p className="stat-number">{stats.activeStudents}</p>
            <p className="stat-percentage">
              {String(stats.totalStudents ? Math.round((stats.activeStudents / stats.totalStudents) * 100) : 0)}%
            </p>
          </div>
          <div className="stat-card">
            <h3>On Leave</h3>
            <p className="stat-number">{stats.onLeaveStudents}</p>
            <p className="stat-percentage">
              {String(stats.totalStudents ? Math.round((stats.onLeaveStudents / stats.totalStudents) * 100) : 0)}%
            </p>
          </div>
          <div className="stat-card">
            <h3>Inactive</h3>
            <p className="stat-number">{stats.inactiveStudents}</p>
            <p className="stat-percentage">
              {String(stats.totalStudents ? Math.round((stats.inactiveStudents / stats.totalStudents) * 100) : 0)}%
            </p>
          </div>
        </div>
        
        <div className="student-table">
          <table>
            <thead>
              <tr>
                <th>Enrollment ID</th>
                <th>Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="3" className="loading-cell">Loading students...</td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="3" className="empty-cell">No students found</td>
                </tr>
              ) : (
                currentStudents.map(student => (
                  <React.Fragment key={student.id}>
                    <tr>
                      <td>{student.enrollmentId}</td>
                      <td>{student.name}</td>
                      <td className="action-buttons">
                        <button 
                          className={`btn-icon view-btn ${expandedStudentId === student.id ? 'active' : ''}`}
                          title="View Details"
                          onClick={() => handleViewStudent(student.id)}
                        >
                          👁️
                        </button>
                        <button 
                          className="btn-icon edit-btn" 
                          title="Edit" 
                          onClick={() => handleEditStudent(student)}
                        >
                          📝
                        </button>
                        <button 
                          className="btn-icon delete-btn" 
                          title="Delete"
                          onClick={() => handleDeleteStudent(student.id)}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                    {expandedStudentId === student.id && (
                      <tr className="student-details-row">
                        <td colSpan="3">
                          <div className="student-details-dropdown">
                            <div className="details-grid">
                              <div className="detail-item">
                                <span className="detail-label">Email</span>
                                <span className="detail-value">{student.email}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Date of Birth</span>
                                <span className="detail-value">{student.dateOfBirth}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Admission Date</span>
                                <span className="detail-value">{student.admissionDate}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Course</span>
                                <span className="detail-value">{student.course}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Batch</span>
                                <span className="detail-value">{student.batch}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Status</span>
                                <span className={`detail-value status-${student.status.toLowerCase().replace(' ', '-')}`}>
                                  {student.status}
                                </span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Attendance</span>
                                <span className="detail-value">{student.attendance}</span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Performance</span>
                                <span className="detail-value">{student.performance}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {filteredStudents.length > 0 && (
          <div className="pagination">
            {renderPaginationButtons()}
          </div>
        )}
      </div>
      
      {showCreateStudent && (
        <CreateStudent 
          onClose={() => setShowCreateStudent(false)} 
          onSuccess={handleStudentCreated}
        />
      )}
      
      {showEditStudent && selectedStudent && (
        <EditStudent 
          student={selectedStudent}
          onClose={() => setShowEditStudent(false)} 
          onSuccess={handleStudentUpdated}
        />
      )}
    </div>
  );
};

export default StudentList;