import React, { useState, useEffect } from 'react';
import CourseTemplate from '../../CourseTemplate';
import { FaPython, FaDatabase, FaChartBar, FaRobot, FaCode, FaServer } from 'react-icons/fa';
import { fetchCourseSyllabus, fetchCourseById } from '../../../../api';

const Python = () => {
  const [syllabus, setSyllabus] = useState([]);
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourseData = async () => {
      try {
        setLoading(true);
        // Python course ID - update this with the actual ID from your database
        const courseId = 2; 
        
        // Fetch both course details and syllabus in parallel
        const [course, syllabusData] = await Promise.all([
          fetchCourseById(courseId),
          fetchCourseSyllabus(courseId)
        ]);
        
        setCourseData(course);
        setSyllabus(syllabusData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading course data:', error);
        setLoading(false);
      }
    };

    loadCourseData();
  }, []);

  const technologies = [
    {
      name: 'Python',
      icon: <FaPython />,
      description: 'Core Python programming language'
    },
    {
      name: 'Data Analysis',
      icon: <FaChartBar />,
      description: 'Data analysis with NumPy and Pandas'
    },
    {
      name: 'Web Development',
      icon: <FaCode />,
      description: 'Web development with Django and Flask'
    },
    {
      name: 'Database',
      icon: <FaDatabase />,
      description: 'Database integration with SQLAlchemy'
    },
    {
      name: 'API Development',
      icon: <FaServer />,
      description: 'RESTful API development'
    },
    {
      name: 'Machine Learning',
      icon: <FaRobot />,
      description: 'Introduction to ML with scikit-learn'
    }
  ];

  const learningOutcomes = [
    'Master Python programming fundamentals and advanced concepts',
    'Build web applications using Django and Flask frameworks',
    'Perform data analysis and visualization with Python libraries',
    'Develop RESTful APIs and integrate with databases',
    'Implement automation scripts for various tasks',
    'Create machine learning models with scikit-learn',
    'Understand object-oriented programming in Python',
    'Deploy Python applications to production environments'
  ];

  if (loading) {
    return <div className="loading">Loading course data...</div>;
  }

  return (
    <CourseTemplate
      title={courseData?.title || "Python Programming"}
      description={courseData?.description || "Loading course description..."}
      duration={courseData?.duration || "10 Weeks"}
      internshipDuration={courseData?.internship_duration || "4 Weeks"}
      isCertified={courseData?.is_certified || true}
      syllabus={syllabus}
      technologies={technologies}
      learningOutcomes={learningOutcomes}
      placementAssistance={true}
      courseId={courseData?.id || 2}
    />
  );
};

export default Python;