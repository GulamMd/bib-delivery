import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User'; // We might check if user exists or just send OTP blindly to mobile
import { generateOTP } from '@/lib/auth';
import Participant from '@/models/Participant';

// Reusing User model logic for OTP storage? 
// Or create a temporary OTP store? 
// For simplicity, we can treat the "target mobile" as a User (if they exist) or just store OTP in a separate collection.
// But if they don't exist, we can't store it in User.
// Actually, the requirements say "Bibs registered under another mobile". That mobile is in Participant collection.
// So we can check if that mobile has any participants. 
// If so, we need to send OTP. 
// We will store this Claim OTP in a simple way. Maybe just in memory for this demo? Or in a separate 'OtpLog' collection?
// Let's use `User` model again. If user doesn't exist for that mobile, we create a stub User? 
// Yes, that's consistent with our "Auto-register" flow.

export async function POST(req: Request) {
  try {
    const { mobile } = await req.json(); // Target mobile
    
    if (!mobile) return NextResponse.json({ error: 'Mobile required' }, { status: 400 });

    await dbConnect();

    // Check if any bibs exist for this mobile first?
    const count = await Participant.countDocuments({ mobile });
    if (count === 0) {
      return NextResponse.json({ error: 'No bibs found for this mobile number.' }, { status: 404 });
    }

    // Find or create user to store OTP
    let user = await User.findOne({ mobile });
    if (!user) {
      user = new User({ mobile, role: 'customer', isVerified: false });
    }

    const otpCode = generateOTP();
    user.otp = {
      code: otpCode,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    };
    await user.save();

    console.log(`[CLAIM-OTP] OTP for ${mobile} is ${otpCode}`);

    return NextResponse.json({ success: true, message: 'OTP sent' });

  } catch (error) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
