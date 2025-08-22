# Integrated Dashboard API

## Overview
This API provides a single endpoint to access all data needed for the frontend, including:
- User profile information
- Courses and course details
- Course enrollments
- Workshops
- Certificates
- Notifications
- Quizzes

## Endpoints

### GET /api/dashboard/
Returns all data needed for the frontend dashboard in a single API call.

**Authentication Required**: Yes (JWT Token)

**Response Format**:
```json
{
  "user": {
    "id": 1,
    "username": "example",
    "email": "example@example.com",
    "role": "student",
    "student_profile": {
      "id": 1,
      "enrollment_id": "ENRL23001",
      "date_of_birth": "2000-01-01"
    }
  },
  "courses": [
    {
      "id": 1,
      "title": "Course Title",
      "description": "Course Description",
      "image": "https://example.com/image.jpg",
      "duration": "8 weeks",
      "level": "Beginner",
      "created_at": "2023-01-01T00:00:00Z",
      "internship_duration": "4 weeks",
      "is_certified": true,
      "last_updated": "2023-01-01T00:00:00Z",
      "syllabus_modules": [
        {
          "id": 1,
          "title": "Module 1",
          "order": 1,
          "items": [
            {
              "id": 1,
              "title": "Item 1",
              "description": "Item Description",
              "order": 1
            }
          ],
          "last_updated": "2023-01-01T00:00:00Z"
        }
      ],
      "videos": [
        {
          "id": 1,
          "title": "Video 1",
          "url": "https://example.com/video.mp4",
          "order": 1
        }
      ]
    }
  ],
  "enrollments": [
    {
      "id": 1,
      "course": {
        "id": 1,
        "title": "Course Title",
        "description": "Course Description",
        "image": "https://example.com/image.jpg",
        "duration": "8 weeks",
        "level": "Beginner",
        "created_at": "2023-01-01T00:00:00Z",
        "internship_duration": "4 weeks",
        "is_certified": true,
        "last_updated": "2023-01-01T00:00:00Z",
        "syllabus_modules": [...],
        "videos": [...]
      },
      "enrolled_date": "2023-01-01T00:00:00Z"
    }
  ],
  "workshops": [
    {
      "id": 1,
      "title": "Workshop Title",
      "description": "Workshop Description",
      "image": "https://example.com/image.jpg",
      "date": "2023-01-01",
      "location": "Online",
      "available_seats": 50
    }
  ],
  "certificates": [
    {
      "id": 1,
      "title": "Certificate Title",
      "description": "Certificate Description",
      "image": "https://example.com/image.jpg",
      "duration": "4 weeks",
      "level": "Intermediate"
    }
  ],
  "notifications": [
    {
      "id": 1,
      "title": "Notification Title",
      "message": "Notification Message",
      "created_at": "2023-01-01T00:00:00Z",
      "is_read": false
    }
  ],
  "quizzes": [
    {
      "id": 1,
      "title": "Quiz Title",
      "description": "Quiz Description",
      "image": "https://example.com/image.jpg",
      "questions": 10,
      "time": "30 minutes",
      "difficulty": "Medium"
    }
  ]
}
```

### POST /api/dashboard/
Handles various actions through a single endpoint.

**Authentication Required**: Yes (JWT Token)

**Request Format**:
```json
{
  "action": "enroll_course",
  "course_id": 1
}
```

**Supported Actions**:
- `enroll_course`: Enroll the current user in a course
  - Required parameters: `course_id`
- `mark_notification_read`: Mark a notification as read
  - Required parameters: `notification_id`

**Response Format**:
```json
{
  "message": "Successfully enrolled in course"
}
```

## Usage
The integrated dashboard API is designed to reduce the number of API calls needed by the frontend. Instead of making separate calls to different endpoints, the frontend can make a single call to `/api/dashboard/` to get all the data it needs.

For actions like enrolling in a course or marking a notification as read, the frontend can make a POST request to the same endpoint with the appropriate action and parameters.

## Note
All the previous API endpoints are still available and functional. This new endpoint is an addition to the existing API, not a replacement.