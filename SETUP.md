# Setup Guide for macOS ARM64 (Apple Silicon)

## Prerequisites Check

First, verify you have Node.js installed:

```bash
node --version
npm --version
```

If not installed, install Node.js using Homebrew:
```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node
```

## Step 1: Install MongoDB (if not already installed)

### Option A: Using Homebrew (Recommended for local development)

```bash
# Install MongoDB Community Edition
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community
```

### Option B: Use MongoDB Atlas (Cloud - No local installation needed)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account and cluster
3. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/hostel_db`)
4. Use this in your `.env` file instead of local MongoDB

## Step 2: Navigate to Project Directory

```bash
cd ~/Documents/hostel\ final
```

## Step 3: Setup Backend

```bash
# Navigate to backend directory
cd backend

# Install backend dependencies
npm install

# Create .env file
cat > .env << 'EOF'
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hostel_db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
NODE_ENV=development
EOF

# If using MongoDB Atlas, edit .env and replace MONGODB_URI with your Atlas connection string
# nano .env  # or use your preferred editor

# Seed default users
npm run seed

# Start backend server (in development mode with auto-reload)
npm run dev
```

**Keep this terminal window open!** The backend will run on `http://localhost:5000`

## Step 4: Setup Frontend (Open a NEW Terminal Window)

Open a **new terminal window** (keep the backend running) and run:

```bash
# Navigate to project root
cd ~/Documents/hostel\ final

# Install frontend dependencies
npm install

# Create .env file for frontend (optional - defaults to localhost:5000)
cat > .env << 'EOF'
VITE_API_URL=http://localhost:5000/api
EOF

# Start frontend development server
npm run dev
```

The frontend will start on `http://localhost:5173` (or another port if 5173 is busy)

## Step 5: Access the Application

1. Open your browser and go to: `http://localhost:5173`
2. Use these default credentials:
   - **Student**: `student@example.com` / `student123`
   - **Warden**: `warden@example.com` / `warden123`
   - **Security**: `security@example.com` / `security123`

## Quick Start Commands (After Initial Setup)

### Start Backend:
```bash
cd ~/Documents/hostel\ final/backend
npm run dev
```

### Start Frontend (in a new terminal):
```bash
cd ~/Documents/hostel\ final
npm run dev
```

## Troubleshooting

### MongoDB Connection Issues

If you get MongoDB connection errors:

1. **Check if MongoDB is running:**
   ```bash
   brew services list
   ```

2. **Start MongoDB if not running:**
   ```bash
   brew services start mongodb-community
   ```

3. **Check MongoDB logs:**
   ```bash
   tail -f /opt/homebrew/var/log/mongodb/mongo.log
   ```

### Port Already in Use

If port 5000 or 5173 is already in use:

1. **Find what's using the port:**
   ```bash
   lsof -i :5000  # For backend
   lsof -i :5173  # For frontend
   ```

2. **Kill the process:**
   ```bash
   kill -9 <PID>  # Replace <PID> with the process ID from above
   ```

### Node Version Issues

If you encounter module compatibility issues:

```bash
# Check Node version (should be 14+)
node --version

# If needed, update Node.js
brew upgrade node
```

### Permission Issues

If you get permission errors:

```bash
# Fix npm permissions (if needed)
sudo chown -R $(whoami) ~/.npm
```

## Production Build

To build for production:

```bash
# Build frontend
cd ~/Documents/hostel\ final
npm run build

# Start backend in production mode
cd ~/Documents/hostel\ final/backend
npm start
```

## Stop Services

To stop the servers:
- Press `Ctrl + C` in each terminal window
- To stop MongoDB: `brew services stop mongodb-community`

