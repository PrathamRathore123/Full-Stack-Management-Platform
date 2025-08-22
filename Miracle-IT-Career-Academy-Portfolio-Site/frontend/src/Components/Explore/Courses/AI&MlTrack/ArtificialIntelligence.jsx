import React, { useState, useEffect } from 'react';
import CourseTemplate from '../../CourseTemplate';
import { FaRobot, FaBrain, FaCode, FaChartBar, FaDatabase, FaCogs } from 'react-icons/fa';
import { fetchCourseSyllabus, fetchCourseById } from '../../../../api';

const ArtificialIntelligence = () => {
  const [syllabus, setSyllabus] = useState([]);
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourseData = async () => {
      try {
        setLoading(true);
        // AI course ID - update this with the actual ID from your database
        const courseId = 3; 
        
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
      name: 'Neural Networks',
      icon: <FaBrain />,
      description: 'Deep learning and neural network architectures'
    },
    {
      name: 'Python for AI',
      icon: <FaCode />,
      description: 'Python programming for AI applications'
    },
    {
      name: 'Data Analysis',
      icon: <FaChartBar />,
      description: 'Data processing and analysis techniques'
    },
    {
      name: 'Big Data',
      icon: <FaDatabase />,
      description: 'Working with large datasets'
    },
    {
      name: 'AI Algorithms',
      icon: <FaCogs />,
      description: 'Core AI algorithms and techniques'
    },
    {
      name: 'AI Applications',
      icon: <FaRobot />,
      description: 'Practical AI applications in industry'
    }
  ];

  const learningOutcomes = [
    'Understand core AI concepts and algorithms',
    'Build and train neural networks using TensorFlow and PyTorch',
    'Implement natural language processing applications',
    'Develop computer vision systems',
    'Create intelligent agents and expert systems',
    'Apply AI techniques to solve real-world problems',
    'Understand ethical considerations in AI development',
    'Deploy AI models to production environments'
  ];

  if (loading) {
    return <div className="loading">Loading course data...</div>;
  }

  return (
    <CourseTemplate
      title={courseData?.title || "Artificial Intelligence"}
      description={courseData?.description || "Loading course description..."}
      duration={courseData?.duration || "16 Weeks"}
      internshipDuration={courseData?.internship_duration || "8 Weeks"}
      isCertified={courseData?.is_certified || true}
      syllabus={syllabus}
      technologies={technologies}
      learningOutcomes={learningOutcomes}
      placementAssistance={true}
      courseId={courseData?.id || 3}
    />
  );
};

export default ArtificialIntelligence;