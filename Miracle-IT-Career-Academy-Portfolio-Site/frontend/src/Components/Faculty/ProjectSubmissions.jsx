import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import './ProjectSubmissions.css';

const ProjectSubmissions = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [grade, setGrade] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access');
        const headers = { 'Authorization': `Bearer ${token}` };
        
        // Fetch project details
        const projectResponse = await axios.get(`http://localhost:8000/api/projects/${projectId}/`, { headers });
        setProject(projectResponse.data);
        
        // Fetch submissions for this project
        const submissionsResponse = await axios.get(`http://localhost:8000/api/project-submissions/?project_id=${projectId}`, { headers });
        setSubmissions(submissionsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load project data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [projectId]);

  const handleSubmissionSelect = (submission) => {
    setSelectedSubmission(submission);
    setFeedback(submission.feedback || '');
    setGrade(submission.grade || '');
    setStatus(submission.status || 'submitted');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedSubmission) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('access');
      
      await axios.post(
        `http://localhost:8000/api/project-submissions/${selectedSubmission.id}/review/`,
        {
          feedback,
          grade: grade ? parseInt(grade) : null,
          status
        },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      toast.success('Review submitted successfully');
      
      // Refresh submissions
      const submissionsResponse = await axios.get(
        `http://localhost:8000/api/project-submissions/?project_id=${projectId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      setSubmissions(submissionsResponse.data);
      setSelectedSubmission(null);
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !project) {
    return <div className="loading">Loading project details...</div>;
  }

  return (
    <div className="project-submissions-container">
      {project && (
        <div className="project-header">
          <h2>{project.title} - Submissions</h2>
          <div className="project-details">
            <p><strong>Batch:</strong> {project.batch_name}</p>
            <p><strong>Difficulty:</strong> {project.difficulty}</p>
            <p><strong>Technologies:</strong> {project.technologies.join(', ')}</p>
            <p><strong>Deadline:</strong> {project.deadline || 'No deadline'}</p>
          </div>
        </div>
      )}
      
      <div className="submissions-content">
        <div className="submissions-list">
          <h3>Student Submissions ({submissions.length})</h3>
          
          {submissions.length === 0 ? (
            <p>No submissions yet for this project.</p>
          ) : (
            <table className="submissions-table">
              <thead>
                <tr>
                  <th>Enrollment ID</th>
                  <th>Student Name</th>
                  <th>Submission Date</th>
                  <th>Status</th>
                  <th>Grade</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map(submission => (
                  <tr 
                    key={submission.id}
                    className={selectedSubmission?.id === submission.id ? 'selected' : ''}
                  >
                    <td>{submission.enrollment_id}</td>
                    <td>{submission.student_name}</td>
                    <td>{new Date(submission.submission_date).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge ${submission.status}`}>
                        {submission.status}
                      </span>
                    </td>
                    <td>{submission.grade || '-'}</td>
                    <td>
                      <button 
                        onClick={() => handleSubmissionSelect(submission)}
                        className="view-btn"
                      >
                        View & Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {selectedSubmission && (
          <div className="submission-details">
            <h3>Submission Details</h3>
            <div className="submission-info">
              <p><strong>Student:</strong> {selectedSubmission.student_name} ({selectedSubmission.enrollment_id})</p>
              <p><strong>Submitted:</strong> {new Date(selectedSubmission.submission_date).toLocaleString()}</p>
              
              {selectedSubmission.repository_url && (
                <p>
                  <strong>Repository:</strong> 
                  <a href={selectedSubmission.repository_url} target="_blank" rel="noopener noreferrer">
                    {selectedSubmission.repository_url}
                  </a>
                </p>
              )}
              
              {selectedSubmission.live_url && (
                <p>
                  <strong>Live Demo:</strong> 
                  <a href={selectedSubmission.live_url} target="_blank" rel="noopener noreferrer">
                    {selectedSubmission.live_url}
                  </a>
                </p>
              )}
              
              {selectedSubmission.notes && (
                <div className="submission-notes">
                  <strong>Student Notes:</strong>
                  <p>{selectedSubmission.notes}</p>
                </div>
              )}
            </div>
            
            <form onSubmit={handleReviewSubmit} className="review-form">
              <h4>Review Submission</h4>
              
              <div className="form-group">
                <label>Status:</label>
                <select 
                  value={status} 
                  onChange={(e) => setStatus(e.target.value)}
                  required
                >
                  <option value="submitted">Submitted</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Grade (0-100):</label>
                <input 
                  type="number" 
                  min="0" 
                  max="100"
                  value={grade} 
                  onChange={(e) => setGrade(e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label>Feedback:</label>
                <textarea 
                  value={feedback} 
                  onChange={(e) => setFeedback(e.target.value)}
                  rows="5"
                ></textarea>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={() => setSelectedSubmission(null)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectSubmissions;