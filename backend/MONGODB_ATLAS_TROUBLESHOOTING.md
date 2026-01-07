# MongoDB Atlas Connection Troubleshooting Guide

## Current Error
```
querySrv ENODATA _mongodb._tcp.cluster0.cvhl5fj.mongodb.net
```

This error means DNS cannot resolve your MongoDB Atlas cluster hostname.

## Step-by-Step Fix

### 1. Check if Cluster is Paused ⚠️ (Most Common Issue)

**Free tier MongoDB Atlas clusters automatically pause after 1 week of inactivity.**

1. Go to [MongoDB Atlas Dashboard](https://cloud.mongodb.com/)
2. Log in to your account
3. Select your project
4. Check your cluster status:
   - **If it shows "Paused"**: Click the **"Resume"** button
   - Wait 1-2 minutes for the cluster to resume
   - The cluster will be ready when status shows "Running"

### 2. Verify Connection String

1. In MongoDB Atlas, click **"Connect"** on your cluster
2. Select **"Connect your application"**
3. Choose **"Node.js"** and version **"5.5 or later"**
4. Copy the connection string
5. Replace `<password>` with your actual database password
6. Update `backend/.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster0.cvhl5fj.mongodb.net/movieo?retryWrites=true&w=majority
   ```

### 3. Check IP Whitelist

1. In MongoDB Atlas, go to **"Network Access"** (left sidebar)
2. Click **"Add IP Address"**
3. For development, you can:
   - **Option A**: Add your current IP address
   - **Option B**: Add `0.0.0.0/0` (allows all IPs - **only for development**)
4. Click **"Confirm"**
5. Wait 1-2 minutes for changes to take effect

### 4. Verify Database User

1. In MongoDB Atlas, go to **"Database Access"** (left sidebar)
2. Check if your database user exists
3. If not, create a new user:
   - Click **"Add New Database User"**
   - Choose **"Password"** authentication
   - Set username and password
   - Set privileges to **"Read and write to any database"**
   - Click **"Add User"**

### 5. Test DNS Resolution

Run the diagnostic tool:
```bash
cd backend
node test-mongodb-connection.js
```

### 6. Network/DNS Issues

If DNS resolution still fails:

**Windows:**
1. Open Command Prompt as Administrator
2. Flush DNS: `ipconfig /flushdns`
3. Restart your network adapter or computer

**Change DNS Server:**
1. Go to Network Settings
2. Change DNS to Google DNS:
   - Primary: `8.8.8.8`
   - Secondary: `8.8.4.4`
3. Restart your computer

**Check Firewall/VPN:**
- Temporarily disable VPN if active
- Check if firewall is blocking MongoDB connections
- Try from a different network (mobile hotspot)

### 7. Verify Connection String Format

Your connection string should look like:
```
mongodb+srv://username:password@cluster0.cvhl5fj.mongodb.net/database-name?retryWrites=true&w=majority
```

**Important:**
- Replace `username` with your database username
- Replace `password` with your database password (URL-encode special characters)
- Replace `database-name` with your database name (e.g., `movieo`)
- Keep the query parameters `?retryWrites=true&w=majority`

### 8. Test Connection Again

After making changes:
1. Wait 1-2 minutes for changes to propagate
2. Restart your backend server:
   ```bash
   cd backend
   npm run dev
   ```

## Common Issues & Solutions

### Issue: "Cluster is paused"
**Solution**: Resume the cluster in Atlas dashboard

### Issue: "Authentication failed"
**Solution**: 
- Verify username/password in connection string
- Check database user exists in Atlas
- URL-encode special characters in password

### Issue: "IP not whitelisted"
**Solution**: Add your IP to Network Access in Atlas

### Issue: "DNS resolution failed"
**Solution**:
- Check if cluster is running (not paused)
- Flush DNS cache
- Try different DNS server
- Check network connectivity

## Quick Checklist

- [ ] Cluster is running (not paused)
- [ ] Connection string is correct in `.env`
- [ ] IP address is whitelisted in Network Access
- [ ] Database user exists and has correct permissions
- [ ] Internet connection is working
- [ ] DNS is resolving correctly
- [ ] No VPN/firewall blocking connection

## Still Having Issues?

1. Run the diagnostic tool: `node backend/test-mongodb-connection.js`
2. Check MongoDB Atlas status page: https://status.mongodb.com/
3. Verify your connection string format matches the example above
4. Try connecting from MongoDB Compass (desktop app) to test if it's a code issue
