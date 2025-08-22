import React, { useState, useEffect } from 'react';
import { fetchUserNotifications, markNotificationAsRead } from '../../api';
import './Notifications.css';
import { FaBell, FaCheckCircle, FaBook } from 'react-icons/fa';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getNotifications = async () => {
      try {
        setLoading(true);
        const data = await fetchUserNotifications();
        setNotifications(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load notifications');
        setLoading(false);
        console.error('Error fetching notifications:', err);
      }
    };

    getNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(notifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, is_read: true } 
          : notification
      ));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const getNotificationIcon = (title) => {
    if (title.includes('Syllabus') || title.includes('Content')) {
      return <FaBook className="notification-icon course-icon" />;
    }
    return <FaBell className="notification-icon" />;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return <div className="notifications-loading">Loading notifications...</div>;
  }

  if (error) {
    return <div className="notifications-error">{error}</div>;
  }

  return (
    <div className="notifications-container">
      <h2 className="notifications-title">
        <FaBell className="title-icon" /> Notifications
      </h2>

      {notifications.length === 0 ? (
        <div className="no-notifications">
          <p>You don't have any notifications yet.</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`notification-item ${notification.is_read ? 'read' : 'unread'}`}
            >
              <div className="notification-content">
                {getNotificationIcon(notification.title)}
                <div className="notification-text">
                  <h3 className="notification-title">{notification.title}</h3>
                  <p className="notification-message">{notification.message}</p>
                  <span className="notification-time">{formatDate(notification.created_at)}</span>
                </div>
              </div>
              {!notification.is_read && (
                <button 
                  className="mark-read-btn"
                  onClick={() => handleMarkAsRead(notification.id)}
                  title="Mark as read"
                >
                  <FaCheckCircle />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;