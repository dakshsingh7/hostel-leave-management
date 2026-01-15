# Quick Start Guide - Hostel Smart Entry

## When You Want to Run the App Again

### Step 1: Start MongoDB (if using local MongoDB)

```bash
brew services start mongodb-community
```

**Note:** If you're using MongoDB Atlas (cloud), skip this step.

### Step 2: Find Your MacBook's IP Address

Before starting, find your MacBook's IP address on your network:

```bash
ipconfig getifaddr en0
```

This will show your IP (e.g., `10.80.58.54`). **Write this down** - you'll need it!

**Your current IP:** `10.80.58.54`

**Alternative method:**
- Go to **System Settings** → **Network** → Click on your WiFi connection
- Look for the IP address (usually starts with `192.168.x.x` or `10.x.x.x`)

### Step 3: Start Backend Server

Open Terminal 1:

```bash
cd ~/Documents/hostel\ final/backend
npm run dev
```

**Keep this terminal open!** You should see:
- ✅ Connected to MongoDB
- 🚀 Server running on port 5001
- 📡 Server accessible at:
  - Local:   http://localhost:5001
  - Network: http://0.0.0.0:5001

**Important:** The backend now listens on all network interfaces, so both your laptop and phone can connect to it!

### Step 4: Start Frontend Server

Open Terminal 2 (new terminal window):

```bash
cd ~/Documents/hostel\ final
npm run dev -- --host
```

**Keep this terminal open!** You should see:
- ➜  Local:   http://localhost:5173/
- ➜  Network: http://10.80.58.54:5173/

### Step 5: Access the Application

**On your MacBook (Laptop):**
1. Open browser: `http://localhost:5173`
2. The app automatically connects to backend via proxy
3. Camera will work here

**On your Phone (same WiFi network):**
1. Open browser: `http://10.80.58.54:5173`
2. The app automatically detects it's on a network IP and connects directly to the backend
3. Camera will work here too!

**✅ Multi-Device Setup:**
- Both devices access the **same backend server**
- Student requests on laptop → visible to Warden on phone **in real-time**
- All requests sync between devices automatically

### Step 6: Login

Use these credentials:
- **Student**: `student@example.com` / `student123`
- **Warden**: `warden@example.com` / `warden123`
- **Security**: `security@example.com` / `security123`

---

## Quick Commands (Copy & Paste)

**Terminal 1 - Backend:**
```bash
cd ~/Documents/hostel\ final/backend && npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd ~/Documents/hostel\ final && npm run dev -- --host
```

---

## Troubleshooting

### Backend won't start?
- Check if MongoDB is running: `brew services list | grep mongodb`
- Start MongoDB: `brew services start mongodb-community`
- Check if port 5001 is free: `lsof -i :5001`

### Frontend won't start?
- Check if port 5173 is free: `lsof -i :5173`
- Kill process if needed: `kill -9 $(lsof -t -i:5173)`

### Can't connect from phone?
- Make sure both devices are on the **same WiFi network**
- Your MacBook's IP: `10.80.58.54`
- Update the URL in your phone's browser: `http://10.80.58.54:5173`
- Make sure backend is running and shows "Server accessible at: Network: http://0.0.0.0:5001"
- Try accessing backend directly from phone: `http://10.80.58.54:5001/api/health` (should show `{"status":"OK"}`)

### Camera not working?
- **Grant camera permissions** when the browser asks
- Camera now works on both:
  - ✅ MacBook at `http://localhost:5173`
  - ✅ Phone at `http://10.80.58.54:5173` (network IPs now supported)
- If camera still doesn't work:
  - Check browser permissions: Settings → Privacy → Camera
  - Make sure you granted permission when prompted
  - Refresh the page after granting permissions

### Backend not accessible from phone?
- Backend is now configured to accept connections from network devices
- Make sure firewall isn't blocking port 5001
- Test backend access: Open `http://10.80.58.54:5001/api/health` on your phone's browser
- Should see: `{"status":"OK","message":"Server is running"}`

---

## Stop the Servers

When you're done:
1. Press `Ctrl+C` in both terminal windows
2. To stop MongoDB: `brew services stop mongodb-community` (if using local MongoDB)

---

## Your Current Setup

- **MacBook IP Address**: `10.80.58.54`
- **Backend Port**: 5001 (listens on all interfaces: 0.0.0.0)
- **Frontend Port**: 5173
- **Backend URL (Laptop)**: http://localhost:5001
- **Backend URL (Phone)**: http://10.80.58.54:5001
- **Frontend URL (Laptop)**: http://localhost:5173
- **Frontend URL (Phone)**: http://10.80.58.54:5173

## How Multi-Device Works

✅ **Backend Configuration:**
- Backend listens on `0.0.0.0:5001` (all network interfaces)
- Accepts connections from both localhost and network devices
- CORS enabled for all origins

✅ **Frontend API Configuration:**
- Automatically detects if you're on localhost or network IP
- Localhost → Uses proxy (`/api` → `http://localhost:5001/api`)
- Network IP → Direct connection (`http://10.80.58.54:5001/api`)
- Both devices connect to the **same backend instance**

✅ **Real-Time Sync:**
- Student creates request on laptop → Warden sees it on phone instantly
- Warden approves on phone → Student sees update on laptop instantly
- All changes sync in real-time across devices

