import React from 'react';
import './StudentDashboard.css';

const StudentFees = () => {
  return (
    <div className="dashboard-container">
      <h1>Fee Management</h1>
      <div className="dashboard-content">
        <p>View and manage your fee payments.</p>
        <div className="fee-summary">
          <div className="fee-card">
            <h3>Total Fees</h3>
            <p className="fee-amount">₹45,000</p>
          </div>
          <div className="fee-card">
            <h3>Paid</h3>
            <p className="fee-amount">₹30,000</p>
          </div>
          <div className="fee-card">
            <h3>Due</h3>
            <p className="fee-amount">₹15,000</p>
          </div>
          <div className="fee-card">
            <h3>Next Due Date</h3>
            <p className="fee-date">15 Aug, 2023</p>
          </div>
        </div>
        
        <div className="fee-history">
          <h3>Payment History</h3>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Receipt No.</th>
                <th>Amount</th>
                <th>Mode</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>10 Jan, 2023</td>
                <td>REC-001</td>
                <td>₹15,000</td>
                <td>Online</td>
                <td className="status-success">Paid</td>
              </tr>
              <tr>
                <td>15 Apr, 2023</td>
                <td>REC-002</td>
                <td>₹15,000</td>
                <td>Online</td>
                <td className="status-success">Paid</td>
              </tr>
              <tr>
                <td>15 Aug, 2023</td>
                <td>REC-003</td>
                <td>₹15,000</td>
                <td>-</td>
                <td className="status-pending">Pending</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="payment-options">
          <h3>Make Payment</h3>
          <button className="btn-primary">Pay Now</button>
        </div>
      </div>
    </div>
  );
};

export default StudentFees;