# Quick Setup Guide

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your MongoDB connection string:

```env
MONGODB_URI=mongodb+srv://shobhitsourceryit_db_user:Shobhit@5655@cluster0.ajvggdr.mongodb.net/service_center?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your-secret-key-change-this
NEXTAUTH_URL=http://localhost:3000
```

**Important**: In the MongoDB URI, make sure to URL-encode special characters in the password. For example, `@` should be `%40`.

So if your password is `Shobhit@5655`, the connection string should be:
```
mongodb+srv://shobhitsourceryit_db_user:Shobhit%405655@cluster0.ajvggdr.mongodb.net/...
```

## Step 3: Create Admin User

Run the setup script:

```bash
npm run setup
```

This will create a default admin user:
- **Email**: admin@servicecenter.com
- **Password**: admin123

**⚠️ IMPORTANT**: Change this password immediately after first login!

Alternatively, you can create an admin user manually through MongoDB Compass or by making a POST request to `/api/auth/register` (after setting up the first owner user).

## Step 4: Start Development Server

```bash
npm run dev
```

## Step 5: Access the Application

Open your browser and go to: [http://localhost:3000](http://localhost:3000)

Login with:
- Email: `admin@servicecenter.com`
- Password: `admin123`

## Creating Additional Users

After logging in as the owner, you can create additional users by:
1. Using the API endpoint `/api/auth/register` (Owner only)
2. Or manually inserting into MongoDB `staffs` collection

## Troubleshooting

### MongoDB Connection Error

If you see MongoDB connection errors:
1. Check that your MongoDB URI is correct
2. Ensure your IP is whitelisted in MongoDB Atlas (or use `0.0.0.0/0` for development)
3. Make sure special characters in password are URL-encoded

### Port Already in Use

If port 3000 is already in use:
```bash
# Kill the process using port 3000 (Mac/Linux)
lsof -ti:3000 | xargs kill -9

# Or change the port
PORT=3001 npm run dev
```

### Build Errors

If you encounter build errors:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## Next Steps

1. **Change default admin password**
2. **Create additional staff users** (Admin, Invoice Biller)
3. **Import customers** using the Import Excel feature
4. **Add stock items**
5. **Configure WhatsApp API** (optional, for actual WhatsApp messaging)

## Deployment to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

For detailed deployment instructions, see README.md

