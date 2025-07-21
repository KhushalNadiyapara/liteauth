import { NextResponse } from 'next/server';
import connectMongo from '@/app/_lib/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    await connectMongo();
    
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    return NextResponse.json({ users });

  } catch (error) {
    console.error('Fetch users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await connectMongo();
    
    const { id, role } = await request.json();

    if (!id || !role) {
      return NextResponse.json(
        { error: 'User ID and role are required' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['user', 'admin'];
    const normalizedRole = role.toLowerCase();
    
    if (!validRoles.includes(normalizedRole)) {
      return NextResponse.json(
        { error: 'Role must be either user or admin' },
        { status: 400 }
      );
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role: normalizedRole }, // Save as lowercase
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'User role updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update user error:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
