# Deployment Guide for Vercel

## ✅ Fixed Issues

### 1. TypeScript Error in `lib/api-client.ts`
**Fixed:** HeadersInit type error by properly typing headers as Record<string, string> and casting to HeadersInit.

### 2. Browser API Safety
**Fixed:** Added `typeof window` and `typeof document` checks to prevent SSR errors.

### 3. TypeScript Errors in Models
**Fixed:** 
- `models/Staff.ts` - Fixed bcrypt.hash type error by casting `this` to `IStaff` via `unknown`
- `models/Stock.ts` - Fixed virtual getter type error by casting `this` to `IStock` via `unknown`

### 4. ESLint Errors
**Fixed:** 
- React Hook useEffect missing dependencies - Wrapped functions in `useCallback`
- Unescaped entities in JSX - Changed quotes to `&quot;`

## 📋 Pre-Deployment Checklist

### Environment Variables
Make sure to add these in Vercel Dashboard → Settings → Environment Variables:

1. **MONGODB_URI** (Required)
   ```
   mongodb+srv://shobhitsourceryit_db_user:Shobhit%405655@cluster0.ajvggdr.mongodb.net/service_center?retryWrites=true&w=majority&appName=Cluster0
   ```
   ⚠️ Make sure to URL-encode the password: `@` should be `%40`

2. **JWT_SECRET** (Required)
   ```
   your-super-secret-jwt-key-change-this-in-production-min-32-chars
   ```
   ⚠️ Use a strong random string in production!

3. **NEXTAUTH_URL** (Optional)
   ```
   https://your-domain.vercel.app
   ```

4. **WHATSAPP_API_KEY** (Optional - for WhatsApp integration)
   ```
   your-whatsapp-api-key
   ```

5. **WHATSAPP_API_URL** (Optional)
   ```
   https://api.whatsapp.com
   ```

## 🚀 Deployment Steps

### 1. Push Code to GitHub
```bash
git add .
git commit -m "Fix TypeScript errors and prepare for deployment"
git push origin main
```

### 2. Deploy to Vercel

**Option A: Via Vercel Dashboard**
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Add environment variables (see above)
5. Click "Deploy"

**Option B: Via Vercel CLI**
```bash
npm i -g vercel
vercel
```

### 3. Configure Environment Variables
After first deployment, add all environment variables in Vercel Dashboard.

### 4. Verify Deployment
- Check build logs for errors
- Visit your deployed URL
- Test login functionality
- Verify MongoDB connection

## 🔧 Build Configuration

The project uses:
- **Next.js 14.2** with App Router
- **TypeScript** with strict mode
- **MongoDB** with Mongoose
- **Tailwind CSS** for styling

## ⚠️ Important Notes

### MongoDB Connection
- Make sure your MongoDB Atlas IP whitelist includes `0.0.0.0/0` (all IPs) or Vercel's IP ranges
- The connection string is already URL-encoded in the code

### Build Time vs Runtime
- TypeScript errors are checked at build time
- MongoDB connection is only established at runtime
- Environment variables are available at build time for `next build`

### Security
- ⚠️ **DO NOT** commit `.env.local` to GitHub
- Use Vercel's environment variables for production secrets
- Change default JWT_SECRET in production

## 🐛 Troubleshooting

### Build Fails with TypeScript Errors
- Make sure all files have proper types
- Check that `'use client'` is added to client components
- Verify no server-side code uses browser APIs directly

### MongoDB Connection Fails
**Common Error:** "Could not connect to any servers - IP not whitelisted"

**Solution:**
1. Go to MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (adds `0.0.0.0/0/0`)
4. Wait 1-2 minutes for changes to take effect
5. See `MONGODB_ATLAS_SETUP.md` for detailed instructions

**Also check:**
- Verify MONGODB_URI is correct and URL-encoded
- Check environment variable is set in Vercel Dashboard
- Password must be URL-encoded (`@` → `%40`)

### Environment Variables Not Loading
- Verify variables are set in Vercel Dashboard
- Redeploy after adding new variables
- Check variable names match exactly (case-sensitive)

### 401/403 Errors After Deployment
- Check JWT_SECRET is set correctly
- Verify cookies are working (check SameSite settings)
- Ensure CORS is properly configured if using custom domain

## 📝 Post-Deployment

1. **Create Admin User**
   - Visit: `https://your-domain.vercel.app/setup`
   - Create your first admin account
   - Change default password after first login

2. **Test All Features**
   - Login/Logout
   - Create customers
   - Add services
   - Manage stock
   - Generate invoices
   - View reports

3. **Monitor Logs**
   - Check Vercel logs for any runtime errors
   - Monitor MongoDB connection
   - Watch for API errors

## ✅ Build Status

After fixes, the build should:
- ✅ Pass TypeScript type checking
- ✅ Compile successfully
- ✅ Generate optimized production build
- ✅ Deploy without errors
- ✅ All ESLint rules passing
- ✅ All models properly typed

**Build Test Result:** ✅ SUCCESSFUL
- ✓ Compiled successfully
- ✓ Linting and checking validity of types
- ✓ Generating static pages (22/22)
- ✓ Build completed without errors

---

**Last Updated:** After fixing all TypeScript and ESLint errors for deployment.

