# Quick Start Commands for macOS ARM64

## Step 1: Add Homebrew to PATH (Run these commands)

```bash
echo >> ~/.zprofile
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

## Step 2: Verify Homebrew is working

```bash
brew --version
```

## Step 3: Install Node.js

```bash
brew install node
```

## Step 4: Verify Node.js installation

```bash
node --version
npm --version
```

## Step 5: Navigate to project directory

```bash
cd ~/Documents/hostel\ final
```

## Step 6: Setup Backend

```bash
cd backend
npm install
```

Create the .env file:
```bash
cat > .env << 'EOF'
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hostel_db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
NODE_ENV=development
EOF
```

Seed default users:
```bash
npm run seed
```

Start backend server:
```bash
npm run dev
```

**Keep this terminal open!**

## Step 7: Setup Frontend (Open NEW Terminal Window)

Open a **new terminal window** and run:

```bash
cd ~/Documents/hostel\ final
npm install
```

Create frontend .env file:
```bash
cat > .env << 'EOF'
VITE_API_URL=http://localhost:5000/api
EOF
```

Start frontend:
```bash
npm run dev
```

## Step 8: Install MongoDB (In a new terminal or after stopping backend)

```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

## Access the Application

Open browser: `http://localhost:5173`

Login credentials:
- Student: `student@example.com` / `student123`
- Warden: `warden@example.com` / `warden123`
- Security: `security@example.com` / `security123`

