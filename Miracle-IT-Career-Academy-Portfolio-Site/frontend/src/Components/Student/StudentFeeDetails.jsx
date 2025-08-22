import React, { useState, useEffect, useContext } from 'react';
import { UserContext } from '../UserContext';
import { userAxiosInstance } from '../../api';
import { FaMoneyBillWave, FaCheck, FaTimes, FaCalendarAlt } from 'react-icons/fa';
import './StudentFees.css';

const StudentFeeDetails = () => {
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [feeDetails, setFeeDetails] = useState(null);
  const [installments, setInstallments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudentFeeDetails = async () => {
      if (!user || !user.id) return;
      
      try {
        setLoading(true);
        // Fetch student fee structure
        const feeResponse = await userAxiosInstance.get(`students/${user.id}/fee-structure/`);
        setFeeDetails(feeResponse.data);
        
        // Fetch installments
        if (feeResponse.data?.fee_structure_id) {
          const installmentsResponse = await userAxiosInstance.get(
            `fee-structures/${feeResponse.data.fee_structure_id}/installments/`
          );
          setInstallments(installmentsResponse.data);
        }
        
        // Fetch student payments
        const paymentsResponse = await userAxiosInstance.get(`students/${user.id}/payments/`);
        setPayments(paymentsResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching student fee details:', err);
        setError('Failed to load fee details. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchStudentFeeDetails();
  }, [user]);
  
  const getInstallmentStatus = (installmentId) => {
    const payment = payments.find(p => p.installment_id === installmentId);
    return payment ? payment.status : 'pending';
  };
  
  const getPaymentDate = (installmentId) => {
    const payment = payments.find(p => p.installment_id === installmentId);
    return payment?.payment_date ? new Date(payment.payment_date).toLocaleDateString() : '-';
  };
  
  const getNextDueInstallment = () => {
    if (!installments.length) return null;
    
    for (const installment of installments) {
      if (getInstallmentStatus(installment.id) === 'pending') {
        return installment;
      }
    }
    
    return null;
  };
  
  const calculatePaymentSummary = () => {
    let totalAmount = 0;
    let paidAmount = 0;
    let pendingAmount = 0;
    
    installments.forEach(installment => {
      const amount = Number(installment.amount);
      totalAmount += amount;
      
      if (getInstallmentStatus(installment.id) === 'paid') {
        paidAmount += amount;
      } else {
        pendingAmount += amount;
      }
    });
    
    return { totalAmount, paidAmount, pendingAmount };
  };
  
  const nextDue = getNextDueInstallment();
  const summary = calculatePaymentSummary();
  
  if (loading) {
    return <div className="loading">Loading fee details...</div>;
  }
  
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  
  if (!feeDetails) {
    return (
      <div className="no-fee-structure">
        <h2>No Fee Structure Assigned</h2>
        <p>You don't have any fee structure assigned yet. Please contact the administration.</p>
      </div>
    );
  }

  return (
    <div className="student-fee-details">
      <h1><FaMoneyBillWave /> My Fee Details</h1>
      
      <div className="fee-structure-info">
        <h2>{feeDetails.fee_structure_name}</h2>
        <div className="course-name">{feeDetails.course_name}</div>
      </div>
      
      <div className="payment-summary">
        <div className="summary-card total">
          <div className="amount">₹{summary.totalAmount}</div>
          <div className="label">Total Fee</div>
        </div>
        <div className="summary-card paid">
          <div className="amount">₹{summary.paidAmount}</div>
          <div className="label">Paid Amount</div>
        </div>
        <div className="summary-card pending">
          <div className="amount">₹{summary.pendingAmount}</div>
          <div className="label">Pending Amount</div>
        </div>
      </div>
      
      {nextDue && (
        <div className="next-payment">
          <h3><FaCalendarAlt /> Next Payment Due</h3>
          <div className="next-due-card">
            <div className="due-info">
              <div className="due-description">{nextDue.description}</div>
              <div className="due-amount">₹{nextDue.amount}</div>
            </div>
            <div className="due-date">
              Due by: {new Date(nextDue.due_date).toLocaleDateString()}
            </div>
          </div>
        </div>
      )}
      
      <div className="installments-section">
        <h3>Payment Schedule</h3>
        <div className="installments-table">
          <table>
            <thead>
              <tr>
                <th>No.</th>
                <th>Description</th>
                <th>Amount (₹)</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Payment Date</th>
              </tr>
            </thead>
            <tbody>
              {installments.map((installment, index) => (
                <tr 
                  key={installment.id} 
                  className={`installment-row ${getInstallmentStatus(installment.id)}`}
                >
                  <td>{index + 1}</td>
                  <td>{installment.description || `Installment ${index + 1}`}</td>
                  <td>₹{installment.amount}</td>
                  <td>{new Date(installment.due_date).toLocaleDateString()}</td>
                  <td className={`status ${getInstallmentStatus(installment.id)}`}>
                    {getInstallmentStatus(installment.id) === 'paid' ? (
                      <><FaCheck /> Paid</>
                    ) : (
                      <><FaTimes /> Pending</>
                    )}
                  </td>
                  <td>{getPaymentDate(installment.id)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="payment-instructions">
        <h3>Payment Instructions</h3>
        <p>
          Please make your payments before the due date to avoid late fees. 
          For any payment-related queries, contact the accounts department.
        </p>
        <div className="contact-info">
          <div>Email: accounts@miracleinstitute.com</div>
          <div>Phone: +91-9876543210</div>
        </div>
      </div>
    </div>
  );
};

export default StudentFeeDetails;