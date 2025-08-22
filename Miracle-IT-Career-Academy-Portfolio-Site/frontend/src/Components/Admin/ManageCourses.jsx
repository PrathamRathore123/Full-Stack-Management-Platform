import React, { useState, useEffect } from 'react';
import { userAxiosInstance } from '../../api';
import './ManageCourses.css';
import { FaPlus, FaEdit, FaTrash, FaBook, FaUsers } from 'react-icons/fa';
import CourseBatchCreation from '../Faculty/CourseBatchCreation';

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [syllabus, setSyllabus] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    duration: '',
    level: '',
    internship_duration: '',
    is_certified: false
  });
  const [syllabusFormData, setSyllabusFormData] = useState({
    title: '',
    order: 1
  });
  const [syllabusItemFormData, setSyllabusItemFormData] = useState({
    title: '',
    description: '',
    order: 1,
    module_id: null
  });
  const [activeTab, setActiveTab] = useState('courses');
  const [editingSyllabus, setEditingSyllabus] = useState(null);
  const [editingSyllabusItem, setEditingSyllabusItem] = useState(null);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [selectedCourseForBatch, setSelectedCourseForBatch] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await userAxiosInstance.get('courses/courses/');
      setCourses(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load courses');
      setLoading(false);
      console.error('Error fetching courses:', err);
    }
  };

  const fetchSyllabus = async (courseId) => {
    try {
      const response = await userAxiosInstance.get(`courses/syllabus/?course_id=${courseId}`);
      setSyllabus(response.data);
    } catch (err) {
      console.error('Error fetching syllabus:', err);
    }
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    fetchSyllabus(course.id);
    setActiveTab('syllabus');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSyllabusInputChange = (e) => {
    const { name, value } = e.target;
    setSyllabusFormData({
      ...syllabusFormData,
      [name]: value
    });
  };

  const handleSyllabusItemInputChange = (e) => {
    const { name, value } = e.target;
    setSyllabusItemFormData({
      ...syllabusItemFormData,
      [name]: value
    });
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      await userAxiosInstance.post('courses/courses/', formData);
      fetchCourses();
      setFormData({
        title: '',
        description: '',
        image: '',
        duration: '',
        level: '',
        internship_duration: '',
        is_certified: false
      });
    } catch (err) {
      console.error('Error creating course:', err);
    }
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    try {
      await userAxiosInstance.put(`courses/courses/${selectedCourse.id}/`, formData);
      fetchCourses();
      setIsEditing(false);
      setSelectedCourse(null);
    } catch (err) {
      console.error('Error updating course:', err);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await userAxiosInstance.delete(`courses/courses/${courseId}/`);
        fetchCourses();
        if (selectedCourse && selectedCourse.id === courseId) {
          setSelectedCourse(null);
        }
      } catch (err) {
        console.error('Error deleting course:', err);
      }
    }
  };

  const handleEditCourse = (course) => {
    setFormData({
      title: course.title,
      description: course.description,
      image: course.image,
      duration: course.duration,
      level: course.level,
      internship_duration: course.internship_duration || '',
      is_certified: course.is_certified
    });
    setIsEditing(true);
    setSelectedCourse(course);
  };

  const handleCreateSyllabus = async (e) => {
    e.preventDefault();
    try {
      await userAxiosInstance.post('courses/syllabus/', {
        ...syllabusFormData,
        course: selectedCourse.id
      });
      fetchSyllabus(selectedCourse.id);
      setSyllabusFormData({
        title: '',
        order: syllabus.length + 1
      });
    } catch (err) {
      console.error('Error creating syllabus module:', err);
    }
  };

  const handleUpdateSyllabus = async (e) => {
    e.preventDefault();
    try {
      await userAxiosInstance.put(`courses/syllabus/${editingSyllabus.id}/`, {
        ...syllabusFormData,
        course: selectedCourse.id
      });
      fetchSyllabus(selectedCourse.id);
      setEditingSyllabus(null);
      setSyllabusFormData({
        title: '',
        order: 1
      });
    } catch (err) {
      console.error('Error updating syllabus module:', err);
    }
  };

  const handleDeleteSyllabus = async (syllabusId) => {
    if (window.confirm('Are you sure you want to delete this module?')) {
      try {
        await userAxiosInstance.delete(`courses/syllabus/${syllabusId}/`);
        fetchSyllabus(selectedCourse.id);
      } catch (err) {
        console.error('Error deleting syllabus module:', err);
      }
    }
  };

  const handleEditSyllabus = (module) => {
    setSyllabusFormData({
      title: module.title,
      order: module.order
    });
    setEditingSyllabus(module);
  };

  const handleCreateSyllabusItem = async (e) => {
    e.preventDefault();
    try {
      await userAxiosInstance.post('courses/syllabus-items/', {
        ...syllabusItemFormData,
        module: syllabusItemFormData.module_id
      });
      fetchSyllabus(selectedCourse.id);
      setSyllabusItemFormData({
        title: '',
        description: '',
        order: 1,
        module_id: syllabusItemFormData.module_id
      });
    } catch (err) {
      console.error('Error creating syllabus item:', err);
    }
  };

  const handleUpdateSyllabusItem = async (e) => {
    e.preventDefault();
    try {
      await userAxiosInstance.put(`courses/syllabus-items/${editingSyllabusItem.id}/`, {
        title: syllabusItemFormData.title,
        description: syllabusItemFormData.description,
        order: syllabusItemFormData.order,
        module: editingSyllabusItem.module
      });
      fetchSyllabus(selectedCourse.id);
      setEditingSyllabusItem(null);
      setSyllabusItemFormData({
        title: '',
        description: '',
        order: 1,
        module_id: null
      });
    } catch (err) {
      console.error('Error updating syllabus item:', err);
    }
  };

  const handleDeleteSyllabusItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await userAxiosInstance.delete(`courses/syllabus-items/${itemId}/`);
        fetchSyllabus(selectedCourse.id);
      } catch (err) {
        console.error('Error deleting syllabus item:', err);
      }
    }
  };

  const handleEditSyllabusItem = (item) => {
    setSyllabusItemFormData({
      title: item.title,
      description: item.description || '',
      order: item.order,
      module_id: item.module
    });
    setEditingSyllabusItem(item);
  };

  const handleAddSyllabusItem = (moduleId) => {
    setSyllabusItemFormData({
      ...syllabusItemFormData,
      module_id: moduleId
    });
  };
  
  const handleCreateBatch = (course) => {
    setSelectedCourseForBatch(course);
    setShowBatchModal(true);
  };
  
  const handleBatchCreationSuccess = () => {
    // Refresh course data if needed
    fetchCourses();
    // Optionally, refresh batches if needed here or notify CreateStudent component
  };

  if (loading) {
    return <div className="loading">Loading courses...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="manage-courses-container">
      <h1>Manage Courses</h1>
      
      {showBatchModal && (
        <CourseBatchCreation 
          onClose={() => setShowBatchModal(false)}
          onSuccess={handleBatchCreationSuccess}
          courseId={selectedCourseForBatch?.id}
          courseName={selectedCourseForBatch?.title}
        />
      )}

      {!selectedCourse ? (
        <>
          <div className="courses-list">
            <h2>All Courses</h2>
            <table className="courses-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Level</th>
                  <th>Duration</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td>{course.title}</td>
                    <td>{course.level}</td>
                    <td>{course.duration}</td>
                    <td className="actions">
                      <button 
                        className="action-btn syllabus-btn"
                        onClick={() => handleCourseSelect(course)}
                        title="Manage Syllabus"
                      >
                        <FaBook />
                      </button>
                      <button 
                        className="action-btn batch-btn"
                        onClick={() => handleCreateBatch(course)}
                        title="Create Batch"
                      >
                        <FaUsers />
                      </button>
                      <button 
                        className="action-btn edit-btn"
                        onClick={() => handleEditCourse(course)}
                        title="Edit Course"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteCourse(course.id)}
                        title="Delete Course"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="course-form-container">
            <h2>{isEditing ? 'Edit Course' : 'Add New Course'}</h2>
            <form onSubmit={isEditing ? handleUpdateCourse : handleCreateCourse}>
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="image">Image URL</label>
                <input
                  type="url"
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="duration">Duration</label>
                  <input
                    type="text"
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="level">Level</label>
                  <select
                    id="level"
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Level</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="internship_duration">Internship Duration</label>
                  <input
                    type="text"
                    id="internship_duration"
                    name="internship_duration"
                    value={formData.internship_duration}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="is_certified"
                      checked={formData.is_certified}
                      onChange={handleInputChange}
                    />
                    Certified Course
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  {isEditing ? 'Update Course' : 'Add Course'}
                </button>
                {isEditing && (
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        title: '',
                        description: '',
                        image: '',
                        duration: '',
                        level: '',
                        internship_duration: '',
                        is_certified: false
                      });
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </>
      ) : (
        <div className="syllabus-management">
          <div className="syllabus-header">
            <h2>Manage Syllabus: {selectedCourse.title}</h2>
            <button
              className="back-btn"
              onClick={() => {
                setSelectedCourse(null);
                setActiveTab('courses');
              }}
            >
              Back to Courses
            </button>
          </div>

          <div className="tabs">
            <button
              className={`tab ${activeTab === 'syllabus' ? 'active' : ''}`}
              onClick={() => setActiveTab('syllabus')}
            >
              Syllabus Modules
            </button>
            <button
              className={`tab ${activeTab === 'items' ? 'active' : ''}`}
              onClick={() => setActiveTab('items')}
            >
              Module Items
            </button>
          </div>

          {activeTab === 'syllabus' && (
            <>
              <div className="syllabus-list">
                <h3>Syllabus Modules</h3>
                {syllabus.length > 0 ? (
                  <table className="syllabus-table">
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Title</th>
                        <th>Last Updated</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {syllabus.map((module) => (
                        <tr key={module.id}>
                          <td>{module.order}</td>
                          <td>{module.title}</td>
                          <td>{new Date(module.last_updated).toLocaleDateString()}</td>
                          <td className="actions">
                            <button
                              className="action-btn add-item-btn"
                              onClick={() => {
                                handleAddSyllabusItem(module.id);
                                setActiveTab('items');
                              }}
                              title="Add Items"
                            >
                              <FaPlus />
                            </button>
                            <button
                              className="action-btn edit-btn"
                              onClick={() => handleEditSyllabus(module)}
                              title="Edit Module"
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="action-btn delete-btn"
                              onClick={() => handleDeleteSyllabus(module.id)}
                              title="Delete Module"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No syllabus modules found. Add your first module below.</p>
                )}
              </div>

              <div className="syllabus-form">
                <h3>{editingSyllabus ? 'Edit Module' : 'Add New Module'}</h3>
                <form onSubmit={editingSyllabus ? handleUpdateSyllabus : handleCreateSyllabus}>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="module-title">Module Title</label>
                      <input
                        type="text"
                        id="module-title"
                        name="title"
                        value={syllabusFormData.title}
                        onChange={handleSyllabusInputChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="module-order">Order</label>
                      <input
                        type="number"
                        id="module-order"
                        name="order"
                        min="1"
                        value={syllabusFormData.order}
                        onChange={handleSyllabusInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="submit-btn">
                      {editingSyllabus ? 'Update Module' : 'Add Module'}
                    </button>
                    {editingSyllabus && (
                      <button
                        type="button"
                        className="cancel-btn"
                        onClick={() => {
                          setEditingSyllabus(null);
                          setSyllabusFormData({
                            title: '',
                            order: syllabus.length + 1
                          });
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </>
          )}

          {activeTab === 'items' && (
            <>
              <div className="module-items">
                <h3>Module Items</h3>
                {syllabus.map((module) => (
                  <div className="module-section" key={module.id}>
                    <h4>
                      Module {module.order}: {module.title}
                      <button
                        className="add-item-btn small"
                        onClick={() => handleAddSyllabusItem(module.id)}
                        title="Add Item to this Module"
                      >
                        <FaPlus />
                      </button>
                    </h4>
                    {module.items.length > 0 ? (
                      <table className="items-table">
                        <thead>
                          <tr>
                            <th>Order</th>
                            <th>Title</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {module.items.map((item) => (
                            <tr key={item.id}>
                              <td>{item.order}</td>
                              <td>{item.title}</td>
                              <td className="actions">
                                <button
                                  className="action-btn edit-btn"
                                  onClick={() => handleEditSyllabusItem(item)}
                                  title="Edit Item"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  className="action-btn delete-btn"
                                  onClick={() => handleDeleteSyllabusItem(item.id)}
                                  title="Delete Item"
                                >
                                  <FaTrash />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="no-items">No items in this module</p>
                    )}
                  </div>
                ))}
              </div>

              {syllabusItemFormData.module_id && (
                <div className="item-form">
                  <h3>{editingSyllabusItem ? 'Edit Item' : 'Add New Item'}</h3>
                  <form onSubmit={editingSyllabusItem ? handleUpdateSyllabusItem : handleCreateSyllabusItem}>
                    <div className="form-group">
                      <label htmlFor="item-title">Item Title</label>
                      <input
                        type="text"
                        id="item-title"
                        name="title"
                        value={syllabusItemFormData.title}
                        onChange={handleSyllabusItemInputChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="item-description">Description (Optional)</label>
                      <textarea
                        id="item-description"
                        name="description"
                        value={syllabusItemFormData.description}
                        onChange={handleSyllabusItemInputChange}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="item-order">Order</label>
                      <input
                        type="number"
                        id="item-order"
                        name="order"
                        min="1"
                        value={syllabusItemFormData.order}
                        onChange={handleSyllabusItemInputChange}
                        required
                      />
                    </div>

                    <div className="form-actions">
                      <button type="submit" className="submit-btn">
                        {editingSyllabusItem ? 'Update Item' : 'Add Item'}
                      </button>
                      <button
                        type="button"
                        className="cancel-btn"
                        onClick={() => {
                          setEditingSyllabusItem(null);
                          setSyllabusItemFormData({
                            title: '',
                            description: '',
                            order: 1,
                            module_id: null
                          });
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ManageCourses;