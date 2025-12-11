import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User, { UserRole } from '@/models/User';
import { generateOTP } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { mobile } = await req.json();

    if (!mobile) {
      return NextResponse.json({ error: 'Mobile number is required' }, { status: 400 });
    }

    await dbConnect();

    // In a real app, you might only generate OTP here and not create the user yet,
    // or upsert the user.
    // Let's Find or Create the user for Customer role logic (Auto-register).
    
    let user = await User.findOne({ mobile });

    if (!user) {
      user = new User({
        mobile,
        role: UserRole.CUSTOMER,
        isVerified: false
      });
    }

    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    user.otp = {
      code: otpCode,
      expiresAt
    };

    await user.save();

    // MOCK SMS SENDING
    console.log(`[SMS-MOCK] OTP for ${mobile} is ${otpCode}`);

    return NextResponse.json({ 
      success: true, 
      message: 'OTP sent successfully', 
      debug_otp: otpCode // For easy testing, remove in prod
    });

  } catch (error) {
    console.error('Send OTP Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
