import { NextResponse } from 'next/server';
import connectMongo from '@/app/_lib/mongodb';
import User from '@/models/User';

export async function POST(request) {
  try {
    await connectMongo();
    
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // Check if username exists (case-insensitive)
    const existingUser = await User.findOne({ 
      username: { $regex: new RegExp(`^${username}$`, 'i') } 
    });

    return NextResponse.json({
      available: !existingUser,
      message: existingUser ? 'Username is already taken' : 'Username is available'
    });

  } catch (error) {
    console.error('Username check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
