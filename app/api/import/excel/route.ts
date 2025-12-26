import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getAuthUser } from '@/lib/auth';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    
    if (!authUser || (authUser.role !== 'owner' && authUser.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await connectDB();
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    const users = [];
    const errors = [];

    for (let i = 0; i < data.length; i++) {
      const row: any = data[i];
      
      try {
        const name = row.name || row.Name || row.NAME;
        const mobile = String(row.mobile || row.Mobile || row.MOBILE || row.phone || row.Phone);
        const vehicle_no = row.vehicle_no || row.Vehicle_No || row.VEHICLE_NO || row['Vehicle No'] || row['Vehicle Number'];
        const email = row.email || row.Email || row.EMAIL;

        if (!name || !mobile || !vehicle_no) {
          errors.push(`Row ${i + 2}: Missing required fields (name, mobile, vehicle_no)`);
          continue;
        }

        // Check if user already exists
        const existingUser = await User.findOne({ mobile });
        if (existingUser) {
          errors.push(`Row ${i + 2}: User with mobile ${mobile} already exists`);
          continue;
        }

        const user = new User({
          name,
          mobile,
          vehicle_no,
          email,
          source: 'excel',
        });

        await user.save();
        users.push(user);
      } catch (error: any) {
        errors.push(`Row ${i + 2}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      imported: users.length,
      errors,
      users: users.slice(0, 10), // Return first 10 for preview
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to import Excel file' },
      { status: 500 }
    );
  }
}

