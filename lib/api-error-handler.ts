import { NextResponse } from 'next/server';

export function handleApiError(error: any, context: string = 'API') {
  console.error(`${context} Error:`, error);

  // MongoDB connection errors
  if (error?.message?.includes('IP') || error?.message?.includes('whitelist')) {
    return NextResponse.json(
      {
        error: 'Database connection failed: IP not whitelisted',
        message: 'Please add 0.0.0.0/0/0 to MongoDB Atlas Network Access. See MONGODB_ATLAS_SETUP.md for details.',
      },
      { status: 500 }
    );
  }

  if (error?.message?.includes('authentication failed')) {
    return NextResponse.json(
      {
        error: 'Database authentication failed',
        message: 'Check your MongoDB connection string credentials.',
      },
      { status: 500 }
    );
  }

  // Validation errors
  if (error?.name === 'ValidationError') {
    return NextResponse.json(
      {
        error: 'Validation error',
        message: error.message,
      },
      { status: 400 }
    );
  }

  // Cast errors (invalid ObjectId, etc)
  if (error?.name === 'CastError') {
    return NextResponse.json(
      {
        error: 'Invalid ID format',
        message: 'Please provide a valid ID.',
      },
      { status: 400 }
    );
  }

  // Default error
  return NextResponse.json(
    {
      error: error?.message || 'An error occurred',
      details: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
    },
    { status: 500 }
  );
}

