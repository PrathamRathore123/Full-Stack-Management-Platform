# Full Stack Management Platform

A comprehensive Django + React web application for managing an IT training academy with student management, course enrollment, fee tracking, attendance system, and AI-powered chatbot.

## 🚀 Project Overview

This is a full-stack web application designed for IT training academies to manage:
- **Student Management**: Enrollment, batches, attendance tracking
- **Course Management**: Course catalog, syllabus, video content, quizzes
- **Fee Management**: Fee structures, payment processing, receipts
- **AI Chatbot**: Gemini AI-powered assistant for student queries
- **Role-based Access**: Admin, Faculty, and Student portals
- **Payment Integration**: Razorpay payment gateway

## 🏗️ Architecture

### Backend (Django REST Framework)
- **Framework**: Django 5.0 + Django REST Framework
- **Database**: MySQL (configured in settings)
- **Authentication**: JWT (JSON Web Tokens)
- **API**: RESTful API with comprehensive endpoints
- **AI Integration**: Google Gemini AI for chatbot
- **Payment**: Razorpay integration

### Frontend (React)
- **Framework**: React 19.1.0 with React Router
- **State Management**: Context API + Local Storage
- **UI Libraries**: Framer Motion, React Icons, GSAP
- **Charts**: ECharts for data visualization
- **API Client**: Axios with interceptors

## 📁 Project Structure

```
miracle-it-career-academy-portfolio-site/
├── backend/
│   ├── backend/                 # Django project settings
│   │   ├── settings.py          # Main configuration
│   │   ├── urls.py             # Root URL routing
│   │   ├── views.py            # Payment views
│   │   └── wsgi.py, asgi.py    # Deployment config
│   ├── users/                  # User management app
│   │   ├── models.py           # User, Student, Faculty models
│   │   ├── views.py            # Authentication views
│   │   ├── views_fees.py       # Fee management views
│   │   ├── views_projects.py   # Project management views
│   │   └── urls.py            # User API endpoints
│   ├── courses/                # Course management app
│   │   ├── models.py           # Course, Syllabus, Video models
│   │   ├── views.py            # Course views
│   │   └── urls.py            # Course API endpoints
│   ├── chatbot/                # AI chatbot app
│   │   ├── gemini_service.py   # Gemini AI integration
│   │   ├── views.py           # Chatbot endpoints
│   │   └── urls.py            # Chatbot API
│   ├── media/                  # Uploaded media files
│   ├── requirements.txt        # Python dependencies
│   ├── runtime.txt             # Python version (3.12.3)
│   └── setup.py               # Package configuration
├── frontend/
│   ├── src/
│   │   ├── Components/         # React components
│   │   │   ├── Admin/         # Admin dashboard components
│   │   │   ├── Faculty/       # Faculty dashboard components
│   │   │   ├── Student/       # Student dashboard components
│   │   │   ├── Chatbot/       # Chatbot interface
│   │   │   └── Layout/        # Layout components
│   │   ├── api.js             # API service functions
│   │   ├── App.js             # Main React app
│   │   └── index.js           # Entry point
│   ├── package.json           # Node.js dependencies
│   └── public/                # Static assets
└── utility_scripts/           # Management scripts
    ├── backend_fix.py         # Fee viewset fixes
    ├── backend_fix_updated.py # Updated fee viewset
    ├── check_counts.py        # Database count checker
    └── debug_dashboard.py     # Debug utilities
```

## 🔧 Installation & Setup

### Prerequisites
- Python 3.12.3
- Node.js 16+
- MySQL database
- Razorpay account (for payments)
- Google Gemini API key (for chatbot)

