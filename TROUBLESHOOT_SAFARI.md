# Troubleshooting Safari Connection Issues

## Step 1: Verify Frontend is Running

Check the terminal where you ran `npm run dev -- --host`. You should see:
```
➜  Local:   https://localhost:5173/
➜  Network: https://192.168.29.159:5173/
```

If you don't see this, the server isn't running properly.

## Step 2: Check What URL You're Using

**On MacBook:**
- Use: `https://localhost:5173`

**On Phone:**
- Use: `https://192.168.29.159:5173`

**Important:** Make sure you're using `https://` not `http://`

## Step 3: Common Safari Issues

### Issue: "Safari can't open the page"

**Solution 1: Try Chrome or Firefox instead**
Safari can be strict with self-signed certificates. Try Chrome or Firefox.

**Solution 2: Clear Safari cache**
- Safari → Preferences → Privacy → Manage Website Data
- Remove localhost/your IP
- Try again

**Solution 3: Check if server is actually running**
```bash
# Check if port 5173 is in use
lsof -i :5173
```

## Step 4: Verify Backend is Running

The backend must be running on port 5001:
```bash
cd ~/Documents/hostel\ final/backend
npm run dev
```

You should see:
- ✅ Connected to MongoDB
- 🚀 Server running on port 5001

## Step 5: Test with curl (to verify server is up)

```bash
curl -k https://localhost:5173
```

If this works, the server is running. The `-k` flag ignores SSL certificate errors.

## Step 6: Alternative - Use HTTP for now (camera won't work on phone)

If HTTPS is causing too many issues, we can temporarily use HTTP:

1. Edit `vite.config.js` - remove `https: true`
2. Restart frontend
3. Access via `http://localhost:5173` or `http://192.168.29.159:5173`
4. Camera will only work on localhost, not on phone

