import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar-explore';
import Certificates from './Certificates';
import Workshops from './Workshops';
import WorkshopDetails from './WorkshopDetails';
import WorkshopRegistration from './WorkshopRegistration';
import Quizzes from './Quizzes';
import CourseDetail from './CourseDetail';
import CoursesMain from './CoursesMain';
import ExploreIntro from './ExploreIntro';
import CategorySlider from './CategorySlider';
import EnrollmentSteps from './EnrollmentSteps';
import ExploreCertificate from './ExploreCertificate';
import CourseCategories from './CourseCategories';
import './Explore.css';
import './course-container.css';
import { fetchCourses } from '../../api';

// Import Development Hub components
import Mern from './Courses/DevelopmentHub/Mern';
import Python from './Courses/DevelopmentHub/Python';
import Java from './Courses/DevelopmentHub/Java';
import Php from './Courses/DevelopmentHub/Php';
import FullStackWeb from './Courses/DevelopmentHub/FullStackWeb';
import DataStructure from './Courses/DevelopmentHub/DataStructure';

// Import AI & ML Track components
import ArtificialIntelligence from './Courses/AI&MlTrack/ArtificialIntelligence';
import MachineLearning from './Courses/AI&MlTrack/MachineLearning';
import BigData from './Courses/AI&MlTrack/BigData';
import DataScience from './Courses/AI&MlTrack/DataScience';

// Import Cloud Computing components
import CloudComputing from './Courses/Cloud-Computing/CloudComputing';
import ITSecurity from './Courses/Cloud-Computing/ITSecurity';
import DEVOPS from './Courses/Cloud-Computing/DEVOPS';
import Aws from './Courses/Cloud-Computing/Aws';

// Import Job-linked components
import PGDSE from './Courses/Job-linked/PGDSE';
import PGDIE from './Courses/Job-linked/PGDIE';
import PGDFE from './Courses/Job-linked/PGDFE';
import PGDDA from './Courses/Job-linked/PGDDA';
import AIML from './Courses/Job-linked/AIML';

const Explore = () => {
  const location = useLocation();
  const [activeCategory, setActiveCategory] = useState(null);
  
  useEffect(() => {
    // Extract category from URL path
    const path = location.pathname;
    if (path.includes('/courses/')) {
      const category = path.split('/courses/')[1];
      setActiveCategory(category);
    } else {
      setActiveCategory(null);
    }
  }, [location]);

  return (
    <div className="explore-container">
      <div className="sidebar-wrapper">
        <Sidebar />
      </div>
      <div className="explore-content">
        <Routes>
          <Route index element={<CoursesList />} />
          <Route path="certificates" element={<Certificates />} />
          <Route path="workshops" element={<Workshops />} />
          <Route path="workshops/:id" element={<WorkshopDetails />} />
          <Route path="workshops/:id/register" element={<WorkshopRegistration />} />
          <Route path="quizzes" element={<Quizzes />} />
          <Route path="course/:courseId" element={<CourseDetail />} />
          
          {/* Development Hub routes */}
          <Route path="courses/mern" element={<Mern />} />
          <Route path="courses/python" element={<Python />} />
          <Route path="courses/full-stack-web-development" element={<FullStackWeb />} />
          <Route path="courses/c-cpp-data-structure" element={<DataStructure />} />
          <Route path="courses/java" element={<Java />} />
          <Route path="courses/php" element={<Php />} />
          
          {/* AI and ML Track routes */}
          <Route path="courses/artificial-intelligence" element={<ArtificialIntelligence />} />
          <Route path="courses/machine-learning" element={<MachineLearning />} />
          <Route path="courses/big-data" element={<BigData />} />
          <Route path="courses/data-science" element={<DataScience />} />
          
          {/* Cloud Security routes */}
          <Route path="courses/it-security" element={<ITSecurity />} />
          <Route path="courses/cloud-computing" element={<CloudComputing />} />
          <Route path="courses/devops" element={<DEVOPS />} />
          <Route path="courses/aws-azure" element={<Aws />} />
          
          {/* JOB Linked Program routes */}
          <Route path="courses/pgdse" element={<PGDSE />} />
          <Route path="courses/pgdie" element={<PGDIE />} />
          <Route path="courses/pgdfe" element={<PGDFE />} />
          <Route path="courses/pgdda" element={<PGDDA />} />
          <Route path="courses/aiml-advance-diploma" element={<AIML />} />
          
          {/* Category-based course listing */}
          <Route path="courses/category/:category" element={<CategoryCourses />} />
          
          {/* Fallback for other course routes */}
          <Route path="courses/*" element={<CoursesMain />} />
        </Routes>
      </div>
    </div>
  );
};

// Default component showing list of courses
const CoursesList = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getCourses = async () => {
      try {
        setLoading(true);
        const data = await fetchCourses();
        setCourses(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load courses. Please try again later.');
        setLoading(false);
        console.error('Error fetching courses:', err);
      }
    };

    getCourses();
  }, []);

  if (loading) {
    return <div className="loading">Loading courses...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="courses-list">
      {/* New Intro Section with Animation/Background */}
      <ExploreIntro />
      
      {/* Category Slider */}
      <CategorySlider />
      
      {/* Enrollment Steps with Animation */}
      <EnrollmentSteps />
      
      {/* Certificate Section */}
      <ExploreCertificate />
      
      {/* Categorized Course Cards */}
      <CourseCategories courses={courses} />
    </div>
  );
};

// Component to display courses by category
const CategoryCourses = () => {
  const location = useLocation();
  const category = location.pathname.split('/').pop();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryName, setCategoryName] = useState('');

  useEffect(() => {
    const getCoursesByCategory = async () => {
      try {
        setLoading(true);
        // Get all courses and filter by category
        const data = await fetchCourses();
        
        // Map URL category to backend category field
        let categoryField;
        switch(category) {
          case 'development-hub':
            categoryField = 'development';
            setCategoryName('Development Hub');
            break;
          case 'ai-ml-track':
            categoryField = 'ai_ml';
            setCategoryName('AI & ML Track');
            break;
          case 'cloud-computing':
            categoryField = 'cloud';
            setCategoryName('Cloud Computing');
            break;
          case 'job-linked':
            categoryField = 'job_linked';
            setCategoryName('Job-Linked Programs');
            break;
          default:
            categoryField = category;
            setCategoryName(formatCategoryName(category));
        }
        
        // Filter courses by category
        const filteredCourses = data.filter(course => 
          course.category?.toLowerCase() === categoryField.toLowerCase()
        );
        
        setCourses(filteredCourses);
        setLoading(false);
      } catch (err) {
        setError('Failed to load courses. Please try again later.');
        setLoading(false);
        console.error('Error fetching courses:', err);
      }
    };

    getCoursesByCategory();
  }, [category]);

  if (loading) {
    return <div className="loading">Loading courses...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  // Format the category name for display
  const formatCategoryName = (cat) => {
    return cat.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="courses-list">
      <h2>{categoryName} Courses</h2>
      <div className="courses-grid">
        {courses.length > 0 ? (
          courses.map((course) => (
            <div className="course-card" key={course.id}>
              <div className="course-image">
                <img src={course.image || '/placeholder-course.jpg'} alt={course.title} />
              </div>
              <div className="course-details">
                <h3>{course.title}</h3>
                <p>{course.description?.substring(0, 150)}...</p>
                <div className="course-meta">
                  <span>{course.duration}</span>
                  <span>{course.level}</span>
                </div>
                <Link to={`/explore/course/${course.id}`} className="enroll-btn">View Course</Link>
              </div>
            </div>
          ))
        ) : (
          <p>No courses available in this category at the moment.</p>
        )}
      </div>
    </div>
  );
};

export default Explore;