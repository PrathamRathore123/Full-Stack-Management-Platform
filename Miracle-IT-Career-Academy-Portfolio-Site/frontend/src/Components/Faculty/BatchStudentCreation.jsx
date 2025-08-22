import React, { useState, useEffect } from 'react';
import { userAxiosInstance, fetchCourseSpecificBatches } from '../../api';
import './StudentList.css';
import { FaSpinner } from 'react-icons/fa';
import axios from 'axios';

const BatchStudentCreation = ({ onClose, onSuccess, selectedCourse, selectedBatch }) => {
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [numberOfStudents, setNumberOfStudents] = useState(15);
  const [startingId, setStartingId] = useState(1);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [createdStudents, setCreatedStudents] = useState([]);

  useEffect(() => {
    if (selectedCourse) {
      fetchCourses();
      fetchBatchList(selectedCourse);
    }

    // Check localStorage for last enrollment ID
    const savedId = localStorage.getItem('lastEnrollmentId');
    if (savedId) {
      const currentNum = parseInt(savedId.replace('MIRA', ''));
      setStartingId(currentNum + 1);
    } else {
      setStartingId(1);
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      // Use axios directly instead of userAxiosInstance to avoid auth issues
      const response = await axios.get('http://localhost:8000/api/courses/courses/');
      setCourses(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load courses');
      setLoading(false);
      console.error('Error fetching courses:', err);
    }
  };

  // Fetch batches for the selected course
  const fetchBatchList = async (courseId) => {
    try {
      setLoading(true);
      const response = await fetchCourseSpecificBatches(courseId);
      setBatches(response);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching course batches:', err);
      setLoading(false);
    }
  };

  const handleNumberChange = (e) => {
    setNumberOfStudents(parseInt(e.target.value));
  };
  
  const handleStartingIdChange = (e) => {
    setStartingId(parseInt(e.target.value));
  };

  const generateStudentData = (index) => {
    // Calculate the enrollment ID
    const enrollmentId = `MIRA${(startingId + index).toString().padStart(4, '0')}`;
    
    // Generate a random date of birth (18-25 years old)
    const today = new Date();
    const minAge = 18;
    const maxAge = 25;
    const randomAge = Math.floor(Math.random() * (maxAge - minAge + 1)) + minAge;
    const birthYear = today.getFullYear() - randomAge;
    const birthMonth = Math.floor(Math.random() * 12) + 1;
    const birthDay = Math.floor(Math.random() * 28) + 1; // Avoid invalid dates
    const dateOfBirth = `${birthYear}-${birthMonth.toString().padStart(2, '0')}-${birthDay.toString().padStart(2, '0')}`;
    
    // Create the student data object with unique username - ensure username is truly unique
    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 1000);
    const studentData = {
      username: `Student_${enrollmentId}_${timestamp}_${randomSuffix}`,
      email: `student${enrollmentId.toLowerCase()}@example.com`,
      enrollment_id: enrollmentId,
      date_of_birth: dateOfBirth,
      batch_id: selectedBatch,
      course_id: parseInt(selectedCourse) // Ensure course_id is an integer
    };
    
    console.log('Creating student with data:', studentData);
    return studentData;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedCourse) {
      setError('Please select a course');
      return;
    }
    
    if (!selectedBatch) {
      setError('Please select a batch');
      return;
    }
    
    setCreating(true);
    setProgress(0);
    setCreatedStudents([]);
    setError(null);
    
    try {
      const createdList = [];
      let successCount = 0;
      let errorCount = 0;
      
      // Create students one by one
      for (let i = 0; i < numberOfStudents; i++) {
        const studentData = generateStudentData(i);
        
        try {
          // Make API call to create student
          const response = await userAxiosInstance.post('create-student/', studentData);
          
          // Add to created list
          createdList.push(response.data);
          successCount++;
          
          // Update progress
          setProgress(Math.round(((i + 1) / numberOfStudents) * 100));
        } catch (err) {
          console.error(`Error creating student ${i + 1}:`, err);
          // Log detailed error response for debugging
          if (err.response) {
            console.error(`Error details:`, err.response.data);
          }
          errorCount++;
          // Continue with the next student even if one fails
        }
        
        // Add a small delay between requests to prevent server overload
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      setCreatedStudents(createdList);
      
      // Update the last enrollment ID in localStorage
      const lastCreatedId = startingId + numberOfStudents - 1;
      const newEnrollmentId = `MIRA${lastCreatedId.toString().padStart(4, '0')}`;
      localStorage.setItem('lastEnrollmentId', newEnrollmentId);
      
      setCreating(false);
      
      // Show success/error message
      if (errorCount > 0) {
        setError(`Created ${successCount} students successfully. Failed to create ${errorCount} students.`);
      }
      
      // Call success callback after a short delay to show completion
      if (successCount > 0) {
        setTimeout(() => {
          onSuccess && onSuccess();
        }, 1500);
      }
      
    } catch (err) {
      console.error('Batch student creation error:', err);
      setError('Failed to create student accounts. Please try again.');
      setCreating(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content batch-creation">
        <div className="modal-header">
          <h2>Add Students to Batch</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="startingId">Starting Enrollment Number</label>
            <input
              type="number"
              id="startingId"
              name="startingId"
              value={startingId}
              onChange={handleStartingIdChange}
              min="1"
              required
              disabled={creating}
            />
            <small className="form-hint">First student will have ID MIRA{startingId.toString().padStart(4, '0')}</small>
          </div>
          
          <div className="form-group">
            <label htmlFor="numberOfStudents">Number of Students</label>
            <input
              type="number"
              id="numberOfStudents"
              name="numberOfStudents"
              value={numberOfStudents}
              onChange={handleNumberChange}
              min="1"
              max="50"
              required
              disabled={creating}
            />
            <small className="form-hint">Maximum 50 students per batch</small>
          </div>
          
          <div className="form-group">
            <small className="form-hint">Students will use their date of birth (DDMMYYYY format) as password to login</small>
          </div>
          
          <div className="form-group">
            <label>ID Range Preview</label>
            <div className="enrollment-id-preview">
              MIRA{startingId.toString().padStart(4, '0')} - MIRA{(startingId + numberOfStudents - 1).toString().padStart(4, '0')}
            </div>
          </div>
          
          {creating && (
            <div className="progress-container">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="progress-text">
                Creating students... {progress}%
              </div>
            </div>
          )}
          
          {createdStudents.length > 0 && (
            <div className="success-message">
              Successfully created {createdStudents.length} student accounts!
            </div>
          )}
          
          <div className="form-actions">
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={onClose}
              disabled={creating}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={creating || loading}
            >
              {creating ? (
                <>
                  <FaSpinner className="spinner" /> Creating...
                </>
              ) : 'Create Students'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BatchStudentCreation;