import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaMoneyBillWave, FaSave, FaTimes } from 'react-icons/fa';
import './AdminDashboard.css';

const RecordPayment = () => {
  const { feeId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentFee, setStudentFee] = useState(null);
  const [formData, setFormData] = useState({
    amount: 0,
    payment_date: new Date().toISOString().split('T')[0],
    payment_mode: 'cash',
    transaction_id: '',
    remarks: ''
  });

  useEffect(() => {
    const fetchStudentFee = async () => {
      try {
        const response = await axios.get(`/api/student-fees/${feeId}/`);
        setStudentFee(response.data);
        
        // Set default amount to remaining balance
        const remainingBalance = response.data.total_amount - response.data.amount_paid;
        setFormData(prev => ({ ...prev, amount: remainingBalance }));
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching student fee:', err);
        setError('Failed to load student fee details');
        setLoading(false);
      }
    };

    fetchStudentFee();
  }, [feeId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`/api/student-fees/${feeId}/add_payment/`, {
        amount: Number(formData.amount),
        payment_date: formData.payment_date,
        payment_mode: formData.payment_mode,
        transaction_id: formData.transaction_id,
        remarks: formData.remarks
      });

      alert('Payment recorded successfully!');
      navigate(`/admin/student-fees/${feeId}/payments`);
    } catch (err) {
      console.error('Error recording payment:', err);
      alert('Failed to record payment. Please try again.');
      setLoading(false);
    }
  };

  if (loading && !studentFee) {
    return <div className="loading">Loading student fee details...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  const remainingBalance = studentFee ? studentFee.total_amount - studentFee.amount_paid : 0;

  return (
    <div className="dashboard-container">
      <h1><FaMoneyBillWave /> Record Payment</h1>
      
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
        </div>
      )}
      
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="amount">Payment Amount (₹)</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              min="1"
              max={remainingBalance}
              required
            />
            {formData.amount > remainingBalance && (
              <p className="error-text">Amount cannot exceed remaining balance</p>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="payment_date">Payment Date</label>
            <input
              type="date"
              id="payment_date"
              name="payment_date"
              value={formData.payment_date}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="payment_mode">Payment Mode</label>
            <select
              id="payment_mode"
              name="payment_mode"
              value={formData.payment_mode}
              onChange={handleChange}
              required
            >
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="online">Online Payment</option>
              <option value="check">Check</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="transaction_id">Transaction ID/Reference Number</label>
            <input
              type="text"
              id="transaction_id"
              name="transaction_id"
              value={formData.transaction_id}
              onChange={handleChange}
              placeholder="Optional for cash payments"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="remarks">Remarks</label>
            <textarea
              id="remarks"
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              placeholder="Any additional notes about this payment"
              rows="3"
            ></textarea>
          </div>
          
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => navigate(`/admin/student-fees/${feeId}/payments`)}>
              <FaTimes /> Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading || formData.amount <= 0 || formData.amount > remainingBalance}
            >
              <FaSave /> {loading ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordPayment;