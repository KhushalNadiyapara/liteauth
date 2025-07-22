import { NextResponse } from 'next/server';
import connectMongo from '@/app/_lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    await connectMongo();
    
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({
        available: false,
        message: 'No user found with this email'
      });
    }

    // Compare password using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);

    return NextResponse.json({
      available: isMatch,
      message: isMatch ? 'Password is correct' : 'Password is incorrect'
    });

  } catch (error) {
    console.error('Password check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}