import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './ProjectManagement.css';
import { FaCalendarAlt, FaUsers, FaCode, FaEdit, FaPlus, FaFilter, FaTags } from 'react-icons/fa';

const ProjectManagement = () => {
  const [projects, setProjects] = useState([]);
  const [batches, setBatches] = useState([]);
  const [batchStudentCounts, setBatchStudentCounts] = useState({});
  const [selectedBatch, setSelectedBatch] = useState('');
  const [technologies, setTechnologies] = useState(['React', 'Django', 'JavaScript', 'Python', 'HTML/CSS']);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    technologies: [],
    batch: '',
    difficulty: 'intermediate',
    deadline: '',
    status: 'active'
  });
  const [filters, setFilters] = useState({
    technology: '',
    status: ''
  });
  const [newTechnology, setNewTechnology] = useState('');
  const [studentSubmissions, setStudentSubmissions] = useState({});
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [submissionData, setSubmissionData] = useState({
    enrollment_id: '',
    project_id: null
  });
  const [showDeadlineForm, setShowDeadlineForm] = useState(false);
  const [deadlineData, setDeadlineData] = useState({
    project_id: null,
    new_deadline: ''
  });
  const [showEditForm, setShowEditForm] = useState(false);
  const [editProjectData, setEditProjectData] = useState({
    id: null,
    title: '',
    description: '',
    technologies: [],
    difficulty: '',
    status: ''
  });

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('access');
        const headers = { 'Authorization': `Bearer ${token}` };
        
        // Fetch batches
        const batchesResponse = await axios.get('http://localhost:8000/api/batches/', { headers });
        setBatches(batchesResponse.data);
        
        // Fetch projects
        const projectsResponse = await axios.get('http://localhost:8000/api/projects/', { headers });
        setProjects(projectsResponse.data);
        
        // Fetch student counts for each batch
        const studentCountsObj = {};
        for (const batch of batchesResponse.data) {
          try {
            const studentsResponse = await axios.get(`http://localhost:8000/api/batches/${batch.id}/students/`, { headers });
            studentCountsObj[batch.id] = studentsResponse.data.length;
          } catch (err) {
            console.error(`Error fetching students for batch ${batch.id}:`, err);
            studentCountsObj[batch.id] = 0;
          }
        }
        setBatchStudentCounts(studentCountsObj);
        
        // Try to fetch technologies, but use default if it fails
        try {
          const techResponse = await axios.get('http://localhost:8000/api/projects/technologies/', { headers });
          if (techResponse.data && techResponse.data.length > 0) {
            setTechnologies(techResponse.data);
          }
        } catch (techError) {
          console.log('Using default technologies');
          // Keep using default technologies defined in state
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Debug log for batch filtering
  useEffect(() => {
    if (selectedBatch) {
      console.log('Selected batch:', selectedBatch);
      console.log('Projects with matching batch:', projects.filter(p => String(p.batch_id) === String(selectedBatch)).length);
      console.log('All project batch IDs:', projects.map(p => p.batch));
    }
  }, [selectedBatch, projects]);

  // Filter projects when batch or filters change
  const filteredProjects = projects.filter(project => {
    // Filter by batch - ensure proper type conversion for comparison
    if (selectedBatch && String(project.batch) !== String(selectedBatch)) {
      return false;
    }
    
    // Filter by technology
    if (filters.technology && !project.technologies.includes(filters.technology)) {
      return false;
    }
    
    // Filter by status
    if (filters.status && project.status !== filters.status) {
      return false;
    }
    
    return true;
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleTechnologyChange = (tech) => {
    const updatedTechnologies = formData.technologies.includes(tech)
      ? formData.technologies.filter(t => t !== tech)
      : [...formData.technologies, tech];
    
    setFormData({
      ...formData,
      technologies: updatedTechnologies
    });
  };

  const addNewTechnology = () => {
    if (newTechnology && !technologies.includes(newTechnology)) {
      setTechnologies([...technologies, newTechnology]);
      
      if (!formData.technologies.includes(newTechnology)) {
        setFormData({
          ...formData,
          technologies: [...formData.technologies, newTechnology]
        });
      }
      
      setNewTechnology('');
    } else if (newTechnology) {
      // Technology already exists, just add it to the form if not already there
      if (!formData.technologies.includes(newTechnology)) {
        setFormData({
          ...formData,
          technologies: [...formData.technologies, newTechnology]
        });
      }
      setNewTechnology('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('access');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      // Create new project
      await axios.post(
        'http://localhost:8000/api/projects/',
        formData,
        { headers }
      );
      
      // Refresh projects list
      const projectsResponse = await axios.get('http://localhost:8000/api/projects/', { headers });
      setProjects(projectsResponse.data);
      
      toast.success('Project created successfully');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        technologies: [],
        batch: '',
        difficulty: 'intermediate',
        deadline: '',
        status: 'active'
      });
      
      setShowForm(false);
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const viewSubmissions = (projectId) => {
    // Navigate to submissions page
    window.location.href = `/faculty/project-submissions/${projectId}`;
  };

  const handleMarkSubmitted = (projectId) => {
    setSubmissionData({
      enrollment_id: '',
      project_id: projectId
    });
    setShowSubmissionForm(true);
  };

  const handleSubmissionInputChange = (e) => {
    const { name, value } = e.target;
    setSubmissionData({
      ...submissionData,
      [name]: value
    });
  };

  const handleSubmissionFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('access');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      // Mark project as submitted for the student
      await axios.post(
        'http://localhost:8000/api/project-submissions/mark-submitted/',
        {
          enrollment_id: submissionData.enrollment_id,
          project_id: submissionData.project_id
        },
        { headers }
      );
      
      toast.success('Project marked as submitted for student');
      setShowSubmissionForm(false);
      
      // Refresh projects list
      const projectsResponse = await axios.get('http://localhost:8000/api/projects/', { headers });
      setProjects(projectsResponse.data);
    } catch (error) {
      console.error('Error marking project as submitted:', error);
      toast.error('Failed to mark project as submitted');
    } finally {
      setLoading(false);
    }
  };
  
  const handleExtendDeadline = (projectId, currentDeadline) => {
    setDeadlineData({
      project_id: projectId,
      new_deadline: currentDeadline ? new Date(currentDeadline).toISOString().split('T')[0] : ''
    });
    setShowDeadlineForm(true);
  };
  
  const handleDeadlineInputChange = (e) => {
    const { name, value } = e.target;
    setDeadlineData({
      ...deadlineData,
      [name]: value
    });
  };
  
  const handleDeadlineFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('access');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      // Update project deadline
      await axios.patch(
        `http://localhost:8000/api/projects/${deadlineData.project_id}/`,
        {
          deadline: deadlineData.new_deadline
        },
        { headers }
      );
      
      toast.success('Project deadline extended successfully');
      setShowDeadlineForm(false);
      
      // Refresh projects list
      const projectsResponse = await axios.get('http://localhost:8000/api/projects/', { headers });
      setProjects(projectsResponse.data);
    } catch (error) {
      console.error('Error extending deadline:', error);
      toast.error('Failed to extend project deadline');
    } finally {
      setLoading(false);
    }
  };
  
  const handleEditProject = (project) => {
    // Log the project data to help with debugging
    console.log('Editing project:', project);
    
    setEditProjectData({
      id: project.id,
      title: project.title,
      description: project.description,
      technologies: Array.isArray(project.technologies) ? project.technologies : [],
      difficulty: project.difficulty || 'intermediate',
      status: project.status || 'active'
    });
    setShowEditForm(true);
  };
  
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditProjectData({
      ...editProjectData,
      [name]: value
    });
  };
  
  const handleEditTechnologyChange = (tech) => {
    const updatedTechnologies = editProjectData.technologies.includes(tech)
      ? editProjectData.technologies.filter(t => t !== tech)
      : [...editProjectData.technologies, tech];
    
    setEditProjectData({
      ...editProjectData,
      technologies: updatedTechnologies
    });
  };
  
  const handleEditFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('access');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      // Prepare data for update - only send fields that should be updated
      const updateData = {
        title: editProjectData.title,
        description: editProjectData.description,
        technologies: editProjectData.technologies,
        difficulty: editProjectData.difficulty,
        status: editProjectData.status
      };
      
      console.log('Updating project with data:', updateData);
      
      // Update project details using PATCH to update only specified fields
      const response = await axios.patch(
        `http://localhost:8000/api/projects/${editProjectData.id}/`,
        updateData,
        { headers }
      );
      
      console.log('Update response:', response.data);
      
      toast.success('Project details updated successfully');
      setShowEditForm(false);
      
      // Refresh projects list
      const projectsResponse = await axios.get('http://localhost:8000/api/projects/', { headers });
      setProjects(projectsResponse.data);
    } catch (error) {
      console.error('Error updating project:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        toast.error(`Failed to update project: ${error.response.data.detail || 'Server error'}`);
      } else {
        toast.error('Failed to update project details');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="project-management-container">
      <h2>Project Management</h2>
      
      <div className="controls-container">
        <div className="filters">
          <div className="filter-header">
            <FaFilter /> <span>Filters</span>
          </div>
          <div className="filter-group">
            <label>Batch:</label>
            <select 
              value={selectedBatch} 
              onChange={(e) => {
                console.log('Batch selected:', e.target.value);
                setSelectedBatch(e.target.value);
              }}
            >
              <option value="">All Batches</option>
              {batches.map(batch => (
                <option key={batch.id} value={batch.id}>
                  {batch.name} {batch.course ? `- ${batch.course.title}` : ''}
                </option>
              ))}
            </select>
          </div>
          
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
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
        
        <button 
          className="create-project-btn"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : <><FaPlus /> Create New Project</>}
        </button>
      </div>
      
      {showForm && (
        <div className="project-form-container">
          <h3><FaPlus className="form-icon" /> Create New Project</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title:</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Description:</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Batch:</label>
              <select
                name="batch"
                value={formData.batch}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Batch</option>
                {batches.map(batch => (
                  <option key={batch.id} value={batch.id}>
                    {batch.name} {batch.course ? `- ${batch.course.title}` : ''}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Difficulty:</label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Deadline:</label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-group">
              <label><FaTags /> Technologies:</label>
              <div className="technologies-container">
                {technologies.map(tech => (
                  <div key={tech} className="technology-checkbox">
                    <input
                      type="checkbox"
                      id={`tech-${tech}`}
                      checked={formData.technologies.includes(tech)}
                      onChange={() => handleTechnologyChange(tech)}
                    />
                    <label htmlFor={`tech-${tech}`}>{tech}</label>
                  </div>
                ))}
              </div>
              
              <div className="add-technology">
                <input
                  type="text"
                  value={newTechnology}
                  onChange={(e) => setNewTechnology(e.target.value)}
                  placeholder="Add new technology"
                />
                <button 
                  type="button" 
                  onClick={addNewTechnology}
                  disabled={!newTechnology}
                >
                  Add
                </button>
              </div>
            </div>
            
            <div className="form-group">
              <label>Status:</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                onClick={() => setShowForm(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="submit-btn"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {showSubmissionForm && (
        <div className="modal-overlay">
          <div className="submission-form-modal">
            <h3><FaCode className="form-icon" /> Mark Project as Submitted</h3>
            <form onSubmit={handleSubmissionFormSubmit}>
              <div className="form-group">
                <label>Student Enrollment ID:</label>
                <input
                  type="text"
                  name="enrollment_id"
                  value={submissionData.enrollment_id}
                  onChange={handleSubmissionInputChange}
                  required
                />
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={() => setShowSubmissionForm(false)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Mark as Submitted'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {showDeadlineForm && (
        <div className="modal-overlay">
          <div className="submission-form-modal">
            <h3><FaCalendarAlt className="form-icon" /> Extend Project Deadline</h3>
            <form onSubmit={handleDeadlineFormSubmit}>
              <div className="form-group">
                <label>New Deadline:</label>
                <input
                  type="date"
                  name="new_deadline"
                  value={deadlineData.new_deadline}
                  onChange={handleDeadlineInputChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={() => setShowDeadlineForm(false)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Extend Deadline'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {showEditForm && (
        <div className="modal-overlay">
          <div className="edit-form-modal">
            <h3><FaEdit className="form-icon" /> Edit Project Details</h3>
            <form onSubmit={handleEditFormSubmit}>
              <div className="form-group">
                <label>Title:</label>
                <input
                  type="text"
                  name="title"
                  value={editProjectData.title}
                  onChange={handleEditInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Description:</label>
                <textarea
                  name="description"
                  value={editProjectData.description}
                  onChange={handleEditInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Difficulty:</label>
                <select
                  name="difficulty"
                  value={editProjectData.difficulty}
                  onChange={handleEditInputChange}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              
              <div className="form-group">
                <label><FaTags /> Technologies:</label>
                <div className="technologies-container">
                  {technologies.map(tech => (
                    <div key={tech} className="technology-checkbox">
                      <input
                        type="checkbox"
                        id={`edit-tech-${tech}`}
                        checked={editProjectData.technologies.includes(tech)}
                        onChange={() => handleEditTechnologyChange(tech)}
                      />
                      <label htmlFor={`edit-tech-${tech}`}>{tech}</label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="form-group">
                <label>Status:</label>
                <select
                  name="status"
                  value={editProjectData.status}
                  onChange={handleEditInputChange}
                >
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={() => setShowEditForm(false)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <div className="projects-list">
        <h3><FaCode className="section-icon" /> Projects ({filteredProjects.length})</h3>
        
        {loading && projects.length === 0 ? (
          <div className="loading">Loading projects...</div>
        ) : filteredProjects.length === 0 ? (
          <p>No projects found matching your filters.</p>
        ) : (
          <table className="projects-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Batch</th>
                <th>Students</th>
                <th>Technologies</th>
                <th>Difficulty</th>
                <th>Deadline</th>
                <th>Submissions</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map(project => (
                <tr key={project.id}>
                  <td>{project.title}</td>
                  <td>{project.batch_name}</td>
                  <td>
                    <div className="student-count">
                      <FaUsers className="icon" />
                      {batchStudentCounts[project.batch_id] || 0}
                    </div>
                  </td>
                  <td>
                    <div className="tech-tags">
                      {project.technologies && project.technologies.map(tech => (
                        <span key={tech} className="tech-tag">{tech}</span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className={`difficulty ${project.difficulty}`}>
                      {project.difficulty}
                    </span>
                  </td>
                  <td>
                    <div className="deadline-container">
                      <FaCalendarAlt className="icon" />
                      {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No deadline'}
                    </div>
                  </td>
                  <td>{project.submission_count || 0}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        onClick={() => viewSubmissions(project.id)}
                        className="view-btn"
                        title="View Submissions"
                      >
                        <FaCode /> View
                      </button>
                      <button 
                        onClick={() => handleMarkSubmitted(project.id)}
                        className="mark-btn"
                        title="Mark as Submitted"
                      >
                        Mark
                      </button>
                      <button 
                        onClick={() => handleExtendDeadline(project.id, project.deadline)}
                        className="extend-btn"
                        title="Extend Deadline"
                      >
                        <FaCalendarAlt /> Extend
                      </button>
                      <button 
                        onClick={() => handleEditProject(project)}
                        className="edit-btn"
                        title="Edit Project"
                      >
                        <FaEdit /> Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ProjectManagement;