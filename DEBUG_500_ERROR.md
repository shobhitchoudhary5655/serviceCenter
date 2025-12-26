# Debugging 500 Internal Server Error

## Error: `GET /api/services 500 (Internal Server Error)`

This error occurs when the API route fails on the server. Here's how to diagnose and fix it.

## 🔍 Common Causes

### 1. MongoDB Connection Failed (Most Likely) ⚠️

**Symptoms:**
- 500 error when accessing any page that fetches data
- Error in browser console showing 500 status
- No data loading on dashboard/services/customers pages

**Solution:**
Follow the steps in `MONGODB_ATLAS_SETUP.md`:
1. Go to MongoDB Atlas → Network Access
2. Add `0.0.0.0/0/0` (Allow Access from Anywhere)
3. Wait 1-2 minutes
4. Refresh your app

**Verify:**
- Check Vercel function logs (Deployments → Your Deployment → Functions tab)
- Look for MongoDB connection errors

### 2. Missing Environment Variables

**Check:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify `MONGODB_URI` is set correctly
3. Verify `JWT_SECRET` is set
4. **Redeploy** after adding/updating environment variables

**Common Mistakes:**
- Forgot to add environment variables
- Wrong variable name (case-sensitive)
- Password not URL-encoded (`@` → `%40`)

### 3. Authentication Token Issues

**Symptoms:**
- 401 Unauthorized errors
- Can't access protected routes

**Solution:**
1. Log out and log in again
2. Clear browser cookies
3. Check if token is being sent in requests (browser DevTools → Network tab)

### 4. Empty Database / Collection Not Found

**Symptoms:**
- API works but returns empty arrays
- No error, just no data

**Solution:**
- This is normal if you haven't added data yet
- Try creating a customer/service to test

## 🔧 How to Check Vercel Logs

### Method 1: Vercel Dashboard
1. Go to Vercel Dashboard
2. Select your project
3. Click **"Deployments"** tab
4. Click on the latest deployment
5. Click **"Functions"** tab
6. Click on any function (e.g., `/api/services`)
7. View **Runtime Logs** - you'll see actual error messages

### Method 2: Real-time Logs
1. Vercel Dashboard → Your Project
2. Click **"Logs"** in the sidebar
3. View real-time function logs
4. Look for error messages

## 🐛 Debugging Steps

### Step 1: Check Vercel Function Logs
```
1. Vercel Dashboard → Your Project → Deployments → Latest
2. Click "Functions" tab
3. Find `/api/services` function
4. Check Runtime Logs for error messages
```

### Step 2: Check Environment Variables
```
1. Vercel Dashboard → Settings → Environment Variables
2. Verify MONGODB_URI is set
3. Verify JWT_SECRET is set
4. Check for typos
```

### Step 3: Test MongoDB Connection
```
1. MongoDB Atlas → Network Access
2. Verify 0.0.0.0/0/0 is added
3. Check connection string format
4. Test connection from MongoDB Compass
```

### Step 4: Check API Response
Open browser DevTools (F12):
1. Go to **Network** tab
2. Try accessing `/api/services`
3. Click on the failed request
4. Check **Response** tab - you'll see the error message
5. Check **Headers** tab - verify Authorization header is present

## 📝 Expected Error Messages

After fixes, you should see helpful error messages:

**MongoDB IP Whitelist Error:**
```json
{
  "error": "Database connection failed: IP not whitelisted",
  "message": "Please add 0.0.0.0/0/0 to MongoDB Atlas Network Access..."
}
```

**Authentication Error:**
```json
{
  "error": "Unauthorized"
}
```

**Validation Error:**
```json
{
  "error": "Required fields are missing"
}
```

## ✅ Quick Fix Checklist

- [ ] MongoDB Atlas IP whitelist includes `0.0.0.0/0/0`
- [ ] `MONGODB_URI` is set in Vercel environment variables
- [ ] `JWT_SECRET` is set in Vercel environment variables
- [ ] Password in connection string is URL-encoded
- [ ] Redeployed after adding environment variables
- [ ] Waited 1-2 minutes after MongoDB changes
- [ ] Checked Vercel function logs for actual error
- [ ] Cleared browser cache/cookies

## 🔍 What to Look For in Logs

**Good Logs (Connected):**
```
MongoDB connected successfully
```

**Bad Logs (IP Whitelist):**
```
MongoServerError: IP not whitelisted
⚠️ IP not whitelisted in MongoDB Atlas
```

**Bad Logs (Wrong Credentials):**
```
MongoServerError: authentication failed
⚠️ MongoDB authentication failed
```

**Bad Logs (Network Issue):**
```
MongoNetworkError: ECONNREFUSED
⚠️ Cannot reach MongoDB server
```

## 📞 Next Steps

1. **Check Vercel Logs** - This will tell you the exact error
2. **Fix MongoDB IP Whitelist** - Most common issue
3. **Verify Environment Variables** - Make sure they're set correctly
4. **Redeploy** - After making changes

---

**Note:** The improved error handling will now show you exactly what's wrong in the API response, making debugging much easier!

