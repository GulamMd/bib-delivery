import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Participant from '@/models/Participant';
import Event from '@/models/Event'; // to populate event details
import { verifyToken } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    
    // Allow searching if token matches
    const decoded: any = token ? verifyToken(token) : null;
    if (!decoded || !decoded.mobile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    // Fetch participants where mobile matches
    // Also populate Event details (name, date, venue)
    const participants = await Participant.find({ mobile: decoded.mobile })
      .populate({
        path: 'event',
        select: 'name date venue deliveryEnabled'
      });

    return NextResponse.json({ success: true, participants });

  } catch (error) {
    console.error('Fetch Bibs Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
