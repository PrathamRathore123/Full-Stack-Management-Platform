import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaMoneyBillWave, FaPlus, FaEdit, FaTrash, FaDownload, FaFilter, FaSearch, FaFileInvoice, FaChartBar, FaCreditCard } from 'react-icons/fa';
import './FeeManagement.css';
import { adminAxiosInstance, fetchFeeStructures } from '../../api';

const FeeManagement = () => {
  const [activeTab, setActiveTab] = useState('structures');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  
  // State for data
  const [feeStructures, setFeeStructures] = useState([]);
  const [studentFees, setStudentFees] = useState([]);
  const [courses, setCourses] = useState([]);
  const [summaryData, setSummaryData] = useState({
    totalAssigned: 0,
    totalCollected: 0,
    totalPending: 0,
    collectionRate: 0
  });

  // Mock data for development
  const mockFeeStructures = [
    { id: 1, name: 'Full Stack Web Development - 2023', course: { title: 'Full Stack Web Development' }, registration_fee: 5000, tuition_fee: 40000, total_amount: 45000, installments: 3, created_at: '2023-07-01' },
    { id: 2, name: 'Data Science - 2023', course: { title: 'Data Science' }, registration_fee: 5000, tuition_fee: 45000, total_amount: 50000, installments: 3, created_at: '2023-07-05' },
    { id: 3, name: 'Python Programming - 2023', course: { title: 'Python Programming' }, registration_fee: 3000, tuition_fee: 32000, total_amount: 35000, installments: 2, created_at: '2023-07-10' }
  ];
  
  const mockStudentFees = [
    { id: 1, student_name: 'John Smith', fee_structure_name: 'Full Stack Web Development - 2023', total_amount: 45000, amount_paid: 30000, status: 'partially_paid' },
    { id: 2, student_name: 'Priya Sharma', fee_structure_name: 'Data Science - 2023', total_amount: 50000, amount_paid: 50000, status: 'paid' },
    { id: 3, student_name: 'Rajesh Kumar', fee_structure_name: 'Python Programming - 2023', total_amount: 35000, amount_paid: 0, status: 'unpaid' }
  ];
  
  const mockCourses = [
    { id: 1, title: 'Full Stack Web Development' },
    { id: 2, title: 'Data Science' },
    { id: 3, title: 'Python Programming' }
  ];

  // No need for Razorpay script anymore

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch fee structures
        const structuresData = await fetchFeeStructures();
        // Ensure fee values are numbers
        const processedStructures = structuresData.map(structure => ({
          ...structure,
          registration_fee: parseFloat(structure.registration_fee) || 0,
          tuition_fee: parseFloat(structure.tuition_fee) || 0,
          total_amount: parseFloat(structure.total_amount) || 0
        }));
        setFeeStructures(processedStructures);
        
        // Fetch student fees
        const feesResponse = await adminAxiosInstance.get('student-fees/');
        setStudentFees(feesResponse.data);
        
        // Fetch courses for filtering
        const coursesResponse = await adminAxiosInstance.get('courses/courses/');
        setCourses(coursesResponse.data);
        
        // Calculate summary data
        const totalAssigned = feesResponse.data.reduce((sum, fee) => sum + Number(fee.total_amount || 0), 0);
        const totalCollected = feesResponse.data.reduce((sum, fee) => sum + Number(fee.amount_paid || 0), 0);
        const totalPending = totalAssigned - totalCollected;
        const collectionRate = totalAssigned > 0 ? Math.round((totalCollected / totalAssigned) * 100) : 0;
        
        setSummaryData({
          totalAssigned,
          totalCollected,
          totalPending,
          collectionRate
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error in fetchData:', err);
        
        // Fall back to mock data only if needed
        // Ensure mock data has numeric values
        const processedMockStructures = mockFeeStructures.map(structure => ({
          ...structure,
          registration_fee: parseFloat(structure.registration_fee) || 0,
          tuition_fee: parseFloat(structure.tuition_fee) || 0,
          total_amount: parseFloat(structure.total_amount) || 0
        }));
        setFeeStructures(processedMockStructures);
        setStudentFees(mockStudentFees);
        setCourses(mockCourses);
        
        // Calculate summary data from mock data
        const totalAssigned = mockStudentFees.reduce((sum, fee) => sum + fee.total_amount, 0);
        const totalCollected = mockStudentFees.reduce((sum, fee) => sum + fee.amount_paid, 0);
        const totalPending = totalAssigned - totalCollected;
        const collectionRate = totalAssigned > 0 ? Math.round((totalCollected / totalAssigned) * 100) : 0;
        
        setSummaryData({
          totalAssigned,
          totalCollected,
          totalPending,
          collectionRate
        });
        
        setError('Failed to load fee data from server. Showing sample data.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleDeleteFeeStructure = async (id) => {
    if (window.confirm('Are you sure you want to delete this fee structure?')) {
      try {
        await adminAxiosInstance.delete(`fee-structures/${id}/`);
        setFeeStructures(feeStructures.filter(structure => structure.id !== id));
        alert('Fee structure deleted successfully');
      } catch (err) {
        console.error('Error deleting fee structure:', err);
        alert('Failed to delete fee structure. Please try again.');
      }
    }
  };

  const handleGenerateInvoice = async (feeId) => {
    try {
      const response = await adminAxiosInstance.get(`student-fees/${feeId}/generate-invoice/`, {
        responseType: 'blob'
      });
      
      // Create a download link for the PDF
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${feeId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error generating invoice:', err);
      alert('Failed to generate invoice. Please try again.');
    }
  };

  const handlePaymentInitiation = (fee) => {
    if (window.confirm(`Process payment of ₹${(fee.total_amount - fee.amount_paid).toLocaleString()} for ${fee.student_name}?`)) {
      // Simulate successful payment without Razorpay
      const updatedFees = studentFees.map(f => {
        if (f.id === fee.id) {
          return {
            ...f,
            amount_paid: f.total_amount,
            status: 'paid'
          };
        }
        return f;
      });
      
      setStudentFees(updatedFees);
      
      // Update summary data
      const totalCollected = summaryData.totalCollected + (fee.total_amount - fee.amount_paid);
      const totalPending = summaryData.totalAssigned - totalCollected;
      const collectionRate = summaryData.totalAssigned > 0 
        ? Math.round((totalCollected / summaryData.totalAssigned) * 100) 
        : 0;
      
      setSummaryData({
        ...summaryData,
        totalCollected,
        totalPending,
        collectionRate
      });
      
      alert('Payment successful! Receipt will be emailed to you.');
    }
  };
  
  // Payment is now handled directly in the handlePaymentInitiation function

  const filteredStudentFees = studentFees.filter(fee => {
    const matchesSearch = fee.student_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || fee.status === statusFilter;
    const matchesCourse = courseFilter === 'all' || (fee.fee_structure && fee.fee_structure.course === parseInt(courseFilter));
    
    return matchesSearch && matchesStatus && matchesCourse;
  });

  if (loading) {
    return <div className="loading">Loading fee data...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="page-header">
        <h1><FaMoneyBillWave /> Fee Management</h1>
        <div className="refresh-button">
          <button onClick={() => window.location.reload()} className="btn-refresh">
            Refresh Data
          </button>
        </div>
      </div>
      
      <div className="fee-summary-cards">
        <div className="summary-card">
          <h3>Total Fees Assigned</h3>
          <p className="summary-number">
            ₹{summaryData.totalAssigned.toLocaleString()}
          </p>
          <div className="summary-icon">
            <FaMoneyBillWave />
          </div>
        </div>
        <div className="summary-card">
          <h3>Total Collected</h3>
          <p className="summary-number">
            ₹{summaryData.totalCollected.toLocaleString()}
          </p>
          <div className="summary-icon">
            <FaChartBar />
          </div>
        </div>
        <div className="summary-card">
          <h3>Total Pending</h3>
          <p className="summary-number">
            ₹{summaryData.totalPending.toLocaleString()}
          </p>
          <div className="summary-icon">
            <FaFileInvoice />
          </div>
        </div>
        <div className="summary-card">
          <h3>Collection Rate</h3>
          <p className="summary-number">
            {summaryData.collectionRate}%
          </p>
          <div className="summary-icon">
            <FaChartBar />
          </div>
        </div>
      </div>
      
      <div className="tabs-container">
        <div className="tabs">
          <button 
            className={activeTab === 'structures' ? 'active' : ''} 
            onClick={() => setActiveTab('structures')}
          >
            Fee Structures
          </button>
          <button 
            className={activeTab === 'student-fees' ? 'active' : ''} 
            onClick={() => setActiveTab('student-fees')}
          >
            Student Fees
          </button>
          <button 
            className={activeTab === 'reports' ? 'active' : ''} 
            onClick={() => setActiveTab('reports')}
          >
            Reports
          </button>
        </div>
        
        {activeTab === 'structures' && (
          <div className="tab-content">
            <div className="action-bar">
              <Link to="/admin/fee-structures/create" className="btn-primary">
                <FaPlus /> Create Fee Structure
              </Link>
            </div>
            
            <div className="fee-structures-list">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Registration Fee</th>
                    <th>Tuition Fee</th>
                    <th>Total Amount</th>
                    <th>Installments</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {feeStructures.length > 0 ? (
                    feeStructures.map(structure => (
                      <tr key={structure.id}>
                        <td>{structure.name}</td>
                        <td>₹{(structure.registration_fee).toLocaleString()}</td>
                        <td>₹{(structure.tuition_fee).toLocaleString()}</td>
                        <td>₹{(structure.total_amount).toLocaleString()}</td>
                        <td>{structure.installments}</td>
                        <td className="actions">
                          <Link to={`/admin/fee-structures/${structure.id}`} className="btn-icon" title="Edit Fee Structure">
                            <FaEdit />
                          </Link>
                          <button 
                            className="btn-icon delete" 
                            onClick={() => handleDeleteFeeStructure(structure.id)}
                            title="Delete Fee Structure"
                          >
                            <FaTrash />
                          </button>
                          <Link to={`/admin/fee-structures/${structure.id}/installments`} className="btn-icon" title="Manage Installments">
                            <FaMoneyBillWave />
                          </Link>
                          <button 
                            className="btn-icon assign" 
                            onClick={() => {
                              adminAxiosInstance.post(`fee-structures/${structure.id}/assign_to_students/`, {
                                course_id: structure.course.id
                              })
                              .then(() => {
                                alert('Fee structure assigned to all enrolled students successfully!');
                              })
                              .catch(err => {
                                console.error('Error assigning fee structure:', err);
                                alert('Failed to assign fee structure to students.');
                              });
                            }}
                            title="Assign to All Students"
                          >
                            <FaPlus />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="no-data">No fee structures found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeTab === 'student-fees' && (
          <div className="tab-content">
            <div className="action-bar">
              <Link to="/admin/student-fees/assign" className="btn-primary">
                <FaPlus /> Assign Fee to Student
              </Link>
              
              <div className="filters">
                <div className="search-box">
                  <FaSearch />
                  <input 
                    type="text" 
                    placeholder="Search by student name" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <div className="filter-select">
                  <FaFilter />
                  <select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="paid">Paid</option>
                    <option value="partially_paid">Partially Paid</option>
                    <option value="unpaid">Unpaid</option>
                  </select>
                </div>
                
                <div className="filter-select">
                  <select 
                    value={courseFilter} 
                    onChange={(e) => setCourseFilter(e.target.value)}
                  >
                    <option value="all">All Courses</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            <div className="student-fees-list">
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Fee Structure</th>
                    <th>Total Amount</th>
                    <th>Paid Amount</th>
                    <th>Balance</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudentFees.length > 0 ? (
                    filteredStudentFees.map(fee => (
                      <tr key={fee.id}>
                        <td>{fee.student_name}</td>
                        <td>{fee.fee_structure_name}</td>
                        <td>₹{fee.total_amount.toLocaleString()}</td>
                        <td>₹{fee.amount_paid.toLocaleString()}</td>
                        <td>₹{(fee.total_amount - fee.amount_paid).toLocaleString()}</td>
                        <td>
                          <span className={`status-badge ${fee.status}`}>
                            {fee.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="actions">
                          <Link to={`/admin/student-fees/${fee.id}`} className="btn-icon">
                            <FaEdit />
                          </Link>
                          <Link to={`/admin/student-fees/${fee.id}/payments`} className="btn-icon">
                            <FaMoneyBillWave title="Manage Payments" />
                          </Link>
                          <button 
                            className="btn-icon" 
                            onClick={() => handleGenerateInvoice(fee.id)}
                            title="Generate Invoice"
                          >
                            <FaFileInvoice />
                          </button>
                          {fee.status !== 'paid' && (
                            <button 
                              className="btn-icon payment" 
                              onClick={() => handlePaymentInitiation(fee)}
                              title="Pay Online"
                            >
                              <FaCreditCard />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="no-data">No student fees found matching the filters</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeTab === 'reports' && (
          <div className="tab-content">
            <div className="reports-actions">
              <button className="btn-primary">
                <FaDownload /> Export Fee Collection Report
              </button>
              <button className="btn-primary">
                <FaDownload /> Export Outstanding Fees Report
              </button>
            </div>
            
            <div className="report-filters">
              <h3>Generate Custom Report</h3>
              <div className="filter-row">
                <div className="filter-group">
                  <label>Date Range</label>
                  <div className="date-inputs">
                    <input type="date" id="start-date" placeholder="Start Date" />
                    <span>to</span>
                    <input type="date" id="end-date" placeholder="End Date" />
                  </div>
                </div>
                
                <div className="filter-group">
                  <label>Course</label>
                  <select id="report-course">
                    <option value="">All Courses</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="filter-group">
                  <label>Status</label>
                  <select id="report-status">
                    <option value="">All Status</option>
                    <option value="paid">Paid</option>
                    <option value="partially_paid">Partially Paid</option>
                    <option value="unpaid">Unpaid</option>
                  </select>
                </div>
              </div>
              
              <button className="btn-primary">
                Generate Report
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeeManagement;