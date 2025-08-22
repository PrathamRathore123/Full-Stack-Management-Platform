import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userAxiosInstance } from '../../api';
import { FaPlus, FaEdit, FaTrash, FaEye, FaMoneyBillWave } from 'react-icons/fa';
import './AdminDashboard.css';

const FeeStructureList = () => {
  const [feeStructures, setFeeStructures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeeStructures = async () => {
      try {
        setLoading(true);
        const response = await userAxiosInstance.get('fee-structures/');
        setFeeStructures(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching fee structures:', err);
        setError('Failed to load fee structures');
        setLoading(false);
      }
    };

    fetchFeeStructures();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this fee structure?')) {
      try {
        await userAxiosInstance.delete(`fee-structures/${id}/`);
        setFeeStructures(feeStructures.filter(fee => fee.id !== id));
      } catch (err) {
        console.error('Error deleting fee structure:', err);
        alert('Failed to delete fee structure');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading fee structures...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="page-header">
        <h1><FaMoneyBillWave /> Fee Structures</h1>
        <button 
          className="create-btn"
          onClick={() => navigate('/admin/fee-structures/create')}
        >
          <FaPlus /> Create New Fee Structure
        </button>
      </div>

      {feeStructures.length > 0 ? (
        <div className="fee-structures-list">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Course</th>
                <th>Registration Fee</th>
                <th>Tuition Fee</th>
                <th>Total Amount</th>
                <th>Installments</th>
                <th>Students</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {feeStructures.map(fee => (
                <tr key={fee.id}>
                  <td>{fee.name}</td>
                  <td>{fee.course?.title}</td>
                  <td>₹{fee.registration_fee}</td>
                  <td>₹{fee.tuition_fee}</td>
                  <td className="highlighted">₹{fee.total_amount}</td>
                  <td>{fee.installments}</td>
                  <td>{fee.student_count || 0}</td>
                  <td className="actions">
                    <button 
                      className="action-btn view-btn"
                      onClick={() => navigate(`/admin/fee-structures/${fee.id}/details`)}
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                    <button 
                      className="action-btn edit-btn"
                      onClick={() => navigate(`/admin/fee-structures/${fee.id}`)}
                      title="Edit Fee Structure"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      className="action-btn delete-btn"
                      onClick={() => handleDelete(fee.id)}
                      title="Delete Fee Structure"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <p>No fee structures found. Create your first fee structure to get started.</p>
          <button 
            className="create-btn"
            onClick={() => navigate('/admin/fee-structures/create')}
          >
            <FaPlus /> Create Fee Structure
          </button>
        </div>
      )}
    </div>
  );
};

export default FeeStructureList;