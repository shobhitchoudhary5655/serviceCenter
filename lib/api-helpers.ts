import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from './auth';

export async function requireAuth(request: NextRequest) {
  const authUser = await getAuthUser(request);
  
  if (!authUser) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      user: null,
    };
  }

  return { error: null, user: authUser };
}

export async function requireRole(request: NextRequest, allowedRoles: string[]) {
  const { error, user } = await requireAuth(request);
  
  if (error) {
    return { error, user: null };
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return {
      error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
      user: null,
    };
  }

  return { error: null, user };
}

