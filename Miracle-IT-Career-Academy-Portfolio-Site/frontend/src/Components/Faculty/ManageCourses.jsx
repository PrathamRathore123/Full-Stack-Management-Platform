import React, { useState, useEffect } from 'react';
import { userAxiosInstance } from '../../api';
import { Link } from 'react-router-dom';
import './ManageCourses.css';
import { FaEdit, FaBook, FaPlus, FaUsers, FaEye, FaArrowLeft, FaLayerGroup } from 'react-icons/fa';
import CourseBatchCreation from './CourseBatchCreation';
import ViewBatches from './ViewBatches';
import AddCourse from '../Admin/AddCourse';

const FacultyManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [syllabus, setSyllabus] = useState([]);
  const [editingSyllabus, setEditingSyllabus] = useState(null);
  const [editingSyllabusItem, setEditingSyllabusItem] = useState(null);
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
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showViewBatches, setShowViewBatches] = useState(false);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
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

  const handleEditSyllabus = (module) => {
    setSyllabusFormData({
      title: module.title,
      order: module.order
    });
    setEditingSyllabus(module);
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

  const handleEditSyllabusItem = (item) => {
    setSyllabusItemFormData({
      title: item.title,
      description: item.description || '',
      order: item.order,
      module_id: item.module
    });
    setEditingSyllabusItem(item);
  };
  
  const handleCreateBatch = (course) => {
    setSelectedCourseForBatch(course);
    setShowBatchModal(true);
  };
  
  const handleViewBatches = (course) => {
    setSelectedCourseForBatch(course);
    setShowViewBatches(true);
  };
  
  const handleBatchCreationSuccess = () => {
    // Refresh course data if needed
    fetchCourses();
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading courses...</div>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="manage-courses-container">
      <h1>Manage Course Content</h1>
      <div className="page-description">
        Organize your courses, create batches, and manage syllabus content
      </div>
      
      {showBatchModal && (
        <CourseBatchCreation 
          onClose={() => setShowBatchModal(false)}
          onSuccess={handleBatchCreationSuccess}
          courseId={selectedCourseForBatch?.id}
          courseName={selectedCourseForBatch?.title}
        />
      )}
      
      {showViewBatches && (
        <ViewBatches
          onClose={() => setShowViewBatches(false)}
          courseId={selectedCourseForBatch?.id}
          courseName={selectedCourseForBatch?.title}
        />
      )}
      
      {showAddCourseModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-modal" onClick={() => setShowAddCourseModal(false)}>×</button>
            <AddCourse />
          </div>
        </div>
      )}

      {!selectedCourse ? (
        <div className="courses-list">
          <div className="courses-header">
            <h2>Available Courses</h2>
            <button onClick={() => setShowAddCourseModal(true)} className="add-course-btn">
              <FaPlus /> Add New Course
            </button>
          </div>
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
                    <Link 
                      to={`/faculty/courses/${course.id}/syllabus`}
                      className="action-btn syllabus-btn"
                      title="Edit Syllabus"
                    >
                      <FaBook />
                    </Link>
                    <button 
                      className="action-btn batch-btn"
                      onClick={() => handleCreateBatch(course)}
                      title="Create Batch"
                    >
                      <FaPlus />
                    </button>
                    <button 
                      className="action-btn view-btn"
                      onClick={() => handleViewBatches(course)}
                      title="View Batches"
                    >
                      <FaUsers />
                    </button>
                    <button 
                      className="action-btn syllabus-btn"
                      onClick={() => handleCourseSelect(course)}
                      title="Manage Syllabus"
                    >
                      <FaEdit />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="syllabus-management">
          <div className="syllabus-header">
            <h2>Update Syllabus: {selectedCourse.title}</h2>
            <button
              className="back-btn"
              onClick={() => {
                setSelectedCourse(null);
                setActiveTab('courses');
              }}
            >
              <FaArrowLeft /> Back to Courses
            </button>
          </div>

          <div className="tabs">
            <button
              className={`tab ${activeTab === 'syllabus' ? 'active' : ''}`}
              onClick={() => setActiveTab('syllabus')}
            >
              <FaBook className="tab-icon" /> Syllabus Modules
            </button>
            <button
              className={`tab ${activeTab === 'items' ? 'active' : ''}`}
              onClick={() => setActiveTab('items')}
            >
              <FaLayerGroup className="tab-icon" /> Module Items
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
                              className="action-btn edit-btn"
                              onClick={() => handleEditSyllabus(module)}
                              title="Edit Module"
                            >
                              <FaEdit />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No syllabus modules found for this course.</p>
                )}
              </div>

              {editingSyllabus && (
                <div className="syllabus-form">
                  <h3>Edit Module</h3>
                  <form onSubmit={handleUpdateSyllabus}>
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
                        Update Module
                      </button>
                      <button
                        type="button"
                        className="cancel-btn"
                        onClick={() => {
                          setEditingSyllabus(null);
                          setSyllabusFormData({
                            title: '',
                            order: 1
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

          {activeTab === 'items' && (
            <>
              <div className="module-items">
                <h3>Module Items</h3>
                {syllabus.map((module) => (
                  <div className="module-section" key={module.id}>
                    <h4>
                      Module {module.order}: {module.title}
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

              {editingSyllabusItem && (
                <div className="item-form">
                  <h3>Edit Item</h3>
                  <form onSubmit={handleUpdateSyllabusItem}>
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
                        Update Item
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

export default FacultyManageCourses;