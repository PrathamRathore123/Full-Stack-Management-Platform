import React, { useState, useEffect } from 'react';
import CourseTemplate from '../../CourseTemplate';
import { FaCloud, FaServer, FaNetworkWired, FaShieldAlt, FaDatabase, FaCode } from 'react-icons/fa';
import { fetchCourseSyllabus, fetchCourseById } from '../../../../api';

const CloudComputing = () => {
  const [syllabus, setSyllabus] = useState([]);
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourseData = async () => {
      try {
        setLoading(true);
        // Cloud Computing course ID - update this with the actual ID from your database
        const courseId = 4; 
        
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
      name: 'AWS',
      icon: <FaCloud />,
      description: 'Amazon Web Services cloud platform'
    },
    {
      name: 'Azure',
      icon: <FaCloud />,
      description: 'Microsoft Azure cloud services'
    },
    {
      name: 'Virtualization',
      icon: <FaServer />,
      description: 'Server virtualization technologies'
    },
    {
      name: 'Networking',
      icon: <FaNetworkWired />,
      description: 'Cloud networking and infrastructure'
    },
    {
      name: 'Security',
      icon: <FaShieldAlt />,
      description: 'Cloud security best practices'
    },
    {
      name: 'Database',
      icon: <FaDatabase />,
      description: 'Cloud database solutions'
    }
  ];

  const learningOutcomes = [
    'Design and implement cloud infrastructure solutions',
    'Deploy applications to major cloud platforms (AWS, Azure, GCP)',
    'Implement cloud security best practices',
    'Manage cloud resources and optimize costs',
    'Set up cloud networking and connectivity',
    'Implement cloud storage and database solutions',
    'Understand containerization and orchestration with Docker and Kubernetes',
    'Develop cloud-native applications'
  ];

  if (loading) {
    return <div className="loading">Loading course data...</div>;
  }

  return (
    <CourseTemplate
      title={courseData?.title || "Cloud Computing"}
      description={courseData?.description || "Loading course description..."}
      duration={courseData?.duration || "12 Weeks"}
      internshipDuration={courseData?.internship_duration || "6 Weeks"}
      isCertified={courseData?.is_certified || true}
      syllabus={syllabus}
      technologies={technologies}
      learningOutcomes={learningOutcomes}
      placementAssistance={true}
      courseId={courseData?.id || 4}
    />
  );
};

export default CloudComputing;