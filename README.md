# Hostel Smart Entry - Full Stack Application

A complete hostel management system with smart entry/exit tracking using QR codes. This project consists of a React frontend and Node.js/Express backend with MongoDB.

## Features

- **Student Panel**: Submit leave requests and view QR passes
- **Warden Panel**: Review and approve/reject student leave requests
- **Security Panel**: Scan QR codes to mark student entry/exit
- **JWT Authentication**: Secure login system with role-based access
- **Real-time Updates**: Movement status updates automatically when QR codes are scanned

## Project Structure

```
hostel final/
├── backend/          # Node.js/Express API server
│   ├── models/      # MongoDB models (User, LeaveRequest)
│   ├── routes/      # API routes (auth, requests)
│   ├── middleware/  # Authentication middleware
│   └── scripts/     # Utility scripts (seed users)
├── src/             # React frontend
│   ├── App.jsx      # Main app component with routing
│   ├── api.js       # API client utilities
│   ├── StudentPanel.jsx
│   ├── WardenPanel.jsx
│   └── SecurityPanel.jsx
└── package.json     # Frontend dependencies
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
cp .env.example .env
```

4. Edit `.env` with your configuration:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hostel_db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

5. Start MongoDB (if running locally):
```bash
# macOS with Homebrew
brew services start mongodb-community

# Or use MongoDB Atlas connection string in MONGODB_URI
```

6. Seed default users:
```bash
npm run seed
```

7. Start the backend server:
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the project root:
```bash
cd ..
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional, defaults to localhost:5000):
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173` (or another port if 5173 is busy)

## Default Login Credentials

After running the seed script, you can login with:

- **Student**: student@example.com / student123
- **Warden**: warden@example.com / warden123
- **Security**: security@example.com / security123

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

## Technology Stack

### Frontend
- React 19
- React Router DOM
- Vite
- QR Code libraries (qrcode.react, html5-qrcode)

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

## Development Notes

- The frontend uses JWT tokens stored in localStorage for authentication
- All API requests include the JWT token in the Authorization header
- MongoDB models use Mongoose schemas with validation
- Role-based access control is enforced on both frontend and backend

## Production Deployment

1. Set `NODE_ENV=production` in backend `.env`
2. Use a strong `JWT_SECRET` in production
3. Configure CORS to allow only your frontend domain
4. Use MongoDB Atlas or a managed MongoDB service
5. Build the frontend: `npm run build`
6. Deploy backend to a service like Heroku, Railway, or AWS
7. Deploy frontend to Vercel, Netlify, or similar

## License

ISC

