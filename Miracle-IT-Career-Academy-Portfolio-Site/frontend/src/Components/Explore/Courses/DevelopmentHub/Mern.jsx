import React, { useState, useEffect } from 'react';
import CourseTemplate from '../../CourseTemplate';
import { FaReact, FaNodeJs, FaDatabase, FaServer } from 'react-icons/fa';
import { SiExpress, SiMongodb } from 'react-icons/si';
import { fetchCourseSyllabus, fetchCourseById } from '../../../../api';

const Mern = () => {
  const [syllabus, setSyllabus] = useState([]);
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourseData = async () => {
      try {
        setLoading(true);
        // MERN course ID - update this with the actual ID from your database
        const courseId = 1; 
        
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
      name: 'MongoDB',
      icon: <SiMongodb />,
      description: 'NoSQL database for modern applications'
    },
    {
      name: 'Express.js',
      icon: <SiExpress />,
      description: 'Web application framework for Node.js'
    },
    {
      name: 'React',
      icon: <FaReact />,
      description: 'JavaScript library for building user interfaces'
    },
    {
      name: 'Node.js',
      icon: <FaNodeJs />,
      description: 'JavaScript runtime built on Chromes V8 engine'
    },
    {
      name: 'RESTful APIs',
      icon: <FaServer />,
      description: 'Design and implement backend services'
    },
    {
      name: 'Database Design',
      icon: <FaDatabase />,
      description: 'Schema design and data modeling'
    }
  ];

  const learningOutcomes = [
    'Build full-stack web applications using the MERN stack',
    'Design and implement RESTful APIs with Express.js',
    'Create dynamic and responsive user interfaces with React',
    'Implement authentication and authorization using JWT',
    'Work with MongoDB for data storage and retrieval',
    'Deploy applications to cloud platforms like Heroku and Netlify',
    'Implement real-time features with Socket.io',
    'Develop a professional portfolio with real-world projects'
  ];

  if (loading) {
    return <div className="loading">Loading course data...</div>;
  }

  return (
    <CourseTemplate
      title={courseData?.title || "MERN Stack Development"}
      description={courseData?.description || "Loading course description..."}
      duration={courseData?.duration || "12 Weeks"}
      internshipDuration={courseData?.internship_duration || "4 Weeks"}
      isCertified={courseData?.is_certified || true}
      syllabus={syllabus}
      technologies={technologies}
      learningOutcomes={learningOutcomes}
      placementAssistance={true}
      courseId={courseData?.id || 1}
    />
  );
};



export default Mern;