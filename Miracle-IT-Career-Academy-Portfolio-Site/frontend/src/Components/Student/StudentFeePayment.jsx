import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStudentFeeDetails, createRazorpayOrder, verifyRazorpayPayment } from '../../api';
import './StudentFeePayment.css';
import { FaMoneyBillWave, FaSpinner, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const StudentFeePayment = () => {
  const [feeData, setFeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  
  const navigate = useNavigate();
  const { courseId } = useParams();
  
  useEffect(() => {
    const fetchFeeDetails = async () => {
      try {
        setLoading(true);
        const data = await getStudentFeeDetails();
        setFeeData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching fee details:', err);
        setError('Failed to load fee details. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchFeeDetails();
  }, []);
  
  const handlePayNow = async (amount) => {
    try {
      setPaymentProcessing(true);
      setPaymentError(null);
      
      // Create Razorpay order
      const orderData = await createRazorpayOrder(amount);
      
      // Check if this is demo mode
      if (orderData.demo_mode || orderData.key_id === 'demo_key_only') {
        // Demo mode - use simple demo payment
        setTimeout(async () => {
          try {
            const { makeDemoPayment } = require('../../api');
            const result = await makeDemoPayment(amount);
            
            setPaymentSuccess(true);
            // Refresh fee data after successful payment
            const updatedFeeData = await getStudentFeeDetails();
            setFeeData(updatedFeeData);
            
          } catch (err) {
            console.error('Demo payment error:', err);
            setPaymentError('Demo payment failed. Please try again.');
          } finally {
            setPaymentProcessing(false);
          }
        }, 2000); // Simulate 2 second processing time
        return;
      }
      
      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
      
      script.onload = () => {
        const options = {
          key: orderData.key_id,
          amount: orderData.amount, // Amount already in paise from backend
          currency: orderData.currency || 'INR',
          name: 'Course Fee Payment',
          description: 'Fee payment',
          order_id: orderData.order_id,
          prefill: {
            name: orderData.student_name,
            email: orderData.student_email,
            contact: orderData.student_contact
          },
          handler: async function(response) {
            try {
              // Verify payment
              const verificationData = {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                amount: orderData.amount
              };
              
              const result = await verifyRazorpayPayment(verificationData);
              
              setPaymentSuccess(true);
              // Refresh fee data after successful payment
              const updatedFeeData = await getStudentFeeDetails();
              setFeeData(updatedFeeData);
              
            } catch (err) {
              console.error('Payment verification error:', err);
              setPaymentError('Payment verification failed. Please contact support.');
            } finally {
              setPaymentProcessing(false);
            }
          },
          modal: {
            ondismiss: function() {
              setPaymentProcessing(false);
            }
          }
        };
        
        const razorpayInstance = new window.Razorpay(options);
        razorpayInstance.open();
      };
      
      script.onerror = () => {
        setPaymentError('Failed to load payment gateway. Please try again later.');
        setPaymentProcessing(false);
      };
      
    } catch (err) {
      console.error('Error initializing payment:', err);
      setPaymentError('Failed to initialize payment. Please try again later.');
      setPaymentProcessing(false);
    }
  };
  
  if (loading) {
    return (
      <div className="fee-payment-container">
        <div className="loading-spinner">
          <FaSpinner className="spinner" />
          <p>Loading fee details...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="fee-payment-container">
        <div className="error-message">
          <FaTimesCircle />
          <p>{error}</p>
          <button onClick={() => navigate('/student/dashboard')}>Back to Dashboard</button>
        </div>
      </div>
    );
  }
  
  // Filter courses if courseId is provided
  const coursesToDisplay = courseId 
    ? feeData?.courses.filter(course => course.id.toString() === courseId)
    : feeData?.courses;
  
  return (
    <div className="fee-payment-container">
      <h1><FaMoneyBillWave /> Fee Payment</h1>
      
      <div className="fee-summary">
        <div className="summary-card">
          <h3>Total Fee</h3>
          <p className="amount">₹{feeData?.total_amount?.toLocaleString()}</p>
        </div>
        <div className="summary-card">
          <h3>Amount Paid</h3>
          <p className="amount">₹{feeData?.amount_paid?.toLocaleString()}</p>
        </div>
        <div className="summary-card">
          <h3>Balance Due</h3>
          <p className="amount">₹{feeData?.due_amount?.toLocaleString()}</p>
        </div>
        <div className="summary-card">
          <h3>Status</h3>
          <p className={`status ${feeData?.status}`}>
            {feeData?.status === 'paid' ? 'Paid' : 
             feeData?.status === 'partially_paid' ? 'Partially Paid' : 'Unpaid'}
          </p>
        </div>
      </div>
      
      {feeData?.due_amount > 0 && (
        <div className="quick-payment">
          <button 
            className="pay-full-btn"
            onClick={() => handlePayNow(feeData.due_amount)}
            disabled={paymentProcessing}
          >
            {paymentProcessing ? (
              <>
                <FaSpinner className="spinner" /> Processing...
              </>
            ) : `Pay Full Amount ₹${feeData.due_amount.toLocaleString()}`}
          </button>
        </div>
      )}
      
      {paymentSuccess && (
        <div className="success-message">
          <FaCheckCircle />
          <p>Payment successful! Your fee record has been updated.</p>
        </div>
      )}
      
      {paymentError && (
        <div className="error-message">
          <FaTimesCircle />
          <p>{paymentError}</p>
        </div>
      )}
      
      <div className="courses-section">
        <h2>Course Fee Details</h2>
        
        {coursesToDisplay && coursesToDisplay.length > 0 ? (
          coursesToDisplay.map(course => (
            <div key={course.id} className="course-fee-card">
              <h3>{course.title}</h3>
              <div className="fee-structure-details">
                <p><strong>Fee Structure:</strong> {course.fee_structure.name}</p>
                <p><strong>Registration Fee:</strong> ₹{course.fee_structure.registration_fee.toLocaleString()}</p>
                <p><strong>Tuition Fee:</strong> ₹{course.fee_structure.tuition_fee.toLocaleString()}</p>
                <p><strong>Total Amount:</strong> ₹{course.fee_structure.total_amount.toLocaleString()}</p>
              </div>
              
              <div className="installments-section">
                <h4>Installments</h4>
                <table className="installments-table">
                  <thead>
                    <tr>
                      <th>No.</th>
                      <th>Amount</th>
                      <th>Due Date</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {course.fee_structure.installments.map(installment => (
                      <tr key={installment.id} className={installment.is_paid ? 'paid-row' : ''}>
                        <td>{installment.sequence}</td>
                        <td>₹{installment.amount.toLocaleString()}</td>
                        <td>{new Date(installment.due_date).toLocaleDateString()}</td>
                        <td>
                          <span className={`status-badge ${installment.is_paid ? 'paid' : 'unpaid'}`}>
                            {installment.is_paid ? 'Paid' : 'Unpaid'}
                          </span>
                        </td>
                        <td>
                          {!installment.is_paid ? (
                            <button 
                              className="pay-now-btn"
                              onClick={() => handlePayNow(installment.amount)}
                              disabled={paymentProcessing}
                            >
                              {paymentProcessing ? (
                                <>
                                  <FaSpinner className="spinner" /> Processing...
                                </>
                              ) : 'Pay Now'}
                            </button>
                          ) : (
                            <span className="payment-date">
                              Paid on {new Date(installment.payment_date).toLocaleDateString()}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        ) : (
          <p className="no-courses">No course fee details available.</p>
        )}
      </div>
      
      <div className="recent-payments">
        <h2>Recent Payments</h2>
        {feeData?.recent_payments && feeData.recent_payments.length > 0 ? (
          <table className="payments-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Transaction ID</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {feeData.recent_payments.map(payment => (
                <tr key={payment.id}>
                  <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
                  <td>₹{payment.amount.toLocaleString()}</td>
                  <td>{payment.payment_method}</td>
                  <td>{payment.transaction_id}</td>
                  <td>
                    <span className={`status-badge ${payment.status}`}>
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-payments">No recent payments found.</p>
        )}
      </div>
    </div>
  );
};

export default StudentFeePayment;