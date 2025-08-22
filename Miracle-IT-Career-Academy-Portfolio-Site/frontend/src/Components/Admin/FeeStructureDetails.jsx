import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userAxiosInstance } from '../../api';
import { FaMoneyBillWave, FaCheck, FaTimes, FaArrowLeft, FaUserGraduate } from 'react-icons/fa';
import './AdminDashboard.css';
import './CreateFeeStructure.css';

const FeeStructureDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [feeStructure, setFeeStructure] = useState(null);
  const [installments, setInstallments] = useState([]);
  const [students, setStudents] = useState([]);
  const [paymentStats, setPaymentStats] = useState({
    totalDue: 0,
    totalPaid: 0,
    totalPending: 0
  });

  useEffect(() => {
    const fetchFeeStructureDetails = async () => {
      try {
        setLoading(true);
        // Fetch fee structure details
        const feeResponse = await userAxiosInstance.get(`fee-structures/${id}/`);
        setFeeStructure(feeResponse.data);
        
        // Fetch installments
        const installmentsResponse = await userAxiosInstance.get(`fee-structures/${id}/installments/`);
        setInstallments(installmentsResponse.data);
        
        // Fetch students assigned to this fee structure
        const studentsResponse = await userAxiosInstance.get(`fee-structures/${id}/students/`);
        setStudents(studentsResponse.data);
        
        // Calculate payment statistics
        const stats = calculatePaymentStats(studentsResponse.data, installmentsResponse.data);
        setPaymentStats(stats);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching fee structure details:', err);
        alert('Failed to fetch fee structure details');
        setLoading(false);
      }
    };
    
    fetchFeeStructureDetails();
  }, [id]);
  
  const calculatePaymentStats = (students, installments) => {
    let totalDue = 0;
    let totalPaid = 0;
    let totalPending = 0;
    
    // Calculate total amount due from all installments
    const totalPerStudent = installments.reduce((sum, inst) => sum + Number(inst.amount), 0);
    totalDue = totalPerStudent * students.length;
    
    // Calculate paid and pending amounts
    students.forEach(student => {
      student.payments?.forEach(payment => {
        if (payment.status === 'paid') {
          totalPaid += Number(payment.amount);
        }
      });
    });
    
    totalPending = totalDue - totalPaid;
    
    return {
      totalDue,
      totalPaid,
      totalPending
    };
  };
  
  const getInstallmentStatus = (student, installmentId) => {
    const payment = student.payments?.find(p => p.installment_id === installmentId);
    return payment ? payment.status : 'pending';
  };
  
  const getPaymentDate = (student, installmentId) => {
    const payment = student.payments?.find(p => p.installment_id === installmentId);
    return payment?.payment_date ? new Date(payment.payment_date).toLocaleDateString() : '-';
  };
  
  if (loading) {
    return <div className="loading">Loading fee structure details...</div>;
  }
  
  if (!feeStructure) {
    return <div className="error-message">Fee structure not found</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/admin/fee-structure')}>
          <FaArrowLeft /> Back to Fee Structures
        </button>
        <h1><FaMoneyBillWave /> Fee Structure Details</h1>
      </div>
      
      <div className="fee-structure-summary">
        <h2>{feeStructure.name}</h2>
        <div className="summary-details">
          <div className="summary-item">
            <span className="label">Course:</span>
            <span className="value">{feeStructure.course?.title}</span>
          </div>
          <div className="summary-item">
            <span className="label">Registration Fee:</span>
            <span className="value">₹{feeStructure.registration_fee}</span>
          </div>
          <div className="summary-item">
            <span className="label">Tuition Fee:</span>
            <span className="value">₹{feeStructure.tuition_fee}</span>
          </div>
          <div className="summary-item">
            <span className="label">Total Amount:</span>
            <span className="value highlighted">₹{feeStructure.total_amount}</span>
          </div>
          <div className="summary-item">
            <span className="label">Installments:</span>
            <span className="value">{installments.length}</span>
          </div>
        </div>
      </div>
      
      <div className="payment-statistics">
        <h3>Payment Statistics</h3>
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-value">₹{paymentStats.totalDue}</div>
            <div className="stat-label">Total Due</div>
          </div>
          <div className="stat-item paid">
            <div className="stat-value">₹{paymentStats.totalPaid}</div>
            <div className="stat-label">Total Paid</div>
          </div>
          <div className="stat-item pending">
            <div className="stat-value">₹{paymentStats.totalPending}</div>
            <div className="stat-label">Total Pending</div>
          </div>
        </div>
      </div>
      
      <div className="installments-section">
        <h3>Installment Schedule</h3>
        <div className="installments-table">
          <table>
            <thead>
              <tr>
                <th>No.</th>
                <th>Description</th>
                <th>Amount (₹)</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {installments.map((installment, index) => (
                <tr key={index} className={index === 0 ? "installment-row first-installment" : "installment-row"}>
                  <td>{index + 1}</td>
                  <td>{installment.description || `Installment ${index + 1}`}</td>
                  <td>₹{installment.amount}</td>
                  <td>{new Date(installment.due_date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="students-section">
        <h3><FaUserGraduate /> Enrolled Students ({students.length})</h3>
        {students.length > 0 ? (
          <div className="students-payment-table">
            <table>
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  {installments.map((installment, index) => (
                    <th key={index}>
                      {index === 0 ? 'Registration Fee' : `Installment ${index}`}
                      <div className="installment-amount">₹{installment.amount}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student.id}>
                    <td>{student.student_id}</td>
                    <td>{student.name}</td>
                    <td>{student.email}</td>
                    {installments.map(installment => (
                      <td key={installment.id} className={`payment-status ${getInstallmentStatus(student, installment.id)}`}>
                        {getInstallmentStatus(student, installment.id) === 'paid' ? (
                          <>
                            <FaCheck className="status-icon paid" />
                            <div className="payment-date">{getPaymentDate(student, installment.id)}</div>
                          </>
                        ) : (
                          <FaTimes className="status-icon pending" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="no-students">No students are currently assigned to this fee structure.</p>
        )}
      </div>
    </div>
  );
};

export default FeeStructureDetails;