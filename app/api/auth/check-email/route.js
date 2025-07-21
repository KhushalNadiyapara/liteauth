import { NextResponse } from 'next/server';
import connectMongo from '@/app/_lib/mongodb';
import User from '@/models/User';

export async function POST(request) {
  try {
    await connectMongo();
    
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if email exists
    const existingUser = await User.findOne({ 
      email: email.toLowerCase() 
    });

    return NextResponse.json({
      available: !existingUser,
      message: existingUser ? 'Email is already registered' : 'Email is available'
    });

  } catch (error) {
    console.error('Email check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
