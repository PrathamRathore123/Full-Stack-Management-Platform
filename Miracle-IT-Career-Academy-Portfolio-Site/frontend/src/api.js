import axios from 'axios';

// Base API URL
const API_URL = 'https://miracle-it-career-academy-portfolio-site.onrender.com';

// Add request interceptor to log and fix malformed URLs
const fixMalformedUrl = (url) => {
  // Fix URLs that end with /:1 or similar patterns
  return url.replace(/\/:\d+$/, '/');
};

// Single axios instance for all API calls
const userAxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Expires': '0',
  },
});

// Admin axios instance for admin-specific operations
const adminAxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Expires': '0',
  },
});

// Add a request interceptor to include Authorization header if access token is available
userAxiosInstance.interceptors.request.use(
  config => {
    // Fix malformed URLs
    config.url = fixMalformedUrl(config.url);
    
    const token = localStorage.getItem('access');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    } else {
      // If no access token, redirect to login or handle accordingly
      console.warn('No access token found, redirecting to login');
      // window.location.href = '/login'; // Uncomment if redirect desired
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add the same interceptor to the admin instance
adminAxiosInstance.interceptors.request.use(
  config => {
    // Fix malformed URLs
    config.url = fixMalformedUrl(config.url);
    
    const token = localStorage.getItem('access');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token refresh
userAxiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if error is due to an expired token
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      console.log('401 error detected, attempting token refresh');
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh');
        if (!refreshToken) {
          console.log('No refresh token available, redirecting to login');
          // You might want to redirect to login page here
          // window.location.href = '/login';
          return Promise.reject(error);
        }

        // Try to get a new token
        const response = await axios.post(`${API_URL}token/refresh/`, {
          refresh: refreshToken
        });

        if (response.status === 200) {
          console.log('Token refresh successful');
          
          // Store the new access token
          localStorage.setItem('access', response.data.access);

          // Update the authorization header for all future requests
          userAxiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
          adminAxiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
          
          // Update the failed request with the new token and retry it
          originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;
          return userAxiosInstance(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        
        // Clear tokens from storage on refresh failure
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        
        // You might want to redirect to login page here
        // window.location.href = '/login';
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Add the same response interceptor to the admin instance
adminAxiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if error is due to an expired token
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      console.log('401 error detected, attempting token refresh');
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh');
        if (!refreshToken) {
          console.log('No refresh token available, redirecting to login');
          return Promise.reject(error);
        }

        // Try to get a new token
        const response = await axios.post(`${API_URL}token/refresh/`, {
          refresh: refreshToken
        });

        if (response.status === 200) {
          console.log('Token refresh successful');
          
          // Store the new access token
          localStorage.setItem('access', response.data.access);

          // Update the authorization header for all future requests
          userAxiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
          adminAxiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
          
          // Update the failed request with the new token and retry it
          originalRequest.headers['Authorization'] = `Bearer ${response.data.access}`;
          return adminAxiosInstance(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        
        // Clear tokens from storage on refresh failure
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// User API (login, signup, etc.)
export const loginUser = async (credentials) => {
  try {
    const response = await userAxiosInstance.post('login/', credentials);
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

// Create admin account
export const createAdminAccount = async (adminData) => {
  try {
    const response = await userAxiosInstance.post('create-admin/', adminData);
    return response.data;
  } catch (error) {
    console.error('Error creating admin account:', error);
    throw error;
  }
};

// Create faculty account (admin only)
export const createFacultyAccount = async (facultyData) => {
  try {
    const response = await userAxiosInstance.post('create-faculty/', facultyData);
    return response.data;
  } catch (error) {
    console.error('Error creating faculty account:', error);
    throw error;
  }
};

// Create student account (faculty only)
export const createStudentAccount = async (studentData) => {
  try {
    const response = await userAxiosInstance.post('create-student/', studentData);
    return response.data;
  } catch (error) {
    console.error('Error creating student account:', error);
    throw error;
  }
};

// Enroll student in a course (faculty only)
export const enrollStudentInCourse = async (enrollmentData) => {
  try {
    const response = await userAxiosInstance.post('enroll-student/', enrollmentData);
    return response.data;
  } catch (error) {
    console.error('Error enrolling student in course:', error);
    throw error;
  }
};

// Delete a single student by ID
export const deleteStudent = async (studentId) => {
  try {
    // Try the direct student endpoint
    const response = await userAxiosInstance.delete(`students/${studentId}/`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting student ${studentId}:`, error);
    throw error;
  }
};

// Batch APIs
export const fetchBatches = async () => {
  try {
    const response = await userAxiosInstance.get('batches/');
    return response.data;
  } catch (error) {
    console.error('Error fetching batches:', error);
    throw error;
  }
};

export const createBatch = async (batchData) => {
  try {
    const response = await userAxiosInstance.post('batches/', batchData);
    return response.data;
  } catch (error) {
    console.error('Error creating batch:', error);
    throw error;
  }
};

// Create batch for a specific course
export const createCourseBatch = async (batchData) => {
  try {
    const response = await userAxiosInstance.post('course-batches/', batchData);
    return response.data;
  } catch (error) {
    console.error('Error creating course batch:', error);
    throw error;
  }
};

export const updateBatch = async (batchId, batchData) => {
  try {
    const response = await userAxiosInstance.put(`batches/${batchId}/`, batchData);
    return response.data;
  } catch (error) {
    console.error(`Error updating batch ${batchId}:`, error);
    throw error;
  }
};

export const deleteBatch = async (batchId) => {
  try {
    const response = await userAxiosInstance.delete(`batches/${batchId}/`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting batch ${batchId}:`, error);
    throw error;
  }
};

// Student APIs with batch filter
export const fetchStudents = async (batchId = null) => {
  try {
    let url = 'students/';
    if (batchId) {
      url += `?batch_id=${batchId}`;
      console.log(`Fetching students with batch_id=${batchId}`);
    }
    const response = await userAxiosInstance.get(url);
    console.log(`Fetched ${response.data.length} students:`, response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching students:', error);
    throw error;
  }
};

// Fetch students for a specific batch using the new endpoint
export const fetchBatchStudents = async (batchId) => {
  try {
    const response = await userAxiosInstance.get(`batches/${batchId}/students/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching students for batch ${batchId}:`, error);
    throw error;
  }
};

export const updateStudent = async (studentId, studentData) => {
  try {
    const response = await userAxiosInstance.put(`students/${studentId}/`, studentData);
    return response.data;
  } catch (error) {
    console.error(`Error updating student ${studentId}:`, error);
    throw error;
  }
};

// Courses API - Public endpoint that doesn't require authentication
export const fetchCourses = async () => {
  try {
    // Use axios directly to avoid authentication requirements
    const response = await axios.get(`${API_URL}courses/courses/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
};

// Create a new course (admin and faculty only)
export const createCourse = async (courseData) => {
  try {
    const response = await adminAxiosInstance.post('courses/create-course/', courseData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating course:', error);
    throw error;
  }
};

// Fetch latest courses for workshops page
export const fetchLatestCourses = async () => {
  try {
    // Use userAxiosInstance to include authentication headers
    const response = await userAxiosInstance.get(`courses/latest-courses/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching latest courses:', error);
    throw error;
  }
};

export const fetchCourseById = async (id) => {
  try {
    // Use axios directly to avoid authentication requirements
    const response = await axios.get(`${API_URL}courses/course/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching course with id ${id}:`, error);
    throw error;
  }
};

// Videos API
export const fetchVideosByCourseId = async (courseId) => {
  try {
    // Try with authentication first
    const response = await userAxiosInstance.get(`courses/videos/?course_id=${courseId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching videos for course ${courseId}:`, error);
    // If authentication fails, try without authentication for public preview
    try {
      const publicResponse = await axios.get(`${API_URL}courses/videos/?course_id=${courseId}`);
      return publicResponse.data;
    } catch (publicError) {
      console.error(`Error fetching videos publicly for course ${courseId}:`, publicError);
      throw error; // Throw original error
    }
  }
};

// Syllabus API
export const fetchCourseSyllabus = async (courseId) => {
  try {
    // Try with authentication first
    const response = await userAxiosInstance.get(`courses/syllabus/?course_id=${courseId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching syllabus for course ${courseId}:`, error);
    // If authentication fails, try without authentication for public preview
    try {
      const publicResponse = await axios.get(`${API_URL}courses/syllabus/?course_id=${courseId}`);
      return publicResponse.data;
    } catch (publicError) {
      console.error(`Error fetching syllabus publicly for course ${courseId}:`, publicError);
      throw error; // Throw original error
    }
  }
};

export const fetchSyllabusItems = async (moduleId) => {
  try {
    const response = await userAxiosInstance.get(`courses/syllabus-items/?module_id=${moduleId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching syllabus items for module ${moduleId}:`, error);
    throw error;
  }
};

// Create and update syllabus (for faculty and admin)
export const createCourseSyllabus = async (syllabusData) => {
  try {
    const response = await adminAxiosInstance.post('courses/syllabus/', syllabusData);
    return response.data;
  } catch (error) {
    console.error('Error creating course syllabus:', error);
    throw error;
  }
};

export const updateCourseSyllabus = async (moduleId, syllabusData) => {
  try {
    const response = await adminAxiosInstance.put(`courses/syllabus/${moduleId}/`, syllabusData);
    return response.data;
  } catch (error) {
    console.error(`Error updating syllabus module ${moduleId}:`, error);
    throw error;
  }
};

export const createSyllabusItem = async (itemData) => {
  try {
    const response = await adminAxiosInstance.post('courses/syllabus-items/', itemData);
    return response.data;
  } catch (error) {
    console.error('Error creating syllabus item:', error);
    throw error;
  }
};

export const updateSyllabusItem = async (itemId, itemData) => {
  try {
    const response = await adminAxiosInstance.put(`courses/syllabus-items/${itemId}/`, itemData);
    return response.data;
  } catch (error) {
    console.error(`Error updating syllabus item ${itemId}:`, error);
    throw error;
  }
};

// Course Enrollment API
export const enrollInCourse = async (courseId) => {
  try {
    const response = await userAxiosInstance.post('courses/enroll/', { course_id: courseId });
    return response.data;
  } catch (error) {
    console.error(`Error enrolling in course ${courseId}:`, error);
    throw error;
  }
};

// Get user enrollments
export const getUserEnrollments = async () => {
  try {
    const response = await userAxiosInstance.get('courses/user-enrollments/');
    return response.data;
  } catch (error) {
    console.error('Error fetching user enrollments:', error);
    return [];
  }
};

// Student Fee Management API
export const getStudentFeeDetails = async () => {
  try {
    // Use the dedicated student details endpoint
    const response = await userAxiosInstance.get('student-fees/details/');
    
    if (response.data) {
      return response.data;
    }
    
    throw new Error('No fee data returned from server');
  } catch (error) {
    console.error('Error fetching student fee details:', error);
    throw error;
  }
};

export const makePayment = async (paymentData) => {
  try {
    // Use userAxiosInstance which already has authentication headers
    const response = await userAxiosInstance.post('fee-payments/make-payment/', paymentData);
    return response.data;
  } catch (error) {
    console.error('Error making payment:', error);
    throw error;
  }
};

// Create Razorpay order
export const createRazorpayOrder = async (amount) => {
  try {
    const response = await userAxiosInstance.post('fee-payments/create-razorpay-order/', { amount });
    
    // Check if this is demo mode
    if (response.data.demo_mode) {
      console.warn('Demo mode: Razorpay integration disabled');
      // Return demo data without making actual Razorpay calls
      return {
        ...response.data,
        demo_mode: true
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
};

// Initialize payment (alias for createRazorpayOrder for backward compatibility)
export const initializePayment = async (amount) => {
  try {
    return await createRazorpayOrder(amount);
  } catch (error) {
    console.error('Error initializing payment:', error);
    throw error;
  }
};

// Verify fee payment (alias for verifyRazorpayPayment)
export const verifyFeePayment = async (paymentData) => {
  try {
    const response = await verifyRazorpayPayment(paymentData);
    return { success: true, ...response };
  } catch (error) {
    console.error('Error verifying fee payment:', error);
    return { success: false, error: error.message };
  }
};

// Verify Razorpay payment
export const verifyRazorpayPayment = async (paymentData) => {
  try {
    const response = await userAxiosInstance.post('fee-payments/verify-razorpay-payment/', paymentData);
    return response.data;
  } catch (error) {
    console.error('Error verifying Razorpay payment:', error);
    throw error;
  }
};

// Demo payment function for testing
export const simulatePayment = async (amount) => {
  try {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create a mock payment record
    const mockPaymentData = {
      amount: amount,
      payment_mode: 'demo',
      transaction_id: `demo_${Date.now()}`,
      status: 'success',
      remarks: 'Demo payment - no actual transaction'
    };
    
    const response = await userAxiosInstance.post('fee-payments/make-payment/', mockPaymentData);
    return response.data;
  } catch (error) {
    console.error('Error simulating payment:', error);
    throw error;
  }
};

// Simple demo payment endpoint
export const makeDemoPayment = async (amount) => {
  try {
    const response = await userAxiosInstance.post('fee-payments/demo-payment/', { amount });
    return response.data;
  } catch (error) {
    console.error('Error making demo payment:', error);
    throw error;
  }
};

// Download receipt
export const downloadReceipt = async (receiptNumber) => {
  try {
    const response = await userAxiosInstance.get(`receipt/${receiptNumber}/`, {
      responseType: 'blob'
    });
    return response;
  } catch (error) {
    console.error('Error downloading receipt:', error);
    throw error;
  }
};



// Check enrollment status for a specific course
export const checkEnrollmentStatus = async (courseId) => {
  try {
    const response = await userAxiosInstance.get(`courses/check-enrollment/${courseId}/`);
    return response.data;
  } catch (error) {
    console.error(`Error checking enrollment status for course ${courseId}:`, error);
    throw error;
  }
};

// Payment Gateway API
export const createPaymentOrder = async (courseId) => {
  try {
    const response = await userAxiosInstance.post('courses/create-payment-order/', { course_id: courseId });
    return response.data;
  } catch (error) {
    console.error(`Error creating payment order for course ${courseId}:`, error);
    throw error;
  }
};

export const verifyPayment = async (paymentData) => {
  try {
    const response = await userAxiosInstance.post('courses/verify-payment/', paymentData);
    return response.data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};

// Course Enquiry API
export const submitCourseEnquiry = async (enquiryData) => {
  try {
    const response = await axios.post(`${API_URL}courses/submit-enquiry/`, enquiryData);
    return response.data;
  } catch (error) {
    console.error('Error submitting course enquiry:', error);
    throw error;
  }
};

// Notifications API
export const fetchUserNotifications = async () => {
  try {
    // Get notifications from user dashboard endpoint
    const response = await userAxiosInstance.get('dashboard/');
    return response.data.notifications;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

// Fetch course update notifications
export const fetchCourseUpdateNotifications = async () => {
  try {
    // Return empty array to avoid errors
    return [];
  } catch (error) {
    console.error('Error fetching course update notifications:', error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await userAxiosInstance.post(`notifications/${notificationId}/read/`);
    return response.data;
  } catch (error) {
    console.error(`Error marking notification ${notificationId} as read:`, error);
    throw error;
  }
};

// Certificates API
export const fetchCertificates = async () => {
  try {
    const response = await userAxiosInstance.get('certificates/');
    return response.data;
  } catch (error) {
    console.error('Error fetching certificates:', error);
    throw error;
  }
};

// Workshops API
export const fetchWorkshops = async () => {
  try {
    // Use axios directly to avoid authentication requirements
    const response = await axios.get(`${API_URL}workshops/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching workshops:', error);
    throw error;
  }
};

// Create a new workshop (admin and faculty only)
export const createWorkshop = async (workshopData) => {
  try {
    const response = await adminAxiosInstance.post('workshops/', workshopData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating workshop:', error);
    throw error;
  }
};

// Workshop Registration API
export const registerForWorkshop = async (registrationData) => {
  try {
    const response = await axios.post(`${API_URL}workshop-registrations/`, registrationData);
    return response.data;
  } catch (error) {
    console.error('Error registering for workshop:', error);
    throw error;
  }
};

// Fetch workshop registrations (admin and faculty only)
export const fetchWorkshopRegistrations = async () => {
  try {
    const response = await userAxiosInstance.get('workshop-registrations/');
    return response.data;
  } catch (error) {
    console.error('Error fetching workshop registrations:', error);
    throw error;
  }
};

// Fetch faculty workshop registrations
export const fetchFacultyWorkshopRegistrations = async () => {
  try {
    const response = await userAxiosInstance.get('faculty/workshop-registrations/');
    return response.data;
  } catch (error) {
    console.error('Error fetching faculty workshop registrations:', error);
    // Return empty array to prevent frontend errors
    return [];
  }
};

// Fetch past workshop attendees
export const fetchPastWorkshopAttendees = async () => {
  try {
    const response = await userAxiosInstance.get('faculty/past-workshop-attendees/');
    return response.data;
  } catch (error) {
    console.error('Error fetching past workshop attendees:', error);
    // Return empty array to prevent frontend errors
    return [];
  }
};

// Fee Structure API
export const createFeeStructure = async (feeStructureData) => {
  try {
    const response = await adminAxiosInstance.post('fee-structures/', feeStructureData);
    return response.data;
  } catch (error) {
    console.error('Error creating fee structure:', error);
    throw error;
  }
};

export const updateFeeStructure = async (id, feeStructureData) => {
  try {
    const response = await adminAxiosInstance.put(`fee-structures/${id}/`, feeStructureData);
    return response.data;
  } catch (error) {
    console.error(`Error updating fee structure ${id}:`, error);
    throw error;
  }
};

export const addFeeInstallment = async (feeStructureId, installmentData) => {
  try {
    // Add description field if missing
    if (!installmentData.description) {
      installmentData.description = `Installment ${installmentData.sequence}`;
    }
    
    const response = await adminAxiosInstance.post(`fee-structures/${feeStructureId}/add_installment/`, {
      fee_structure: feeStructureId,
      amount: installmentData.amount,
      due_date: installmentData.due_date,
      sequence: installmentData.sequence
    });
    return response.data;
  } catch (error) {
    console.error(`Error adding installment to fee structure ${feeStructureId}:`, error);
    throw error;
  }
};

export const fetchFeeStructures = async () => {
  try {
    const response = await adminAxiosInstance.get('fee-structures/');
    // Ensure numeric values for fee fields
    return response.data.map(structure => ({
      ...structure,
      registration_fee: parseFloat(structure.registration_fee) || 0,
      tuition_fee: parseFloat(structure.tuition_fee) || 0,
      total_amount: parseFloat(structure.total_amount) || 0
    }));
  } catch (error) {
    console.error('Error fetching fee structures:', error);
    throw error;
  }
};

export const fetchFeeStructureById = async (id) => {
  try {
    const response = await adminAxiosInstance.get(`fee-structures/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching fee structure ${id}:`, error);
    throw error;
  }
};

export const fetchFeeInstallments = async (feeStructureId) => {
  try {
    const response = await adminAxiosInstance.get(`fee-structures/${feeStructureId}/installments/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching installments for fee structure ${feeStructureId}:`, error);
    throw error;
  }
};

// Quizzes API
export const fetchQuizzes = async () => {
  try {
    const response = await userAxiosInstance.get('courses/quizzes/');
    return response.data;
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    throw error;
  }
};

export const fetchCourseSpecificBatches = async (courseId) => {
  try {
    const response = await userAxiosInstance.get(`batches/?course=${courseId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching batches for course ${courseId}:`, error);
    throw error;
  }
};

export const checkAttendanceStatus = async () => {
  try {
    const response = await userAxiosInstance.get('attendance-status/');
    return response.data;
  } catch (error) {
    console.error('Error checking attendance status:', error);
    // Return default status to avoid errors
    return { is_present: false };
  }
};

// Chatbot API
export const chatAPI = {
  sendMessage: async (message) => {
    try {
      const response = await userAxiosInstance.post('chatbot/chat/', { message });
      return response;
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw error;
    }
  },
  
  sendVoiceMessage: async (text) => {
    try {
      const response = await userAxiosInstance.post('chatbot/voice-chat/', { text });
      return response;
    } catch (error) {
      console.error('Error sending voice message:', error);
      throw error;
    }
  },
  
  getQuickActions: async () => {
    try {
      const response = await userAxiosInstance.get('chatbot/quick-actions/');
      return response;
    } catch (error) {
      console.error('Error fetching quick actions:', error);
      throw error;
    }
  }
};

export { userAxiosInstance, adminAxiosInstance };