### Backend Setup
1. Navigate to backend directory:
   ```bash
   cd miracle-it-career-academy-portfolio-site/backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Configure database in `backend/settings.py`:
   ```python
   DATABASES = {
       'default': {
           'ENGINE': 'django.db.backends.mysql',
           'NAME': 'Miracle',
           'USER': 'root',
           'PASSWORD': 'your_password',
           'HOST': 'localhost',
           'PORT': '3306',
       }
   }
   ```

4. Apply migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. Create superuser:
   ```bash
   python manage.py createsuperuser
   ```

6. Run development server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup
1. Navigate to frontend directory:
   ```bash
   cd miracle-it-career-academy-portfolio-site/frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm start
   ```

## 🌐 API Endpoints

### Authentication
- `POST /api/login/` - User login (JWT)
- `POST /api/token/refresh/` - Refresh JWT token
- `POST /api/register/` - User registration

### User Management
- `GET /api/profile/` - User profile
- `POST /api/create-admin/` - Create admin account
- `POST /api/create-faculty/` - Create faculty account
- `POST /api/create-student/` - Create student account

### Course Management
- `GET /api/courses/courses/` - List all courses
- `GET /api/courses/course/{id}/` - Get course details
- `POST /api/courses/enroll/` - Enroll in course
- `GET /api/courses/videos/` - Course videos
- `GET /api/courses/syllabus/` - Course syllabus

### Fee Management
- `GET /api/student-fees/` - Student fee records
- `POST /api/fee-payments/make-payment/` - Make payment
- `GET /api/receipt/{receipt_number}/` - Download receipt

### Chatbot
- `POST /api/chatbot/chat/` - Send message to chatbot
- `GET /api/chatbot/quick-actions/` - Get quick actions

## 🎯 Key Features

### 1. Multi-role System
- **Admin**: Full system access, user management, fee management
- **Faculty**: Course management, student tracking, attendance
- **Student**: Course access, fee payment, progress tracking

### 2. Course Management
- Course catalog with categories
- YouTube video integration
- Syllabus management
- Quiz system
- Enrollment tracking

### 3. Fee Management System
- Flexible fee structures
- Installment planning
- Razorpay payment integration
- Receipt generation
- Payment history

### 4. Attendance System
- Daily attendance tracking
- Student attendance reports
- Faculty attendance management

### 5. AI Chatbot
- Gemini AI integration
- Multi-language support (English/Hindi)
- Student data context awareness
- Quick actions for common queries

### 6. Project Management
- Student project submissions
- Faculty grading system
- Project leaderboard
- Technology stack tracking

## 🔐 Security Features

- JWT authentication
- Role-based access control
- CORS configuration
- Secure payment processing
- Input validation
- SQL injection protection

## 🚀 Deployment

### Backend Deployment (Render)
1. Connect GitHub repository
2. Set environment variables:
   - `DATABASE_URL`
   - `SECRET_KEY`
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
   - `GEMINI_API_KEY`
3. Deploy from main branch

### Frontend Deployment (Vercel)
1. Connect GitHub repository
2. Set environment variables:
   - `REACT_APP_API_URL`
3. Deploy from main branch

## 📊 Database Schema

The application uses a comprehensive database schema with:
- **Users**: CustomUser, Student, Faculty, Admin models
- **Courses**: Course, Video, Syllabus, Quiz models
- **Fees**: FeeStructure, StudentFee, FeePayment models
- **Attendance**: Attendance records
- **Projects**: Project, ProjectSubmission models

## 🛠️ Utility Scripts

The project includes several utility scripts:
- `check_counts.py` - Check student counts per course/batch
- `backend_fix.py` - Fee management viewset fixes
- `debug_dashboard.py` - Debug utilities

## ⚠️ Unnecessary/Redundant Components

### Files that can be removed:
1. **Duplicate fee viewset files**: 
   - `backend_fix.py` and `backend_fix_updated.py` contain similar code
   - These appear to be development/testing files that should be integrated into the main codebase

2. **Redundant API endpoints**: 
   - Some endpoints have multiple versions (e.g., fee payment endpoints)
   - Could be consolidated for cleaner API structure

3. **Demo payment functions**: 
   - Multiple demo payment implementations in API service
   - Should be streamlined for production

### Security Considerations:
1. **Hardcoded credentials** in settings.py should be moved to environment variables
2. **Razorpay test keys** should be replaced with production keys
3. **Gemini API key** should be properly secured

## 🔄 Environment Variables Required

```bash
# Database
DATABASE_URL=mysql://user:password@host:port/database

# Django
SECRET_KEY=your-secret-key
DEBUG=False

# Payment Gateway
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret

# AI Services
GEMINI_API_KEY=your-gemini-api-key

# Frontend
REACT_APP_API_URL=https://your-backend-domain.com
```

## 📞 Support

For technical support or questions about this project, please refer to the API documentation or contact the development team.

## 📄 License

This project is proprietary software developed for Miracle IT Career Academy. All rights reserved.

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: Production Ready

