import React from 'react';
import './FacultyDashboard.css';

const FacultyAnnouncements = () => {
  return (
    <div className="dashboard-container">
      <h1>Faculty Announcements</h1>
      <div className="dashboard-content">
        <div className="announcement-actions">
          <button className="btn-primary">Create Announcement</button>
          <div className="filter-group">
            <label>Filter By:</label>
            <select className="filter-select">
              <option value="all">All Courses</option>
              <option value="web">Web Development</option>
              <option value="python">Python Programming</option>
              <option value="data">Data Science Fundamentals</option>
              <option value="ml">Machine Learning Basics</option>
              <option value="js">JavaScript Fundamentals</option>
            </select>
          </div>
        </div>
        
        <div className="create-announcement-form">
          <h3>New Announcement</h3>
          <div className="form-group">
            <label>Title</label>
            <input type="text" placeholder="Enter announcement title" className="form-control" />
          </div>
          <div className="form-group">
            <label>Course</label>
            <select className="form-control">
              <option value="">Select course</option>
              <option value="web">Web Development</option>
              <option value="python">Python Programming</option>
              <option value="data">Data Science Fundamentals</option>
              <option value="ml">Machine Learning Basics</option>
              <option value="js">JavaScript Fundamentals</option>
              <option value="all">All Courses</option>
            </select>
          </div>
          <div className="form-group">
            <label>Message</label>
            <textarea placeholder="Enter your announcement message" className="form-control" rows="5"></textarea>
          </div>
          <div className="form-group">
            <label>Priority</label>
            <select className="form-control">
              <option value="normal">Normal</option>
              <option value="important">Important</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div className="form-group">
            <label>Attachment</label>
            <input type="file" className="form-control" />
          </div>
          <div className="form-actions">
            <button className="btn-primary">Post Announcement</button>
            <button className="btn-secondary">Cancel</button>
          </div>
        </div>
        
        <div className="announcements-list">
          <h3>Recent Announcements</h3>
          
          <div className="announcement-card urgent">
            <div className="announcement-header">
              <h4>Midterm Exam Schedule Change</h4>
              <span className="announcement-badge urgent">Urgent</span>
            </div>
            <div className="announcement-meta">
              <p><strong>Course:</strong> Web Development</p>
              <p><strong>Posted:</strong> July 15, 2023 - 10:30 AM</p>
            </div>
            <div className="announcement-content">
              <p>Dear students, please note that the midterm exam for Web Development has been rescheduled from July 20 to July 22 due to unavoidable circumstances. The exam will now be held from 10:00 AM to 12:00 PM in Room 301. Please make a note of this change and prepare accordingly.</p>
              <p>All other exam details remain the same. Please reach out if you have any questions.</p>
            </div>
            <div className="announcement-footer">
              <span className="attachment-info">📎 1 attachment</span>
              <div className="announcement-actions">
                <button className="btn-icon">✏️</button>
                <button className="btn-icon">🗑️</button>
              </div>
            </div>
          </div>
          
          <div className="announcement-card important">
            <div className="announcement-header">
              <h4>Project Submission Deadline Extended</h4>
              <span className="announcement-badge important">Important</span>
            </div>
            <div className="announcement-meta">
              <p><strong>Course:</strong> Python Programming</p>
              <p><strong>Posted:</strong> July 14, 2023 - 3:45 PM</p>
            </div>
            <div className="announcement-content">
              <p>Dear students, based on multiple requests and considering the complexity of the final project, I have decided to extend the submission deadline by 3 days. The new deadline is July 25, 2023, at 11:59 PM.</p>
              <p>Please use this additional time to refine your projects and ensure all requirements are met. Remember that quality is as important as completion.</p>
            </div>
            <div className="announcement-footer">
              <span className="announcement-stats">👁️ 38 views</span>
              <div className="announcement-actions">
                <button className="btn-icon">✏️</button>
                <button className="btn-icon">🗑️</button>
              </div>
            </div>
          </div>
          
          <div className="announcement-card">
            <div className="announcement-header">
              <h4>Additional Study Resources Available</h4>
              <span className="announcement-badge normal">Normal</span>
            </div>
            <div className="announcement-meta">
              <p><strong>Course:</strong> Data Science Fundamentals</p>
              <p><strong>Posted:</strong> July 12, 2023 - 11:20 AM</p>
            </div>
            <div className="announcement-content">
              <p>I've uploaded additional study resources for the upcoming topics in data visualization and statistical analysis. These include practice datasets, example code, and reference guides that should help you better understand the concepts we'll be covering in the next few classes.</p>
              <p>You can find these materials in the course repository under the "Additional Resources" folder.</p>
            </div>
            <div className="announcement-footer">
              <span className="attachment-info">📎 3 attachments</span>
              <div className="announcement-actions">
                <button className="btn-icon">✏️</button>
                <button className="btn-icon">🗑️</button>
              </div>
            </div>
          </div>
          
          <div className="announcement-card">
            <div className="announcement-header">
              <h4>Guest Lecture Next Week</h4>
              <span className="announcement-badge normal">Normal</span>
            </div>
            <div className="announcement-meta">
              <p><strong>Course:</strong> All Courses</p>
              <p><strong>Posted:</strong> July 10, 2023 - 2:15 PM</p>
            </div>
            <div className="announcement-content">
              <p>I'm pleased to announce that we will have a guest lecture next week by Dr. Amit Patel, a leading expert in AI and Machine Learning from Google. The lecture will be held on July 18, 2023, from 2:00 PM to 4:00 PM in the Main Auditorium.</p>
              <p>This is a great opportunity to learn from an industry expert and network with professionals. Attendance is optional but highly recommended for all students.</p>
            </div>
            <div className="announcement-footer">
              <span className="announcement-stats">👁️ 165 views</span>
              <div className="announcement-actions">
                <button className="btn-icon">✏️</button>
                <button className="btn-icon">🗑️</button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="pagination">
          <button className="pagination-btn">Previous</button>
          <button className="pagination-btn active">1</button>
          <button className="pagination-btn">2</button>
          <button className="pagination-btn">3</button>
          <button className="pagination-btn">Next</button>
        </div>
      </div>
    </div>
  );
};

export default FacultyAnnouncements;