# Cleanup Notes - Unnecessary Components

## Files to Remove or Consolidate

### 1. Redundant Fee Viewset Files
- `backend_fix.py` - Contains duplicate StudentFeeViewSet code
- `backend_fix_updated.py` - Updated version of the same viewset
- **Action**: These should be integrated into the main `users/views_fees.py` file

### 2. Utility Scripts (Development Only)
- `check_counts.py` - Database count checker (keep for development)
- `debug_dashboard.py` - Debug utilities (keep for development)
- `test_api_endpoints.py` - API testing script (keep for development)

### 3. Security Issues to Address
- **Hardcoded credentials** in `backend/settings.py`:
  - Database credentials (MySQL)
  - Razorpay test keys
  - Gemini API key
- **Action**: Move all sensitive data to environment variables

### 4. Redundant API Endpoints
- Multiple payment endpoint variations
- Duplicate fee management endpoints
- **Action**: Consolidate endpoints for cleaner API structure

### 5. Demo Payment Functions
- Multiple demo payment implementations in `frontend/src/api.js`
- **Action**: Streamline to single demo mode implementation

## Recommended Cleanup Steps

1. **Integrate fee viewset code** into main application
2. **Remove hardcoded credentials** and use environment variables
3. **Consolidate duplicate API endpoints**
4. **Remove or archive** development-only scripts from production
5. **Update documentation** to reflect cleaned-up structure

## Files Safe to Keep
- `backend_student_fees_api.py` - Appears to be a legitimate API extension
- `fix_course_assignments.py` - Useful management command
- `add_student_payments.py` - Useful management command
- Other management commands in `users/management/commands/`

## Security Checklist
- [ ] Replace hardcoded database credentials
- [ ] Replace Razorpay test keys with environment variables
- [ ] Secure Gemini API key
- [ ] Remove any sensitive data from version control
- [ ] Implement proper CORS configuration for production
