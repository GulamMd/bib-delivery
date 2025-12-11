import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Event from '@/models/Event';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/models/User';

export async function GET(req: Request) {
  try {
    await dbConnect();
    // Return all active events for customers or all events for admin? 
    // For now, return all events where registration is open or general list
    const events = await Event.find().sort({ date: 1 });
    return NextResponse.json({ success: true, events });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded: any = verifyToken(token);
    if (!decoded || (decoded.role !== UserRole.ORGANIZER && decoded.role !== UserRole.ADMIN)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    await dbConnect();

    const event = new Event({
      ...body,
      organizer: decoded.id // Set organizer to current user logic
    });

    await event.save();
    return NextResponse.json({ success: true, event });

  } catch (error) {
    console.error('Create Event Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
