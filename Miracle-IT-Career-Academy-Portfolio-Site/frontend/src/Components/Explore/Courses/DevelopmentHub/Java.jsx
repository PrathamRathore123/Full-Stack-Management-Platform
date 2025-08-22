import React, { useState, useEffect } from 'react';
import CourseTemplate from '../../CourseTemplate';
import { fetchCourseById, fetchCourseSyllabus } from '../../../../api';

const Java = () => {
  const [syllabus, setSyllabus] = useState([]);
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourseData = async () => {
      try {
        setLoading(true);
        const courseId = 7; // Update with actual course ID for Java
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

  if (loading) {
    return <div className="loading">Loading course data...</div>;
  }

  return (
    <CourseTemplate
      title={courseData?.title || "Java"}
      description={courseData?.description || "Loading course description..."}
      duration={courseData?.duration || "10 Weeks"}
      internshipDuration={courseData?.internship_duration || "3 Weeks"}
      isCertified={courseData?.is_certified || true}
      syllabus={syllabus}
      technologies={[]}
      learningOutcomes={[]}
      placementAssistance={true}
      courseId={courseData?.id || 7}
    />
  );
};

export default Java;
