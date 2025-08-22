import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './StudentProjects.css';

const StudentProjects = () => {
  const [projects, setProjects] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [formData, setFormData] = useState({
    repository_url: '',
    live_url: '',
    notes: ''
  });
  const [filters, setFilters] = useState({
    technology: '',
    status: ''
  });
  const [technologies, setTechnologies] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access');
        const headers = { 'Authorization': `Bearer ${token}` };
        
        // Get student ID and batch
        const userResponse = await axios.get('http://localhost:8000/api/current-user/', { headers });
        const studentId = userResponse.data.student_id;
        const batchId = userResponse.data.batch_id;
        
        if (!batchId) {
          setLoading(false);
          return;
        }
        
        // Fetch projects for student's batch
        const projectsResponse = await axios.get(`http://localhost:8000/api/projects/?batch_id=${batchId}`, { headers });
        setProjects(projectsResponse.data);
        
        // Fetch technologies
        const techResponse = await axios.get('http://localhost:8000/api/projects/technologies/', { headers });
        setTechnologies(techResponse.data);
        
        // Fetch student's submissions
        const submissionsResponse = await axios.get(`http://localhost:8000/api/project-submissions/?student_id=${studentId}`, { headers });
        
        // Create a map of project_id to submission
        const submissionsMap = {};
        submissionsResponse.data.forEach(submission => {
          submissionsMap[submission.project] = submission;
        });
        
        setSubmissions(submissionsMap);
        
        // Fetch student achievements
        const achievementsResponse = await axios.get(`http://localhost:8000/api/student-achievements/?student_id=${studentId}`, { headers });
        setAchievements(achievementsResponse.data);
        
        // Fetch leaderboard data
        const leaderboardResponse = await axios.get(`http://localhost:8000/api/project-leaderboard/?batch_id=${batchId}`, { headers });
        setLeaderboard(leaderboardResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load projects');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const getFilteredProjects = () => {
    return projects.filter(project => {
      // Filter by technology
      if (filters.technology && !project.technologies.includes(filters.technology)) {
        return false;
      }
      
      // Filter by submission status
      if (filters.status) {
        const submission = submissions[project.id];
        
        if (filters.status === 'submitted' && !submission) {
          return false;
        }
        
        if (filters.status === 'not-submitted' && submission) {
          return false;
        }
        
        if (filters.status === 'approved' && (!submission || submission.status !== 'approved')) {
          return false;
        }
        
        if (filters.status === 'rejected' && (!submission || submission.status !== 'rejected')) {
          return false;
        }
      }
      
      return true;
    });
  };

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    
    // If there's an existing submission, pre-fill the form
    const submission = submissions[project.id];
    if (submission) {
      setFormData({
        repository_url: submission.repository_url || '',
        live_url: submission.live_url || '',
        notes: submission.notes || ''
      });
    } else {
      // Reset form for new submission
      setFormData({
        repository_url: '',
        live_url: '',
        notes: ''
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedProject) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('access');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      // Get student ID
      const userResponse = await axios.get('http://localhost:8000/api/current-user/', { headers });
      const studentId = userResponse.data.student_id;
      
      const submission = submissions[selectedProject.id];
      
      if (submission) {
        // Update existing submission
        await axios.patch(
          `http://localhost:8000/api/project-submissions/${submission.id}/`,
          {
            ...formData,
            status: 'submitted' // Reset status to submitted on update
          },
          { headers }
        );
        
        toast.success('Project submission updated successfully');
      } else {
        // Create new submission
        await axios.post(
          'http://localhost:8000/api/project-submissions/',
          {
            ...formData,
            project: selectedProject.id,
            student: studentId
          },
          { headers }
        );
        
        toast.success('Project submitted successfully');
      }
      
      // Refresh submissions
      const submissionsResponse = await axios.get(
        `http://localhost:8000/api/project-submissions/?student_id=${studentId}`,
        { headers }
      );
      
      // Update submissions map
      const submissionsMap = {};
      submissionsResponse.data.forEach(submission => {
        submissionsMap[submission.project] = submission;
      });
      
      setSubmissions(submissionsMap);
      
      // Refresh achievements
      const achievementsResponse = await axios.get(`http://localhost:8000/api/student-achievements/?student_id=${studentId}`, { headers });
      setAchievements(achievementsResponse.data);
      
      // Refresh leaderboard
      const batchId = userResponse.data.batch_id;
      const leaderboardResponse = await axios.get(`http://localhost:8000/api/project-leaderboard/?batch_id=${batchId}`, { headers });
      setLeaderboard(leaderboardResponse.data);
      
      setSelectedProject(null);
    } catch (error) {
      console.error('Error submitting project:', error);
      toast.error('Failed to submit project');
    } finally {
      setLoading(false);
    }
  };

  const getSubmissionStatus = (projectId) => {
    const submission = submissions[projectId];
    if (!submission) return 'Not Submitted';
    return submission.status.charAt(0).toUpperCase() + submission.status.slice(1);
  };

  const getStatusClass = (projectId) => {
    const submission = submissions[projectId];
    if (!submission) return 'not-submitted';
    return submission.status;
  };

  if (loading && projects.length === 0) {
    return <div className="loading">Loading projects...</div>;
  }

  const filteredProjects = getFilteredProjects();

  return (
    <div className="student-projects-container">
      <h2>My Projects</h2>
      
      {/* Achievement Badges Section */}
      {achievements.length > 0 && (
        <div className="achievements-section">
          <h3>Your Achievements</h3>
          <div className="badges-container">
            {achievements.map(achievement => (
              <div key={achievement.id} className="achievement-badge">
                <i className={`fa fa-${achievement.icon || 'award'}`}></i>
                {achievement.name}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Skill Tree Visualization */}
      <div className="skill-tree-section">
        <h3>Your Skills</h3>
        <div className="skill-tree-visualization">
          {/* This would be a visual representation of skills developed */}
          {/* For now, we'll show a simple list of technologies used in completed projects */}
          <div className="skill-tags">
            {Object.values(submissions)
              .filter(sub => sub.status === 'approved')
              .flatMap(sub => {
                const project = projects.find(p => p.id === sub.project);
                return project ? project.technologies : [];
              })
              .filter((tech, index, self) => self.indexOf(tech) === index) // Remove duplicates
              .map(tech => (
                <span key={tech} className="skill-tag">{tech}</span>
              ))}
          </div>
        </div>
      </div>
      
      {/* Leaderboard Section */}
      {leaderboard.length > 0 && (
        <div className="leaderboard-section">
          <h3>Project Leaderboard</h3>
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Student</th>
                <th>Projects Completed</th>
                <th>Average Grade</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, index) => (
                <tr key={entry.student_id}>
                  <td className={`rank rank-${index + 1}`}>{index + 1}</td>
                  <td>{entry.student_name}</td>
                  <td>{entry.completed_projects}</td>
                  <td>{entry.average_grade ? `${entry.average_grade.toFixed(1)}/100` : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="filters">
        <div className="filter-group">
          <label>Technology:</label>
          <select 
            name="technology"
            value={filters.technology} 
            onChange={handleFilterChange}
          >
            <option value="">All Technologies</option>
            {technologies.map(tech => (
              <option key={tech} value={tech}>{tech}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label>Status:</label>
          <select 
            name="status"
            value={filters.status} 
            onChange={handleFilterChange}
          >
            <option value="">All Status</option>
            <option value="not-submitted">Not Submitted</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>
      
      <div className="projects-content">
        <div className="projects-list">
          <h3>Available Projects ({filteredProjects.length})</h3>
          
          {filteredProjects.length === 0 ? (
            <p>No projects found matching your filters.</p>
          ) : (
            <div className="projects-grid">
              {filteredProjects.map(project => (
                <div 
                  key={project.id} 
                  className={`project-card ${selectedProject?.id === project.id ? 'selected' : ''}`}
                  onClick={() => handleProjectSelect(project)}
                >
                  <h4>{project.title}</h4>
                  <div className="project-tech-list">
                    {project.technologies.map(tech => (
                      <span key={tech} className="tech-tag">{tech}</span>
                    ))}
                  </div>
                  <p className="project-description">{project.description.substring(0, 100)}...</p>
                  <div className="project-meta">
                    <span className={`difficulty ${project.difficulty}`}>
                      {project.difficulty}
                    </span>
                    <span className={`status ${getStatusClass(project.id)}`}>
                      {getSubmissionStatus(project.id)}
                    </span>
                  </div>
                  {project.deadline && (
                    <p className="deadline">
                      <strong>Deadline:</strong> {new Date(project.deadline).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {selectedProject && (
          <div className="submission-form">
            <h3>
              {submissions[selectedProject.id] ? 'Update Submission' : 'Submit Project'}:
              {' '}{selectedProject.title}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>GitHub Repository URL:</label>
                <input
                  type="url"
                  name="repository_url"
                  value={formData.repository_url}
                  onChange={handleInputChange}
                  placeholder="https://github.com/username/repository"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Live Demo URL (optional):</label>
                <input
                  type="url"
                  name="live_url"
                  value={formData.live_url}
                  onChange={handleInputChange}
                  placeholder="https://your-project-demo.com"
                />
              </div>
              
              <div className="form-group">
                <label>Notes (optional):</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Add any notes or comments about your submission"
                  rows="4"
                ></textarea>
              </div>
              
              {submissions[selectedProject.id] && (
                <div className="submission-feedback">
                  <h4>Feedback</h4>
                  <p><strong>Status:</strong> {getSubmissionStatus(selectedProject.id)}</p>
                  
                  {submissions[selectedProject.id].grade !== null && (
                    <p><strong>Grade:</strong> {submissions[selectedProject.id].grade}/100</p>
                  )}
                  
                  {submissions[selectedProject.id].feedback && (
                    <div className="feedback-text">
                      <strong>Instructor Feedback:</strong>
                      <p>{submissions[selectedProject.id].feedback}</p>
                    </div>
                  )}
                </div>
              )}
              
              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={() => setSelectedProject(null)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : (submissions[selectedProject.id] ? 'Update Submission' : 'Submit Project')}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentProjects;