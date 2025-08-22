import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './CoursesMain.css';

// Import Development Hub components
import Mern from './Courses/DevelopmentHub/Mern';
import FullStackWeb from './Courses/DevelopmentHub/FullStackWeb';
import DataStructure from './Courses/DevelopmentHub/DataStructure';
import Java from './Courses/DevelopmentHub/Java';
import Python from './Courses/DevelopmentHub/Python';
import Php from './Courses/DevelopmentHub/Php';

// Import AI & ML Track components
import ArtificialInteligence from './Courses/AI&MlTrack/ArtificialInteligence';
import MachineLearning from './Courses/AI&MlTrack/MachineLearning';
import BigData from './Courses/AI&MlTrack/BigData';
import DataScience from './Courses/AI&MlTrack/DataScience';

// Import Cloud Security components
import ITSecurity from './Courses/Cloud-Computing/ITSecurity';
import CloudComputing from './Courses/Cloud-Computing/CloudComputing';
import DEVOPS from './Courses/Cloud-Computing/DEVOPS';
import Aws from './Courses/Cloud-Computing/Aws';

// Import Job-linked components
import PGDSE from './Courses/Job-linked/PGDSE';
import PGDIE from './Courses/Job-linked/PGDIE';
import PGDFE from './Courses/Job-linked/PGDFE';
import PGDDA from './Courses/Job-linked/PGDDA';
import AIML from './Courses/Job-linked/AIML';

const CoursesMain = () => {
  return (
    <div className="courses-main">
      <Routes>
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="mern" replace />} />
        
        {/* Development Hub Routes */}
        <Route path="mern" element={<Mern />} />
        <Route path="full-stack-web-development" element={<FullStackWeb />} />
        <Route path="c-cpp-data-structure" element={<DataStructure />} />
        <Route path="java" element={<Java />} />
        <Route path="python" element={<Python />} />
        <Route path="php" element={<Php />} />
        
        {/* AI and ML Track Routes */}
        <Route path="artificial-intelligence" element={<ArtificialInteligence />} />
        <Route path="machine-learning" element={<MachineLearning />} />
        <Route path="big-data" element={<BigData />} />
        <Route path="data-science" element={<DataScience />} />
        
        {/* Cloud Security Routes */}
        <Route path="it-security" element={<ITSecurity />} />
        <Route path="cloud-computing" element={<CloudComputing />} />
        <Route path="devops" element={<DEVOPS />} />
        <Route path="aws-azure" element={<Aws />} />
        
        {/* JOB Linked Program Routes */}
        <Route path="pgdse" element={<PGDSE />} />
        <Route path="pgdie" element={<PGDIE />} />
        <Route path="pgdfe" element={<PGDFE />} />
        <Route path="pgdda" element={<PGDDA />} />
        <Route path="aiml-advance-diploma" element={<AIML />} />
      </Routes>
    </div>
  );
};

export default CoursesMain;