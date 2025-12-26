# Troubleshooting Guide

## Login Issues

### "Invalid credentials" Error

This error can occur for several reasons:

#### 1. Admin User Not Created

**Solution**: The admin user needs to be created first.

**Option A - Use Setup Page (Recommended)**:
1. Navigate to `/setup` in your browser
2. Fill in the form to create the first admin user
3. Then login with the credentials you just created

**Option B - Use Setup Script**:
```bash
npm run setup
```
This will create:
- Email: `admin@servicecenter.com`
- Password: `admin123`

**Option C - Use MongoDB Compass/Direct Database**:
1. Connect to your MongoDB database
2. Go to `service_center` database
3. Find or create `staffs` collection
4. Insert a document:
```json
{
  "name": "Admin User",
  "email": "admin@servicecenter.com",
  "password": "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5Z4FqXJZJZJZJ",
  "role": "owner",
  "mobile": "1234567890",
  "is_active": true,
  "created_at": new Date()
}
```
(Note: The password hash above is for "password123")

#### 2. Wrong Email or Password

**Solution**: 
- Make sure you're using the correct email (case-insensitive)
- Check if the password is correct
- If you forgot the password, you'll need to reset it in the database or create a new admin user

#### 3. MongoDB Connection Issues

**Solution**:
1. Check your `.env.local` file has the correct `MONGODB_URI`
2. Make sure your IP is whitelisted in MongoDB Atlas
3. Check the MongoDB connection string format:
   - Special characters in password must be URL-encoded
   - Example: `Shobhit@5655` should be `Shobhit%405655` in the connection string

#### 4. User Account is Inactive

**Solution**: Check the database and ensure `is_active: true` for your user

### MongoDB Connection Errors

#### Error: "MongoServerError: bad auth"

**Solution**: 
- Verify your MongoDB username and password
- Check if special characters are URL-encoded (e.g., `@` → `%40`)
- Ensure the database user has proper permissions

#### Error: "MongoNetworkError"

**Solution**:
- Check your internet connection
- Verify MongoDB Atlas cluster is running
- Check IP whitelist in MongoDB Atlas (add `0.0.0.0/0` for development)

### Build Errors

#### Error: "Module not found"

**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
```

#### TypeScript Errors

**Solution**:
```bash
npm run build
# Fix any TypeScript errors shown
```

### Port Already in Use

**Solution**:
```bash
# Mac/Linux
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### Environment Variables Not Loading

**Solution**:
1. Make sure `.env.local` is in the root directory (same level as `package.json`)
2. Restart the development server after changing `.env.local`
3. Don't commit `.env.local` to git (it's in `.gitignore`)

## Quick Fix Checklist

- [ ] MongoDB connection string is correct in `.env.local`
- [ ] Admin user exists in database (check via `/setup` or MongoDB Compass)
- [ ] Using correct email and password (case-sensitive for email)
- [ ] MongoDB Atlas IP whitelist includes your IP
- [ ] All dependencies installed (`npm install`)
- [ ] Development server restarted after changes

## Still Having Issues?

1. Check browser console for errors (F12)
2. Check server logs in terminal
3. Verify MongoDB connection using MongoDB Compass
4. Check if database and collections are created properly
5. Try creating a fresh admin user via `/setup` page

## Common Solutions Summary

| Problem | Solution |
|---------|----------|
| Invalid credentials | Create admin user via `/setup` page |
| MongoDB connection failed | Check connection string and IP whitelist |
| Module not found | Run `npm install` |
| Port in use | Kill process or use different port |
| Environment variables not working | Check `.env.local` location and restart server |

