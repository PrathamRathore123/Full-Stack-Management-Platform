import React, { useState, useEffect } from 'react';
import { adminAxiosInstance } from '../../api';
import './WorkshopRegistrations.css';

const WorkshopRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [workshops, setWorkshops] = useState([]);
  const [selectedWorkshop, setSelectedWorkshop] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all workshops
        const workshopsResponse = await adminAxiosInstance.get('workshops/');
        setWorkshops(workshopsResponse.data);
        
        // Fetch all registrations
        const registrationsResponse = await adminAxiosInstance.get('workshop-registrations/');
        setRegistrations(registrationsResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching workshop registrations:', err);
        setError('Failed to load workshop registrations. Please try again.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter registrations by selected workshop
  const filteredRegistrations = selectedWorkshop === 'all' 
    ? registrations 
    : registrations.filter(reg => reg.workshop.id === parseInt(selectedWorkshop));

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading registrations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="workshop-registrations-container">
      <h1>Workshop Registrations</h1>
      
      <div className="filter-controls">
        <label htmlFor="workshop-filter">Filter by Workshop:</label>
        <select 
          id="workshop-filter" 
          value={selectedWorkshop} 
          onChange={(e) => setSelectedWorkshop(e.target.value)}
        >
          <option value="all">All Workshops</option>
          {workshops.map(workshop => (
            <option key={workshop.id} value={workshop.id}>
              {workshop.title}
            </option>
          ))}
        </select>
      </div>
      
      {filteredRegistrations.length > 0 ? (
        <div className="registrations-table-container">
          <table className="registrations-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Workshop</th>
                <th>Experience Level</th>
                <th>Registration Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredRegistrations.map(registration => (
                <tr key={registration.id}>
                  <td>{registration.name}</td>
                  <td>{registration.email}</td>
                  <td>{registration.phone}</td>
                  <td>{registration.workshop?.title || 'N/A'}</td>
                  <td className="experience-level">
                    <span className={`level-badge ${registration.experience_level}`}>
                      {registration.experience_level.charAt(0).toUpperCase() + registration.experience_level.slice(1)}
                    </span>
                  </td>
                  <td>{new Date(registration.registration_date).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-registrations">
          <p>No registrations found for the selected workshop.</p>
        </div>
      )}
    </div>
  );
};

export default WorkshopRegistrations;