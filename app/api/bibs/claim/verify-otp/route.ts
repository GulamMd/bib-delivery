import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Participant from '@/models/Participant';

export async function POST(req: Request) {
  try {
    const { mobile, otp } = await req.json();

    if (!mobile || !otp) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });

    await dbConnect();

    const user = await User.findOne({ mobile });
    if (!user || !user.otp || user.otp.code !== otp || new Date() > user.otp.expiresAt!) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }

    // OTP Correct. Return bibs.
    // We do NOT log them in as that user, we just return the bibs so the current user can add them.
    // Clear OTP
    user.otp = undefined;
    await user.save();

    const participants = await Participant.find({ mobile })
       .populate({ path: 'event', select: 'name date venue deliveryEnabled' });

    return NextResponse.json({ success: true, participants });

  } catch (error) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
