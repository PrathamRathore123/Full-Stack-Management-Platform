import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  fetchCourseById, 
  fetchCourseSyllabus, 
  createCourseSyllabus, 
  updateCourseSyllabus,
  createSyllabusItem,
  updateSyllabusItem
} from '../../api';
import './SyllabusEditor.css';
import { FaPlus, FaTrash, FaArrowUp, FaArrowDown, FaSave } from 'react-icons/fa';

const SyllabusEditor = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [syllabus, setSyllabus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCourseAndSyllabus = async () => {
      try {
        setLoading(true);
        const courseData = await fetchCourseById(courseId);
        setCourse(courseData);
        
        const syllabusData = await fetchCourseSyllabus(courseId);
        setSyllabus(syllabusData.length > 0 ? syllabusData : [createEmptyModule()]);
        
        setLoading(false);
      } catch (err) {
        setError('Failed to load course data. Please try again.');
        setLoading(false);
        console.error('Error loading course data:', err);
      }
    };
    
    loadCourseAndSyllabus();
  }, [courseId]);

  const createEmptyModule = () => ({
    id: `temp-${Date.now()}`,
    title: 'New Module',
    order: syllabus.length + 1,
    items: [],
    isNew: true
  });

  const createEmptyItem = (moduleIndex) => ({
    id: `temp-item-${Date.now()}`,
    title: 'New Item',
    description: '',
    order: syllabus[moduleIndex].items.length + 1,
    isNew: true
  });

  const handleAddModule = () => {
    setSyllabus([...syllabus, createEmptyModule()]);
  };

  const handleAddItem = (moduleIndex) => {
    const updatedSyllabus = [...syllabus];
    updatedSyllabus[moduleIndex].items.push(createEmptyItem(moduleIndex));
    setSyllabus(updatedSyllabus);
  };

  const handleModuleChange = (index, field, value) => {
    const updatedSyllabus = [...syllabus];
    updatedSyllabus[index][field] = value;
    setSyllabus(updatedSyllabus);
  };

  const handleItemChange = (moduleIndex, itemIndex, field, value) => {
    const updatedSyllabus = [...syllabus];
    updatedSyllabus[moduleIndex].items[itemIndex][field] = value;
    setSyllabus(updatedSyllabus);
  };

  const handleDeleteModule = (index) => {
    if (window.confirm('Are you sure you want to delete this module?')) {
      const updatedSyllabus = syllabus.filter((_, i) => i !== index);
      // Update order numbers
      updatedSyllabus.forEach((module, i) => {
        module.order = i + 1;
      });
      setSyllabus(updatedSyllabus);
    }
  };

  const handleDeleteItem = (moduleIndex, itemIndex) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      const updatedSyllabus = [...syllabus];
      updatedSyllabus[moduleIndex].items = updatedSyllabus[moduleIndex].items.filter((_, i) => i !== itemIndex);
      // Update order numbers
      updatedSyllabus[moduleIndex].items.forEach((item, i) => {
        item.order = i + 1;
      });
      setSyllabus(updatedSyllabus);
    }
  };

  const handleMoveModule = (index, direction) => {
    if ((direction === -1 && index === 0) || (direction === 1 && index === syllabus.length - 1)) {
      return;
    }
    
    const updatedSyllabus = [...syllabus];
    const temp = updatedSyllabus[index];
    updatedSyllabus[index] = updatedSyllabus[index + direction];
    updatedSyllabus[index + direction] = temp;
    
    // Update order numbers
    updatedSyllabus.forEach((module, i) => {
      module.order = i + 1;
    });
    
    setSyllabus(updatedSyllabus);
  };

  const handleMoveItem = (moduleIndex, itemIndex, direction) => {
    const items = syllabus[moduleIndex].items;
    if ((direction === -1 && itemIndex === 0) || (direction === 1 && itemIndex === items.length - 1)) {
      return;
    }
    
    const updatedSyllabus = [...syllabus];
    const temp = updatedSyllabus[moduleIndex].items[itemIndex];
    updatedSyllabus[moduleIndex].items[itemIndex] = updatedSyllabus[moduleIndex].items[itemIndex + direction];
    updatedSyllabus[moduleIndex].items[itemIndex + direction] = temp;
    
    // Update order numbers
    updatedSyllabus[moduleIndex].items.forEach((item, i) => {
      item.order = i + 1;
    });
    
    setSyllabus(updatedSyllabus);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      console.log('Starting syllabus save process...');
      
      // Process each module
      for (const module of syllabus) {
        let moduleId = module.id;
        
        // Create or update module
        if (module.isNew) {
          const moduleData = { 
            title: module.title, 
            order: module.order, 
            course: parseInt(courseId) 
          };
          console.log('Creating new module with data:', moduleData);
          const newModule = await createCourseSyllabus(moduleData);
          console.log('New module created:', newModule);
          moduleId = newModule.id;
        } else {
          const moduleData = { 
            title: module.title, 
            order: module.order,
            course: parseInt(courseId)
          };
          console.log(`Updating module ${module.id} with data:`, moduleData);
          await updateCourseSyllabus(module.id, moduleData);
        }
        
        // Process items for this module
        for (const item of module.items) {
          if (item.isNew) {
            const itemData = { 
              title: item.title, 
              description: item.description || '', 
              order: item.order, 
              module: moduleId 
            };
            console.log('Creating new item with data:', itemData);
            await createSyllabusItem(itemData);
          } else {
            const itemData = { 
              title: item.title, 
              description: item.description || '', 
              order: item.order,
              module: moduleId
            };
            console.log(`Updating item ${item.id} with data:`, itemData);
            await updateSyllabusItem(item.id, itemData);
          }
        }
      }
      
      setSaving(false);
      alert('Syllabus saved successfully!');
      
      // Navigate based on user role
      const userRole = localStorage.getItem('role');
      if (userRole === 'admin') {
        navigate(`/admin/courses`);
      } else if (userRole === 'faculty') {
        navigate(`/faculty/courses`);
      }
    } catch (err) {
      setSaving(false);
      setError('Failed to save syllabus. Please try again.');
      console.error('Error saving syllabus:', err);
      if (err.response) {
        console.error('Error response:', err.response.data);
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading course data...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!course) {
    return <div className="error-message">Course not found</div>;
  }

  return (
    <div className="syllabus-editor">
      <div className="editor-header">
        <h1>Edit Syllabus: {course.title}</h1>
        <button 
          className="save-button"
          onClick={handleSave}
          disabled={saving}
        >
          <FaSave /> {saving ? 'Saving...' : 'Save Syllabus'}
        </button>
      </div>

      <div className="modules-container">
        {syllabus.map((module, moduleIndex) => (
          <div className="module-editor" key={module.id || moduleIndex}>
            <div className="module-header">
              <input
                type="text"
                value={module.title}
                onChange={(e) => handleModuleChange(moduleIndex, 'title', e.target.value)}
                placeholder="Module Title"
                className="module-title-input"
              />
              <div className="module-actions">
                <button 
                  onClick={() => handleMoveModule(moduleIndex, -1)}
                  disabled={moduleIndex === 0}
                  title="Move Up"
                >
                  <FaArrowUp />
                </button>
                <button 
                  onClick={() => handleMoveModule(moduleIndex, 1)}
                  disabled={moduleIndex === syllabus.length - 1}
                  title="Move Down"
                >
                  <FaArrowDown />
                </button>
                <button 
                  onClick={() => handleDeleteModule(moduleIndex)}
                  title="Delete Module"
                  className="delete-button"
                >
                  <FaTrash />
                </button>
              </div>
            </div>

            <div className="items-container">
              {module.items.map((item, itemIndex) => (
                <div className="item-editor" key={item.id || itemIndex}>
                  <div className="item-header">
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => handleItemChange(moduleIndex, itemIndex, 'title', e.target.value)}
                      placeholder="Item Title"
                      className="item-title-input"
                    />
                    <div className="item-actions">
                      <button 
                        onClick={() => handleMoveItem(moduleIndex, itemIndex, -1)}
                        disabled={itemIndex === 0}
                        title="Move Up"
                      >
                        <FaArrowUp />
                      </button>
                      <button 
                        onClick={() => handleMoveItem(moduleIndex, itemIndex, 1)}
                        disabled={itemIndex === module.items.length - 1}
                        title="Move Down"
                      >
                        <FaArrowDown />
                      </button>
                      <button 
                        onClick={() => handleDeleteItem(moduleIndex, itemIndex)}
                        title="Delete Item"
                        className="delete-button"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={item.description || ''}
                    onChange={(e) => handleItemChange(moduleIndex, itemIndex, 'description', e.target.value)}
                    placeholder="Item Description"
                    className="item-description-input"
                    rows={3}
                  />
                </div>
              ))}
              <button 
                className="add-item-button"
                onClick={() => handleAddItem(moduleIndex)}
              >
                <FaPlus /> Add Item
              </button>
            </div>
          </div>
        ))}
        <button 
          className="add-module-button"
          onClick={handleAddModule}
        >
          <FaPlus /> Add Module
        </button>
      </div>
    </div>
  );
};

export default SyllabusEditor;