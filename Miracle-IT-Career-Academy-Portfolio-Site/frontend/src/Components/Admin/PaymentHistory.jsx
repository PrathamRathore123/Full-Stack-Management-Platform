import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FaMoneyBillWave, FaPlus, FaDownload, FaFileInvoice } from 'react-icons/fa';
import './AdminDashboard.css';

const PaymentHistory = () => {
  const { feeId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentFee, setStudentFee] = useState(null);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch student fee details
        const feeResponse = await axios.get(`/api/student-fees/${feeId}/`);
        setStudentFee(feeResponse.data);
        
        // Fetch payment history
        const paymentsResponse = await axios.get(`/api/student-fees/${feeId}/payments/`);
        setPayments(paymentsResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching payment data:', err);
        setError('Failed to load payment history');
        setLoading(false);
      }
    };

    fetchData();
  }, [feeId]);

  const handleGenerateInvoice = async (paymentId) => {
    try {
      const response = await axios.get(`/api/fee-payments/${paymentId}/download-receipt/`, {
        responseType: 'blob'
      });
      
      // Create a download link for the PDF
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${paymentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error generating receipt:', err);
      alert('Failed to generate receipt. Please try again.');
    }
  };

  if (loading) {
    return <div className="loading">Loading payment history...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  const remainingBalance = studentFee ? studentFee.total_amount - studentFee.amount_paid : 0;

  return (
    <div className="dashboard-container">
      <h1><FaMoneyBillWave /> Payment History</h1>
      
      {studentFee && (
        <div className="student-fee-summary">
          <h2>Student: {studentFee.student_name}</h2>
          <div className="fee-details">
            <div className="detail-item">
              <span className="label">Fee Structure:</span>
              <span className="value">{studentFee.fee_structure_name}</span>
            </div>
            <div className="detail-item">
              <span className="label">Total Amount:</span>
              <span className="value">₹{studentFee.total_amount.toLocaleString()}</span>
            </div>
            <div className="detail-item">
              <span className="label">Amount Paid:</span>
              <span className="value">₹{studentFee.amount_paid.toLocaleString()}</span>
            </div>
            <div className="detail-item">
              <span className="label">Remaining Balance:</span>
              <span className="value">₹{remainingBalance.toLocaleString()}</span>
            </div>
            <div className="detail-item">
              <span className="label">Status:</span>
              <span className={`status-badge ${studentFee.status}`}>
                {studentFee.status.replace('_', ' ')}
              </span>
            </div>
          </div>
          
          {remainingBalance > 0 && (
            <Link to={`/admin/student-fees/${feeId}/record-payment`} className="btn-primary">
              <FaPlus /> Record New Payment
            </Link>
          )}
        </div>
      )}
      
      <div className="payment-history">
        <h3>Payment Transactions</h3>
        
        <table>
          <thead>
            <tr>
              <th>Receipt No.</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Mode</th>
              <th>Transaction ID</th>
              <th>Status</th>
              <th>Recorded By</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.length > 0 ? (
              payments.map(payment => (
                <tr key={payment.id}>
                  <td>{payment.receipt_number}</td>
                  <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
                  <td>₹{payment.amount.toLocaleString()}</td>
                  <td>{payment.payment_mode.replace('_', ' ')}</td>
                  <td>{payment.transaction_id || '-'}</td>
                  <td>
                    <span className={`status-badge ${payment.status}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td>{payment.recorded_by_name || '-'}</td>
                  <td className="actions">
                    <button 
                      className="btn-icon" 
                      onClick={() => handleGenerateInvoice(payment.id)}
                      title="Download Receipt"
                    >
                      <FaDownload />
                    </button>
                    <button 
                      className="btn-icon" 
                      onClick={() => window.open(`/admin/fee-payments/${payment.id}/invoice`, '_blank')}
                      title="View Invoice"
                    >
                      <FaFileInvoice />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="no-data">No payment records found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="action-buttons">
        <button className="btn-secondary" onClick={() => navigate('/admin/fee-management')}>
          Back to Fee Management
        </button>
      </div>
    </div>
  );
};

export default PaymentHistory;