// Simple test to check API endpoints
const testAPI = async () => {
  try {
    console.log('Testing fee-reports endpoint...');
    const response = await fetch('http://localhost:8000/api/fee-reports/');
    const data = await response.json();
    console.log('Fee reports data:', data);
    
    console.log('Testing courses endpoint...');
    const coursesResponse = await fetch('http://localhost:8000/api/courses/courses/');
    const coursesData = await coursesResponse.json();
    console.log('Courses count:', coursesData.length);
    
  } catch (error) {
    console.error('API test failed:', error);
  }
};

// Run test when page loads
if (typeof window !== 'undefined') {
  window.testAPI = testAPI;
  console.log('Run testAPI() in console to test endpoints');
}