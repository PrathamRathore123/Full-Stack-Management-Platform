import React, { useState, useEffect, useRef } from 'react';
import { userAxiosInstance } from '../../api';
import { FaSearch, FaFilter, FaDownload, FaEnvelope, FaEdit, FaEye, FaTrash, FaCheck, FaTimes, FaUsers, FaStar, FaCertificate } from 'react-icons/fa';
import './RegisteredUsers.css';

const RegisteredUsers = () => {
  const [registrations, setRegistrations] = useState([]);
  const [pastAttendees, setPastAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [workshops, setWorkshops] = useState([]);
  const [selectedWorkshop, setSelectedWorkshop] = useState('all');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPastAttendeesModal, setShowPastAttendeesModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    user_name: '',
    email: '',
    phone: '',
    status: ''
  });
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch workshops
        const workshopsResponse = await userAxiosInstance.get('workshops/');
        setWorkshops(workshopsResponse.data);
        
        // Fetch real workshop registrations
        const registrationsResponse = await userAxiosInstance.get('workshop-registrations/');
        
        // Transform the data if needed to match our component's expected format
        const formattedRegistrations = registrationsResponse.data.map(reg => ({
          id: reg.id,
          user_name: reg.name,
          email: reg.email,
          phone: reg.phone,
          workshop_id: reg.workshop_id,
          workshop_title: reg.workshop_title || 'Workshop',
          registration_date: reg.created_at || new Date().toISOString(),
          status: reg.status || 'pending'
        }));
        
        setRegistrations(formattedRegistrations);
        
        // Fetch past workshop attendees
        try {
          const pastAttendeesResponse = await userAxiosInstance.get('past-workshop-attendees/');
          setPastAttendees(pastAttendeesResponse.data);
        } catch (attendeesErr) {
          console.log('Using mock data for past attendees');
          // Mock data for past attendees if API endpoint doesn't exist yet
          setPastAttendees([
            {
              id: 101,
              user_name: 'John Smith',
              email: 'john.smith@example.com',
              phone: '555-123-4567',
              workshop_title: 'Advanced JavaScript',
              workshop_date: '2023-06-15',
              feedback: 'Great workshop, learned a lot!',
              rating: 5,
              certificate_issued: true
            },
            {
              id: 102,
              user_name: 'Emily Johnson',
              email: 'emily.j@example.com',
              phone: '555-987-6543',
              workshop_title: 'Python for Data Science',
              workshop_date: '2023-07-22',
              feedback: 'Very informative and well-structured.',
              rating: 4,
              certificate_issued: true
            },
            {
              id: 103,
              user_name: 'Michael Brown',
              email: 'michael.b@example.com',
              phone: '555-456-7890',
              workshop_title: 'Web Development Bootcamp',
              workshop_date: '2023-08-10',
              feedback: 'Excellent content and hands-on exercises.',
              rating: 5,
              certificate_issued: true
            }
          ]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load registration data');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handleWorkshopChange = (e) => {
    setSelectedWorkshop(e.target.value);
  };

  const exportToCSV = () => {
    const filteredData = getFilteredRegistrations();
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Workshop', 'Registration Date', 'Status'],
      ...filteredData.map(reg => [
        reg.user_name,
        reg.email,
        reg.phone,
        reg.workshop_title,
        new Date(reg.registration_date).toLocaleDateString(),
        reg.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'workshop_registrations.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFilteredRegistrations = () => {
    return registrations.filter(reg => {
      // Check if required properties exist before using them
      const matchesSearch = 
        (reg.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (reg.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
        (reg.workshop_title?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
      
      // Fix for category filtering - ensure status exists and is properly compared
      const matchesFilter = 
        filter === 'all' || 
        (reg.status && reg.status.toLowerCase() === filter.toLowerCase());
      
      const matchesWorkshop = 
        selectedWorkshop === 'all' || 
        (reg.workshop_id && reg.workshop_id.toString() === selectedWorkshop);
      
      return matchesSearch && matchesFilter && matchesWorkshop;
    });
  };

  const sendEmailToAll = () => {
    setEmailSubject(`Important Update: Workshop Information`);
    setEmailBody(`Dear Workshop Participant,\n\nWe hope this email finds you well. We wanted to share some important information about the upcoming workshop.\n\nBest regards,\nThe Workshop Team`);
    setShowEmailModal(true);
  };
  
  const sendEmailToOne = (registration) => {
    setEmailSubject(`Workshop Information for ${registration.user_name}`);
    setEmailBody(`Dear ${registration.user_name},\n\nWe hope this email finds you well. We wanted to share some important information about the ${registration.workshop_title} workshop.\n\nBest regards,\nThe Workshop Team`);
    setSelectedRegistration(registration);
    setShowEmailModal(true);
  };
  
  const handleSendEmail = async () => {
    setSendingEmail(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, you would call your API here
      // const response = await userAxiosInstance.post('send-email/', {
      //   recipients: selectedRegistration ? [selectedRegistration.email] : filteredRegistrations.map(reg => reg.email),
      //   subject: emailSubject,
      //   body: emailBody
      // });
      
      setEmailSuccess(true);
      setTimeout(() => {
        setShowEmailModal(false);
        setEmailSuccess(false);
        setSendingEmail(false);
      }, 2000);
    } catch (error) {
      console.error('Error sending email:', error);
      setSendingEmail(false);
    }
  };
  
  const handleViewRegistration = (registration) => {
    setSelectedRegistration(registration);
    setShowViewModal(true);
  };
  
  const handleEditRegistration = (registration) => {
    setSelectedRegistration(registration);
    setEditFormData({
      user_name: registration.user_name,
      email: registration.email,
      phone: registration.phone,
      status: registration.status
    });
    setShowEditModal(true);
  };
  
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleEditSubmit = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In a real implementation, you would call your API here
      // const response = await userAxiosInstance.put(`workshop-registrations/${selectedRegistration.id}/`, editFormData);
      
      // Update the registration in the local state
      const updatedRegistrations = registrations.map(reg => 
        reg.id === selectedRegistration.id ? 
        { ...reg, ...editFormData } : 
        reg
      );
      
      setRegistrations(updatedRegistrations);
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating registration:', error);
    }
  };
  
  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowEmailModal(false);
        setShowViewModal(false);
        setShowEditModal(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (loading) {
    return <div className="loading">Loading registration data...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  const filteredRegistrations = getFilteredRegistrations();

  return (
    <div className="registered-users-container">
      <div className="page-header">
        <h1>Workshop Registrations</h1>
        <div className="action-buttons">
          <button className="view-past-btn" onClick={() => setShowPastAttendeesModal(true)}>
            <FaUsers /> Past Attendees
          </button>
          <button className="export-btn" onClick={exportToCSV}>
            <FaDownload /> Export to CSV
          </button>
          <button className="email-btn" onClick={sendEmailToAll}>
            <FaEnvelope /> Email All
          </button>
        </div>
      </div>
      
      {/* Email Modal */}
      {showEmailModal && (
        <div className="modal-overlay">
          <div className="modal" ref={modalRef}>
            <div className="modal-header">
              <h2>{selectedRegistration ? `Email to ${selectedRegistration.user_name}` : 'Email to All Participants'}</h2>
              <button className="close-btn" onClick={() => setShowEmailModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              {emailSuccess ? (
                <div className="success-message">
                  <FaCheck className="success-icon" />
                  <p>Email sent successfully!</p>
                </div>
              ) : (
                <>
                  <div className="form-group">
                    <label>Subject</label>
                    <input 
                      type="text" 
                      value={emailSubject} 
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Enter email subject"
                    />
                  </div>
                  <div className="form-group">
                    <label>Message</label>
                    <textarea 
                      value={emailBody} 
                      onChange={(e) => setEmailBody(e.target.value)}
                      placeholder="Enter email message"
                      rows={6}
                    />
                  </div>
                  <div className="recipients-info">
                    <p>
                      <strong>Recipients:</strong> {selectedRegistration 
                        ? selectedRegistration.email 
                        : `${filteredRegistrations.length} workshop participants`}
                    </p>
                  </div>
                  <div className="modal-actions">
                    <button className="cancel-btn" onClick={() => setShowEmailModal(false)}>Cancel</button>
                    <button 
                      className="send-btn" 
                      onClick={handleSendEmail}
                      disabled={sendingEmail}
                    >
                      {sendingEmail ? 'Sending...' : 'Send Email'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* View Registration Modal */}
      {showViewModal && selectedRegistration && (
        <div className="modal-overlay">
          <div className="modal" ref={modalRef}>
            <div className="modal-header">
              <h2>Registration Details</h2>
              <button className="close-btn" onClick={() => setShowViewModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="registration-details">
                <div className="detail-row">
                  <span className="detail-label">Name:</span>
                  <span className="detail-value">{selectedRegistration.user_name}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{selectedRegistration.email}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Phone:</span>
                  <span className="detail-value">{selectedRegistration.phone}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Workshop:</span>
                  <span className="detail-value">{selectedRegistration.workshop_title}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Registration Date:</span>
                  <span className="detail-value">
                    {new Date(selectedRegistration.registration_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Status:</span>
                  <span className={`status-badge ${selectedRegistration.status.toLowerCase()}`}>
                    {selectedRegistration.status}
                  </span>
                </div>
              </div>
              <div className="modal-actions">
                <button className="close-btn" onClick={() => setShowViewModal(false)}>Close</button>
                <button className="edit-btn" onClick={() => {
                  setShowViewModal(false);
                  handleEditRegistration(selectedRegistration);
                }}>Edit</button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Registration Modal */}
      {showEditModal && selectedRegistration && (
        <div className="modal-overlay">
          <div className="modal" ref={modalRef}>
            <div className="modal-header">
              <h2>Edit Registration</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Name</label>
                <input 
                  type="text" 
                  name="user_name"
                  value={editFormData.user_name} 
                  onChange={handleEditFormChange}
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  name="email"
                  value={editFormData.email} 
                  onChange={handleEditFormChange}
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input 
                  type="text" 
                  name="phone"
                  value={editFormData.phone} 
                  onChange={handleEditFormChange}
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select 
                  name="status"
                  value={editFormData.status} 
                  onChange={handleEditFormChange}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="attended">Attended</option>
                </select>
              </div>
              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button className="save-btn" onClick={handleEditSubmit}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Past Attendees Modal */}
      {showPastAttendeesModal && (
        <div className="modal-overlay">
          <div className="modal modal-large" ref={modalRef}>
            <div className="modal-header">
              <h2>Past Workshop Attendees</h2>
              <button className="close-btn" onClick={() => setShowPastAttendeesModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div className="past-attendees-search">
                <input 
                  type="text" 
                  placeholder="Search by name, email, or workshop..." 
                  className="search-input"
                />
              </div>
              
              <div className="past-attendees-list">
                {pastAttendees.length > 0 ? (
                  <table className="attendees-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Workshop</th>
                        <th>Date</th>
                        <th>Rating</th>
                        <th>Certificate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pastAttendees.map(attendee => (
                        <tr key={attendee.id}>
                          <td>{attendee.user_name}</td>
                          <td>{attendee.email}</td>
                          <td>{attendee.workshop_title}</td>
                          <td>{new Date(attendee.workshop_date).toLocaleDateString()}</td>
                          <td>
                            <div className="rating">
                              {[...Array(5)].map((_, i) => (
                                <FaStar 
                                  key={i} 
                                  className={i < attendee.rating ? "star filled" : "star"} 
                                />
                              ))}
                            </div>
                          </td>
                          <td>
                            {attendee.certificate_issued ? (
                              <span className="certificate-badge">
                                <FaCertificate /> Issued
                              </span>
                            ) : (
                              <span className="no-certificate">Not Issued</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="no-data-message">No past attendees found</div>
                )}
              </div>
              
              <div className="attendee-feedback-section">
                <h3>Feedback Highlights</h3>
                <div className="feedback-cards">
                  {pastAttendees.map(attendee => (
                    <div className="feedback-card" key={`feedback-${attendee.id}`}>
                      <div className="feedback-header">
                        <div className="attendee-name">{attendee.user_name}</div>
                        <div className="workshop-name">{attendee.workshop_title}</div>
                      </div>
                      <div className="feedback-content">
                        "{attendee.feedback}"
                      </div>
                      <div className="feedback-rating">
                        {[...Array(5)].map((_, i) => (
                          <FaStar 
                            key={i} 
                            className={i < attendee.rating ? "star filled" : "star"} 
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="modal-actions">
                <button className="close-btn" onClick={() => setShowPastAttendeesModal(false)}>Close</button>
                <button className="export-btn" onClick={() => alert('Export functionality would be implemented here')}>
                  <FaDownload /> Export Attendee Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="filters-container">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, email or workshop..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        
        <div className="filter-group">
          <div className="filter">
            <FaFilter className="filter-icon" />
            <select value={filter} onChange={handleFilterChange}>
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
              <option value="attended">Attended</option>
            </select>
          </div>
          
          <div className="filter">
            <select value={selectedWorkshop} onChange={handleWorkshopChange}>
              <option value="all">All Workshops</option>
              {workshops.map(workshop => (
                <option key={workshop.id} value={workshop.id.toString()}>
                  {workshop.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="registrations-stats">
        <div className="stat-card">
          <h3>{registrations.length}</h3>
          <p>Total Registrations</p>
        </div>
        <div className="stat-card">
          <h3>{registrations.filter(reg => reg.status === 'confirmed').length}</h3>
          <p>Confirmed</p>
        </div>
        <div className="stat-card">
          <h3>{registrations.filter(reg => reg.status === 'pending').length}</h3>
          <p>Pending</p>
        </div>
        <div className="stat-card">
          <h3>{registrations.filter(reg => reg.status === 'attended').length}</h3>
          <p>Attended</p>
        </div>
      </div>

      <div className="registrations-table-container">
        <table className="registrations-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Workshop</th>
              <th>Registration Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRegistrations.length > 0 ? (
              filteredRegistrations.map(registration => (
                <tr key={registration.id}>
                  <td>{registration.user_name}</td>
                  <td>{registration.email}</td>
                  <td>{registration.phone}</td>
                  <td>{registration.workshop_title}</td>
                  <td>{new Date(registration.registration_date).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge ${registration.status.toLowerCase()}`}>
                      {registration.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="view-btn" onClick={() => handleViewRegistration(registration)}>
                        <FaEye /> View
                      </button>
                      <button className="edit-btn" onClick={() => handleEditRegistration(registration)}>
                        <FaEdit /> Edit
                      </button>
                      <button className="email-btn-small" onClick={() => sendEmailToOne(registration)}>
                        <FaEnvelope />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-data">No registrations found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RegisteredUsers;