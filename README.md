# Service Center Management System

A comprehensive full-stack Next.js application for managing vehicle service centers. This system automates service operations, stock management, invoicing, and customer communication.

## Features

- **Service Management**: Track all vehicle services with complete history
- **Stock Management**: Manage inventory with batch tracking and low-stock alerts
- **Invoice & Billing**: Generate invoices with GST calculation (CGST/SGST/IGST)
- **WhatsApp Automation**: Automated reminders and invoice sending
- **Reports & Dashboard**: Real-time business insights and analytics
- **Customer Management**: Import customers from Excel or add manually
- **Role-Based Access**: Owner, Admin, and Invoice Biller roles

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB (MongoDB Atlas)
- **Charts**: Recharts
- **Authentication**: JWT

## Prerequisites

- Node.js 18+ and npm/yarn
- MongoDB Atlas account (connection string provided)
- Vercel account (for deployment)

## Installation

1. **Clone or download the project**

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=mongodb+srv://shobhitsourceryit_db_user:Shobhit@5655@cluster0.ajvggdr.mongodb.net/service_center?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NEXTAUTH_URL=http://localhost:3000
   WHATSAPP_API_KEY=your-whatsapp-api-key
   WHATSAPP_API_URL=https://api.whatsapp.com
   ```

4. **Create initial admin user**
   
   Run the setup script to create the first admin user:
   ```bash
   npm run setup
   ```
   
   Or manually create a user using MongoDB Compass or MongoDB shell.

5. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Default Login

After setup, you can create an admin user manually through the API or MongoDB. To create the first user, you can use MongoDB Compass or create a script:

**Using MongoDB Compass:**
1. Connect to your MongoDB cluster
2. Navigate to `service_center` database
3. Go to `staffs` collection
4. Insert a new document:
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
   (Note: The password above is "password123" hashed. Change it after first login!)

## Project Structure

```
Service Center/
├── app/                    # Next.js app directory
│   ├── api/               # API routes (backend)
│   │   ├── auth/         # Authentication endpoints
│   │   ├── users/        # User management
│   │   ├── services/     # Service management
│   │   ├── stock/        # Stock management
│   │   ├── invoices/     # Invoice management
│   │   ├── dashboard/    # Dashboard stats
│   │   └── import/       # Excel import
│   ├── dashboard/        # Dashboard page
│   ├── customers/        # Customer management
│   ├── services/         # Service management UI
│   ├── stock/           # Stock management UI
│   ├── invoices/        # Invoice management UI
│   ├── reports/         # Reports page
│   ├── import/          # Import page
│   └── login/           # Login page
├── components/          # React components
│   ├── Layout.tsx       # Main layout wrapper
│   └── Sidebar.tsx      # Navigation sidebar
├── lib/                # Utility functions
│   ├── mongodb.ts      # MongoDB connection
│   ├── auth.ts         # Authentication helpers
│   ├── utils.ts        # General utilities
│   └── whatsapp.ts     # WhatsApp API integration
├── models/             # MongoDB models
│   ├── User.ts         # User model
│   ├── Service.ts      # Service model
│   ├── Stock.ts        # Stock model
│   ├── Invoice.ts      # Invoice model
│   ├── Staff.ts        # Staff model
│   └── Event.ts        # Event/Campaign model
└── package.json        # Dependencies

```

## User Roles

1. **Owner**: Full access to all features
2. **Admin**: Day-to-day operations, cannot delete critical data
3. **Invoice Biller**: Can create and send invoices only

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register new staff (Owner only)

### Users
- `GET /api/users` - List all users
- `POST /api/users` - Create user
- `GET /api/users/[id]` - Get user details
- `PUT /api/users/[id]` - Update user

### Services
- `GET /api/services` - List services
- `POST /api/services` - Create service
- `GET /api/services/[id]` - Get service details
- `PUT /api/services/[id]` - Update service

### Stock
- `GET /api/stock` - List stock items
- `POST /api/stock` - Add stock
- `PUT /api/stock/[id]` - Update stock
- `DELETE /api/stock/[id]` - Delete stock

### Invoices
- `GET /api/invoices` - List invoices
- `POST /api/invoices` - Create invoice
- `POST /api/invoices/[id]/send` - Send invoice via WhatsApp

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### Import
- `POST /api/import/excel` - Import customers from Excel

## Deployment to Vercel

1. **Push your code to GitHub**

2. **Import project to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your repository

3. **Configure Environment Variables**
   - Add all variables from `.env.local` in Vercel dashboard
   - Make sure to update `MONGODB_URI` and `JWT_SECRET`

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy your app

## MongoDB Connection

The project is configured to use MongoDB Atlas with the provided connection string:
```
mongodb+srv://shobhitsourceryit_db_user:Shobhit@5655@cluster0.ajvggdr.mongodb.net/service_center?retryWrites=true&w=majority&appName=Cluster0
```

## WhatsApp Integration

The WhatsApp API integration is currently set up as a placeholder. To enable actual WhatsApp messaging:

1. Sign up for a WhatsApp Business API provider (e.g., Twilio, WhatsApp Business API)
2. Update the `WHATSAPP_API_URL` and `WHATSAPP_API_KEY` in `.env.local`
3. Modify `/lib/whatsapp.ts` according to your provider's API

## Cron Jobs (WhatsApp Automation)

For production, set up cron jobs to run the following automation:
- Daily service reminders
- Monthly washing reminders
- Festival messages
- Product recall alerts

You can use Vercel Cron Jobs or external services like cron-job.org.

## Features Not Implemented (For Future)

- Customer portal/self-service
- Multi-branch support
- Advanced reporting with PDF export
- Email notifications
- SMS integration
- Advanced stock tracking (expiry dates, etc.)

## Support

For issues or questions, please check the code documentation or contact the development team.

## License

This project is proprietary software for Service Center Management.

