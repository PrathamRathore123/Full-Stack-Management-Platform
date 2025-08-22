import React, { useState, useEffect } from 'react';
import CourseTemplate from '../../CourseTemplate';
import { fetchCourseById, fetchCourseSyllabus } from '../../../../api';

const FullStackWeb = () => {
  const [syllabus, setSyllabus] = useState([]);
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourseData = async () => {
      try {
        setLoading(true);
        const courseId = 6; // Update with actual course ID for FullStackWeb
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
      title={courseData?.title || "Full Stack Web Development"}
      description={courseData?.description || "Loading course description..."}
      duration={courseData?.duration || "12 Weeks"}
      internshipDuration={courseData?.internship_duration || "4 Weeks"}
      isCertified={courseData?.is_certified || true}
      syllabus={syllabus}
      technologies={[]}
      learningOutcomes={[]}
      placementAssistance={true}
      courseId={courseData?.id || 6}
    />
  );
};

export default FullStackWeb;
