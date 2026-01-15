# Hostel Smart Entry - Backend API

Backend server for the Hostel Smart Entry System built with Node.js, Express, and MongoDB.

## Features

- JWT-based authentication
- Role-based access control (Student, Warden, Security)
- Leave request management
- QR code verification system
- RESTful API endpoints

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)

## Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hostel_db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

3. Start MongoDB (if running locally):
```bash
# macOS with Homebrew
brew services start mongodb-community

# Or use MongoDB Atlas connection string in MONGODB_URI
```

4. Run the server:
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Leave Requests

- `GET /api/requests` - Get all requests (filtered by role)
- `GET /api/requests/:id` - Get single request
- `POST /api/requests` - Create new request (student only)
- `PUT /api/requests/:id` - Update request (warden: approve/reject, security: movement)
- `DELETE /api/requests/:id` - Delete request (student: own pending only)

## Default Users

You can register users via the API or create them directly in MongoDB. The frontend expects these default credentials:

- **Student**: student@example.com / student123
- **Warden**: warden@example.com / warden123
- **Security**: security@example.com / security123

## Database Models

### User
- email (unique)
- password (hashed)
- name
- role (student, warden, security)

### LeaveRequest
- studentEmail
- fromDate
- toDate
- status (pending, approved, rejected)
- movement (in, out)
- approvedAt
- approvedBy (User reference)

## Security

- Passwords are hashed using bcrypt
- JWT tokens expire after 7 days
- Role-based access control on all endpoints
- CORS enabled for frontend communication

