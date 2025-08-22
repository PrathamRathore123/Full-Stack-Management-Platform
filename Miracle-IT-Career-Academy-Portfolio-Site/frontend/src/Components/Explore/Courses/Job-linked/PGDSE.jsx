import React, { useState, useEffect } from 'react';
import CourseTemplate from '../../CourseTemplate';
import { FaCode, FaDatabase, FaServer, FaChartBar, FaLaptopCode, FaBriefcase } from 'react-icons/fa';
import { fetchCourseSyllabus, fetchCourseById } from '../../../../api';

const PGDSE = () => {
  const [syllabus, setSyllabus] = useState([]);
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourseData = async () => {
      try {
        setLoading(true);
        // PGDSE course ID - update this with the actual ID from your database
        const courseId = 5; 
        
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
      name: 'Full Stack Development',
      icon: <FaCode />,
      description: 'Frontend and backend development'
    },
    {
      name: 'Database Management',
      icon: <FaDatabase />,
      description: 'SQL and NoSQL databases'
    },
    {
      name: 'API Development',
      icon: <FaServer />,
      description: 'RESTful and GraphQL APIs'
    },
    {
      name: 'Data Analytics',
      icon: <FaChartBar />,
      description: 'Data processing and visualization'
    },
    {
      name: 'DevOps',
      icon: <FaLaptopCode />,
      description: 'CI/CD and deployment automation'
    },
    {
      name: 'Industry Projects',
      icon: <FaBriefcase />,
      description: 'Real-world project experience'
    }
  ];

  const learningOutcomes = [
    'Master full-stack software development',
    'Design and implement complex software systems',
    'Develop scalable web applications',
    'Implement database solutions for various use cases',
    'Apply software engineering best practices',
    'Work effectively in agile development teams',
    'Deploy applications to production environments',
    'Gain industry-relevant experience through internship'
  ];

  if (loading) {
    return <div className="loading">Loading course data...</div>;
  }

  return (
    <CourseTemplate
      title={courseData?.title || "Post Graduate Diploma in Software Engineering"}
      description={courseData?.description || "Loading course description..."}
      duration={courseData?.duration || "12 Months"}
      internshipDuration={courseData?.internship_duration || "3 Months"}
      isCertified={courseData?.is_certified || true}
      syllabus={syllabus}
      technologies={technologies}
      learningOutcomes={learningOutcomes}
      placementAssistance={true}
      courseId={courseData?.id || 5}
    />
  );
};

export default PGDSE;
