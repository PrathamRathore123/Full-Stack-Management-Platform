import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userAxiosInstance } from '../../api';
import { 
  FaMoneyBillWave, FaExclamationTriangle, FaSearch, FaFilter, 
  FaUsers, FaCheckCircle, FaExclamationCircle, FaTimesCircle,
  FaDownload, FaFileExport, FaChartLine
} from 'react-icons/fa';
import './StudentFeeStatus.css';

const StudentFeeStatus = () => {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(batchId || '');

  // Mock data for development
  const mockBatches = [
    { id: 1, name: 'Batch 2023-A' },
    { id: 2, name: 'Batch 2023-B' },
    { id: 3, name: 'Batch 2023-C' }
  ];
  
  const mockStudents = [
    { student_id: 1, student_name: 'John Smith', enrollment_id: 'ENRL2301', total_amount: 45000, amount_paid: 30000, status: 'partially_paid', last_payment_date: '2023-07-15' },
    { student_id: 2, student_name: 'Priya Sharma', enrollment_id: 'ENRL2302', total_amount: 50000, amount_paid: 50000, status: 'paid', last_payment_date: '2023-07-10' },
    { student_id: 3, student_name: 'Rajesh Kumar', enrollment_id: 'ENRL2303', total_amount: 35000, amount_paid: 0, status: 'unpaid', last_payment_date: null },
    { student_id: 4, student_name: 'Anita Desai', enrollment_id: 'ENRL2304', total_amount: 45000, amount_paid: 15000, status: 'partially_paid', last_payment_date: '2023-06-20' },
    { student_id: 5, student_name: 'Vikram Singh', enrollment_id: 'ENRL2305', total_amount: 35000, amount_paid: 35000, status: 'paid', last_payment_date: '2023-07-05' }
  ];

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('access');
    if (!token) {
      console.warn('No access token found, redirecting to login');
      navigate('/login');
      return;
    }

    const fetchBatches = async () => {
      try {
        const response = await userAxiosInstance.get('batches/');
        setBatches(response.data);
      } catch (err) {
        console.error('Error fetching batches:', err);
        if (err.response?.status === 401) {
          // Redirect to login if unauthorized
          navigate('/login');
          return;
        }
        // Use mock data if API call fails
        setBatches(mockBatches);
      }
    };

    fetchBatches();
  }, [navigate]);

  useEffect(() => {
    const fetchStudentFees = async () => {
      // Check if user is authenticated
      const token = localStorage.getItem('access');
      if (!token) {
        console.warn('No access token found, redirecting to login');
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        
        try {
          const response = await userAxiosInstance.get(`faculty-student-fees/?batch_id=${selectedBatch || ''}`);
          console.log('API Response:', response.data);
          if (Array.isArray(response.data)) {
            setStudents(response.data);
            console.log(`Loaded ${response.data.length} students from API`);
          } else {
            console.warn('API returned non-array data:', response.data);
            setStudents([]);
          }
        } catch (err) {
          console.error('Error fetching student fee data:', err);
          console.error('Error details:', err.response?.data);
          if (err.response?.status === 401) {
            // Redirect to login if unauthorized
            navigate('/login');
            return;
          }
          // Use mock data if API call fails
          console.log('Using mock data due to API error');
          setStudents(mockStudents);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error in fetchStudentFees:', err);
        setError('Failed to load student fee data. Please try again later.');
        setLoading(false);
      }
    };

    if (selectedBatch || batchId) {
      fetchStudentFees();
    } else if (batches.length > 0) {
      setSelectedBatch(batches[0].id);
    }
  }, [selectedBatch, batchId, batches, navigate]);

  const filteredStudents = Array.isArray(students) ? students.filter(student => {
    const matchesSearch = 
      student.student_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      student.enrollment_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) : [];

  const handleBatchChange = (e) => {
    setSelectedBatch(e.target.value);
  };

  if (loading) {
    return (
      <div className="fee-management-container">
        <div className="fee-content-wrapper">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <div className="loading-text">Loading student fee data...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fee-management-container">
        <div className="fee-content-wrapper">
          <div className="error-container">
            <FaExclamationTriangle className="error-icon" />
            <div className="error-text">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fee-management-container">
      <div className="fee-content-wrapper">
        <div className="fee-header">
          <h1><FaMoneyBillWave /> Student Fee Management</h1>
          <p>Monitor and track student fee payments across all batches</p>
        </div>

        {students === mockStudents && (
          <div className="mock-data-warning">
            <FaExclamationTriangle />
            <span>Using demo data - API connection failed</span>
          </div>
        )}
        
        <div className="fee-controls">
          <div className="controls-grid">
            <div className="control-group">
              <label className="control-label">Select Batch</label>
              <select 
                className="control-select"
                value={selectedBatch} 
                onChange={handleBatchChange}
              >
                <option value="">All Batches</option>
                {batches.map(batch => (
                  <option key={batch.id} value={batch.id}>
                    {batch.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="control-group">
              <label className="control-label">Search Students</label>
              <div className="control-input-wrapper">
                <FaSearch className="control-icon" />
                <input 
                  className="control-input with-icon"
                  type="text" 
                  placeholder="Search by name or enrollment ID" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="control-group">
              <label className="control-label">Filter by Status</label>
              <select 
                className="control-select"
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="paid">Fully Paid</option>
                <option value="partially_paid">Partially Paid</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="fee-stats">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Students</h3>
              <div className="stat-number">{Array.isArray(students) ? students.length : 0}</div>
            </div>
            <div className="stat-card">
              <h3>Fully Paid</h3>
              <div className="stat-number">
                {Array.isArray(students) ? students.filter(student => student.status === 'paid').length : 0}
              </div>
            </div>
            <div className="stat-card">
              <h3>Partially Paid</h3>
              <div className="stat-number">
                {Array.isArray(students) ? students.filter(student => student.status === 'partially_paid').length : 0}
              </div>
            </div>
            <div className="stat-card">
              <h3>Unpaid</h3>
              <div className="stat-number">
                {Array.isArray(students) ? students.filter(student => student.status === 'unpaid').length : 0}
              </div>
            </div>
          </div>
        </div>
        
        <div className="fee-table-section">
          <div className="table-header">
            <h2 className="table-title">Student Fee Details</h2>
            <div className="table-actions">
              <button className="action-btn btn-secondary">
                <FaFileExport /> Export
              </button>
              <button className="action-btn btn-primary">
                <FaChartLine /> Analytics
              </button>
            </div>
          </div>
          
          <div className="modern-table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Student Details</th>
                  <th>Total Amount</th>
                  <th>Amount Paid</th>
                  <th>Balance Due</th>
                  <th>Payment Status</th>
                  <th>Last Payment</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <tr key={student.student_id}>
                      <td>
                        <div className="student-info">
                          <div className="student-name">{student.student_name}</div>
                          <div className="enrollment-id">{student.enrollment_id}</div>
                        </div>
                      </td>
                      <td className="amount-cell">₹{student.total_amount.toLocaleString()}</td>
                      <td className="amount-cell amount-positive">₹{student.amount_paid.toLocaleString()}</td>
                      <td className="amount-cell amount-negative">₹{(student.total_amount - student.amount_paid).toLocaleString()}</td>
                      <td>
                        <span className={`status-badge ${student.status}`}>
                          {student.status === 'paid' && <FaCheckCircle />}
                          {student.status === 'partially_paid' && <FaExclamationCircle />}
                          {student.status === 'unpaid' && <FaTimesCircle />}
                          {student.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="payment-date">
                        {student.last_payment_date ? new Date(student.last_payment_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }) : 'No payment yet'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-data-row">
                      <div className="no-data-content">
                        <FaUsers className="no-data-icon" />
                        <div className="no-data-text">No students found matching the current filters</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentFeeStatus;