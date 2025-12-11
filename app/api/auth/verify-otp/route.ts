import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { signToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { mobile, otp } = await req.json();

    if (!mobile || !otp) {
      return NextResponse.json({ error: 'Mobile and OTP are required' }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findOne({ mobile });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.otp || !user.otp.code) {
       return NextResponse.json({ error: 'No OTP requested' }, { status: 400 });
    }

    if (user.otp.code !== otp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
    }

    if (new Date() > user.otp.expiresAt) {
      return NextResponse.json({ error: 'OTP expired' }, { status: 400 });
    }

    // Verify User
    user.isVerified = true;
    user.otp = undefined; // Clear OTP
    await user.save();

    // Generate Token
    const token = signToken({ 
      id: user._id, 
      role: user.role, 
      mobile: user.mobile 
    });

    const response = NextResponse.json({ 
      success: true, 
      token,
      user: {
        id: user._id,
        mobile: user.mobile,
        role: user.role,
        name: user.name,
        isVerified: user.isVerified
      }
    });

    // Set HTTP-only cookie for better security (optional but recommended)
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Verify OTP Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
