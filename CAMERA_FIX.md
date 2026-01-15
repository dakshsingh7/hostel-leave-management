# Camera Access Fix for Security Panel

## Problem
Browsers require HTTPS to access the camera (except on localhost). When accessing via HTTP from your phone, the camera won't work.

## Solution: Enable HTTPS in Vite

The `vite.config.js` has been updated to use HTTPS. Follow these steps:

### Step 1: Stop the frontend server
Press `Ctrl+C` in the terminal where the frontend is running.

### Step 2: Restart with HTTPS
```bash
cd ~/Documents/hostel\ final
npm run dev -- --host
```

### Step 3: Accept the SSL certificate warning
When you access the site, you'll see a security warning because it's a self-signed certificate. This is normal for development.

**On your phone:**
1. Open `https://192.168.29.159:5173` (note the `https://` not `http://`)
2. You'll see a security warning - click "Advanced" or "Show Details"
3. Click "Proceed" or "Accept" to continue

**On your Mac:**
- Safari: Click "Show Details" → "visit this website"
- Chrome: Click "Advanced" → "Proceed to 192.168.29.159 (unsafe)"

### Step 4: Grant camera permissions
When you access the Security Panel:
1. Your browser will ask for camera permission
2. Click "Allow" or "Grant"
3. The camera should now work!

## Alternative: Test on MacBook (localhost)
If you just want to test quickly on your MacBook:
1. Open `https://localhost:5173` in your browser
2. Accept the security warning
3. Camera will work without network setup

## Troubleshooting

### Still not working?
1. **Check browser console** (F12 or right-click → Inspect → Console)
2. **Check camera permissions** in browser settings
3. **Try a different browser** (Chrome, Firefox, Safari)
4. **Make sure you're using HTTPS** (not HTTP)

### Browser-specific steps:

**Chrome/Edge:**
- Settings → Privacy and Security → Site Settings → Camera
- Make sure the site is allowed

**Safari:**
- Safari → Settings → Websites → Camera
- Allow access for the site

**Firefox:**
- Settings → Privacy & Security → Permissions → Camera
- Check site permissions

