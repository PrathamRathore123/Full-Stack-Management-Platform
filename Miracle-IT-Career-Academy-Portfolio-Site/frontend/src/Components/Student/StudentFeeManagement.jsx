import React, { useState, useEffect } from 'react';
import { 
  FaMoneyBillWave, 
  FaDownload, 
  FaExclamationTriangle, 
  FaCreditCard,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
  FaChartLine,
  FaReceipt,
  FaUniversity,
  FaShieldAlt
} from 'react-icons/fa';
import './StudentFeeManagement.css';
import { userAxiosInstance } from '../../api';

// Load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const StudentFeeManagement = () => {
  const [feeData, setFeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);

  const fetchFeeDetails = async () => {
    try {
      setLoading(true);
      
      // Load Razorpay script
      await loadRazorpayScript();
      
      // Import the API function instead of using axios directly
      const { getStudentFeeDetails } = require('../../api');
      const feeData = await getStudentFeeDetails();
      
      console.log('Fee data received:', feeData);
      setFeeData(feeData);
      
      // Set default payment amount to due amount
      if (feeData && feeData.due_amount) {
        setPaymentAmount(feeData.due_amount);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error in fetchFeeDetails:', err);
      if (err.response) {
        if (err.response.status === 404) {
          setError('No fee structure assigned to your course. Please contact the admin.');
        } else if (err.response.status === 401) {
          setError('Please login to view fee details.');
        } else {
          setError(err.response.data?.error || 'Failed to load fee details.');
        }
      } else {
        setError('Failed to load fee details. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeDetails();
    
    // Set up periodic refresh to get real-time updates
    const interval = setInterval(() => {
      fetchFeeDetails();
    }, 60000); // Refresh every minute
    
    return () => clearInterval(interval);
  }, []);

  const handleDownloadReceipt = async (receiptNumber) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/users/fee-payments/download-receipt/?receipt_number=${receiptNumber}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/pdf')) {
          // Handle PDF download
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = `receipt-${receiptNumber}.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          
          // Show success message
          alert('Receipt downloaded successfully!');
        } else {
          // Handle JSON response (fallback)
          const data = await response.json();
          console.log('Receipt data:', data);
          alert('Receipt data retrieved. PDF generation not available.');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to download receipt');
      }
    } catch (error) {
      console.error('Error downloading receipt:', error);
      alert(`Failed to download receipt: ${error.message}`);
    }
  };

  const handlePayNow = () => {
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setProcessingPayment(true);
    
    try {
      // Import the API functions
      const { makePayment, getStudentFeeDetails, createRazorpayOrder, verifyRazorpayPayment } = require('../../api');
      
      // For Razorpay integration
      if (paymentMethod === 'razorpay') {
        try {
          // Create Razorpay order
          const orderData = await createRazorpayOrder(paymentAmount);
          
          // Check if this is demo mode
          if (orderData.demo_mode || orderData.key_id === 'demo_key_only') {
            // Demo mode - simulate payment
            const paymentData = {
              student_fee: feeData.fee_details.id,
              amount: paymentAmount,
              payment_mode: 'online',
              transaction_id: `DEMO-${Date.now()}`,
              status: 'success',
              remarks: 'Demo payment - no actual transaction'
            };
            
            const paymentResponse = await makePayment(paymentData);
            await fetchFeeDetails();
            
            setShowPaymentModal(false);
            setProcessingPayment(false);
            
            const downloadReceipt = window.confirm(
              `Payment successful! Receipt: ${paymentResponse.payment.receipt_number}\n\n(Demo Mode - No actual payment processed)\n\nWould you like to download the receipt now?`
            );
            
            if (downloadReceipt) {
              await handleDownloadReceipt(paymentResponse.payment.receipt_number);
            }
            return;
          }
          
          // Initialize Razorpay
          const options = {
            key: orderData.key_id,
            amount: orderData.amount,
            currency: orderData.currency,
            name: 'ERP Portal',
            description: 'Fee Payment',
            order_id: orderData.order_id,
            prefill: {
              name: orderData.student_name,
              email: orderData.student_email,
              contact: orderData.student_contact
            },
            theme: {
              color: '#3399cc'
            },
            handler: async function (response) {
              try {
                // Verify payment
                const verificationData = {
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                  amount: orderData.amount
                };
                
                const verifyResponse = await verifyRazorpayPayment(verificationData);
                
                // Refresh fee data
                await fetchFeeDetails();
                
                setShowPaymentModal(false);
                setProcessingPayment(false);
                
                // Show success message with download option
                const downloadReceipt = window.confirm(
                  `Payment successful! Receipt: ${verifyResponse.receipt_number}\n\nWould you like to download the receipt now?`
                );
                
                if (downloadReceipt) {
                  await handleDownloadReceipt(verifyResponse.receipt_number);
                }
                
              } catch (verifyError) {
                console.error('Payment verification error:', verifyError);
                alert('Payment completed but verification failed. Please contact admin.');
                setProcessingPayment(false);
              }
            },
            modal: {
              ondismiss: function() {
                setProcessingPayment(false);
              }
            }
          };
          
          // Check if Razorpay is loaded
          if (window.Razorpay) {
            const rzp = new window.Razorpay(options);
            rzp.open();
          } else {
            alert('Payment gateway failed to load. Please refresh the page and try again.');
            setProcessingPayment(false);
          }
          
        } catch (orderError) {
          console.error('Order creation error:', orderError);
          alert('Failed to create payment order. Please try again.');
          setProcessingPayment(false);
        }
        
      } else if (paymentMethod === 'bank_transfer') {
        // For bank transfer, record as pending payment
        const paymentData = {
          student_fee: feeData.fee_details.id,
          amount: paymentAmount,
          payment_mode: 'bank_transfer',
          transaction_id: '',
          status: 'pending',
          remarks: 'Bank transfer initiated through student portal'
        };
        
        // Make API call to record payment
        const paymentResponse = await makePayment(paymentData);
        console.log('Payment response:', paymentResponse);
        
        // Refresh fee data
        await fetchFeeDetails();
        
        setShowPaymentModal(false);
        setProcessingPayment(false);
        
        const receiptNumber = paymentResponse.payment.receipt_number;
        alert(`Payment request submitted successfully!\nReference: ${receiptNumber}\n\nYour payment will be verified by the admin.`);
      }
    } catch (err) {
      console.error('Payment error:', err);
      alert('Payment failed. Please try again or contact the admin.');
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading fee details...</div>;
  }

  if (error) {
    return (
      <div className="error-message">
        <FaExclamationTriangle />
        <p>{error}</p>
      </div>
    );
  }

  if (!feeData) {
    return (
      <div className="no-data-message">
        <FaExclamationTriangle />
        <p>No fee records found. Please contact the admin.</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="page-header">
        <h1><FaMoneyBillWave /> Fee Management</h1>
        <p className="page-subtitle">Manage your fee payments and track your financial progress</p>
        <button onClick={fetchFeeDetails} className="refresh-btn" title="Refresh Data">
          🔄 Refresh
        </button>
      </div>
      
      <div className="fee-summary">
        <div className="fee-card">
          <div className="card-icon">
            <FaChartLine />
          </div>
          <h3>Total Fees</h3>
          <p className="fee-amount">₹{feeData.total_amount.toLocaleString()}</p>
          <div className="card-footer">
            <span className="card-label">Course Fee Structure</span>
          </div>
        </div>
        <div className="fee-card">
          <div className="card-icon success">
            <FaCheckCircle />
          </div>
          <h3>Amount Paid</h3>
          <p className="fee-amount">₹{feeData.amount_paid.toLocaleString()}</p>
          <div className="card-footer">
            <span className="card-label">Successfully Processed</span>
          </div>
        </div>
        <div className="fee-card">
          <div className="card-icon warning">
            <FaExclamationCircle />
          </div>
          <h3>Amount Due</h3>
          <p className="fee-amount">₹{feeData.due_amount.toLocaleString()}</p>
          <div className="card-footer">
            <span className="card-label">Pending Payment</span>
          </div>
        </div>
        <div className="fee-card">
          <div className="card-icon info">
            <FaCalendarAlt />
          </div>
          <h3>Next Due Date</h3>
          <p className="fee-date">
            {feeData.next_due_date 
              ? new Date(feeData.next_due_date).toLocaleDateString() 
              : 'No upcoming due date'}
          </p>
          <div className="card-footer">
            <span className="card-label">Payment Schedule</span>
          </div>
        </div>
      </div>
      
      <div className="fee-details-section">
        <h2><FaReceipt /> Fee Structure Details</h2>
        <div className="fee-structure-details">
          <p>
            <strong>Structure Name:</strong> 
            <span>{feeData.fee_details?.fee_structure_name || 'N/A'}</span>
          </p>
          <p>
            <strong>Payment Status:</strong> 
            <span className={`status-badge ${feeData.fee_details?.status || 'unknown'}`}>
              {(feeData.fee_details?.status || 'unknown').replace('_', ' ')}
            </span>
          </p>
          <p>
            <strong>Assigned Date:</strong> 
            <span>{feeData.fee_details?.assigned_date ? new Date(feeData.fee_details.assigned_date).toLocaleDateString() : 'N/A'}</span>
          </p>
          <p>
            <strong>Payment Progress:</strong>
            <span>
              {feeData.total_amount > 0 
                ? `${Math.round((feeData.amount_paid / feeData.total_amount) * 100)}% Complete`
                : '0% Complete'
              }
            </span>
          </p>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{
                width: feeData.total_amount > 0 
                  ? `${(feeData.amount_paid / feeData.total_amount) * 100}%` 
                  : '0%'
              }}
            ></div>
          </div>
          <div className="progress-labels">
            <span>₹0</span>
            <span>₹{feeData.total_amount.toLocaleString()}</span>
          </div>
        </div>
      </div>
      
      <div className="installments-section">
        <h2><FaClock /> Installment Schedule</h2>
        <table className="installments-table">
          <thead>
            <tr>
              <th>Installment</th>
              <th>Amount</th>
              <th>Due Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {feeData.installments && feeData.installments.length > 0 ? (
              feeData.installments.map((installment, index) => {
                // Calculate if installment is paid based on amount_paid
                const isPaid = index === 0 ? 
                  feeData.amount_paid >= installment.amount : 
                  feeData.amount_paid >= feeData.installments.slice(0, index + 1).reduce((sum, inst) => sum + inst.amount, 0);
                
                // Check if overdue
                const isOverdue = !isPaid && new Date(installment.due_date) < new Date();
                
                return (
                  <tr key={installment.id}>
                    <td>Installment {installment.sequence || index + 1}</td>
                    <td>₹{installment.amount.toLocaleString()}</td>
                    <td>{new Date(installment.due_date).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge ${isPaid ? 'paid' : isOverdue ? 'overdue' : 'pending'}`}>
                        {isPaid ? 'Paid' : isOverdue ? 'Overdue' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="4" className="no-data">No installment schedule available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="payment-history-section">
        <h2><FaReceipt /> Payment History</h2>
        <table className="payment-history-table">
          <thead>
            <tr>
              <th>Receipt No.</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Mode</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {feeData.payment_history && feeData.payment_history.length > 0 ? (
              feeData.payment_history.map(payment => (
                <tr key={payment.id}>
                  <td>{payment.receipt_number}</td>
                  <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
                  <td>₹{payment.amount.toLocaleString()}</td>
                  <td>{payment.payment_mode.replace('_', ' ')}</td>
                  <td>
                    <span className={`status-badge ${payment.status}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn-icon" 
                      onClick={() => handleDownloadReceipt(payment.receipt_number)}
                      title="Download Receipt"
                    >
                      <FaDownload />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-data">No payment records found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {feeData.due_amount > 0 && (
        <div className="payment-options">
          <h2><FaCreditCard /> Make Payment</h2>
          <p className="payment-description">
            Secure and convenient payment options available. Choose your preferred method below.
          </p>
          <button className="btn-primary" onClick={handlePayNow}>
            <FaShieldAlt /> Pay Securely Now
          </button>
          <div className="payment-features">
            <div className="feature">
              <FaShieldAlt className="feature-icon" />
              <span>256-bit SSL Encryption</span>
            </div>
            <div className="feature">
              <FaCreditCard className="feature-icon" />
              <span>Multiple Payment Methods</span>
            </div>
            <div className="feature">
              <FaCheckCircle className="feature-icon" />
              <span>Instant Confirmation</span>
            </div>
          </div>
        </div>
      )}
      
      {showPaymentModal && (
        <div className="modal-overlay">
          <div className="payment-modal">
            <h2>Make Payment</h2>
            <form onSubmit={handlePaymentSubmit}>
              <div className="form-group">
                <label>Amount to Pay (₹)</label>
                <input 
                  type="number" 
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  min="1"
                  max={feeData.due_amount} 
                  required 
                />
                <p className="helper-text">Maximum amount: ₹{feeData.due_amount.toLocaleString()}</p>
              </div>
              
              <div className="form-group">
                <label>Payment Method</label>
                <select 
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  required
                >
                  <option value="">Select Payment Method</option>
                  <option value="razorpay">💳 Online Payment (Credit/Debit Card/UPI/Net Banking)</option>
                  <option value="bank_transfer">🏦 Bank Transfer</option>
                </select>
              </div>
              
              {paymentMethod === 'razorpay' && (
                <div className="payment-info">
                  <div className="payment-info-header">
                    <FaShieldAlt className="security-icon" />
                    <h3>Secure Online Payment</h3>
                  </div>
                </div>
              )}
              
              {paymentMethod === 'bank_transfer' && (
                <div className="bank-details">
                  <div className="bank-details-header">
                    <FaUniversity className="bank-icon" />
                    <h3>Bank Account Details</h3>
                  </div>
                  <div className="bank-info">
                    <div className="bank-detail-item">
                      <strong>Account Name:</strong>
                      <span>ERP Portal</span>
                    </div>
                    <div className="bank-detail-item">
                      <strong>Account Number:</strong>
                      <span>1234567890</span>
                    </div>
                    <div className="bank-detail-item">
                      <strong>IFSC Code:</strong>
                      <span>ABCD0001234</span>
                    </div>
                    <div className="bank-detail-item">
                      <strong>Bank Name:</strong>
                      <span>Example Bank</span>
                    </div>
                  </div>
                  <div className="bank-note">
                    <FaExclamationCircle className="note-icon" />
                    <p>After making the payment, please submit this form. Your payment will be verified by the admin.</p>
                  </div>
                </div>
              )}
              
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowPaymentModal(false)}>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={processingPayment || !paymentMethod || paymentAmount <= 0 || paymentAmount > feeData.due_amount}
                >
                  {processingPayment ? (
                    <>
                      <FaClock className="spinning" />
                      Processing...
                    </>
                  ) : paymentMethod === 'razorpay' ? (
                    <>
                      <FaShieldAlt />
                      Pay with Razorpay
                    </>
                  ) : (
                    <>
                      <FaUniversity />
                      Submit Payment Request
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentFeeManagement;