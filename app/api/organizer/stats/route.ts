import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Event from '@/models/Event';
import Participant from '@/models/Participant';
import Order from '@/models/Order'; // Will use later for "Delivery Requests" count
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/models/User';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    const decoded: any = token ? verifyToken(token) : null;

    if (!decoded || (decoded.role !== UserRole.ORGANIZER && decoded.role !== UserRole.ADMIN)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    
    // Find events by this organizer
    const events = await Event.find({ organizer: decoded.id });
    const eventIds = events.map(e => e._id);

    const totalEvents = events.length;
    const totalParticipants = await Participant.countDocuments({ event: { $in: eventIds } });
    
    // For delivery requests, we need to check Orders that contain items from these events
    // This is a bit complex as Order.items doesn't directly store eventId at top level, 
    // but items.participantId -> Participant.event -> eventIds.
    // Simpler approach: Count Participants where isKitDelivered is false? No, that's execution.
    // Better: Count Orders. Or just simple stats for now.
    
    // Let's approximate delivery requests by checking Participants who are linked to an Order?
    // We haven't linked Participant back to Order easily yet. 
    // Updated Plan: Organizer sees "Participants who opted for delivery". 
    // In our flow, User creates Order -> selects Bibs. 
    // So we should query Orders -> match items.eventName or participantId?
    
    // Let's return basics for now.
    return NextResponse.json({
      success: true,
      stats: {
        totalEvents,
        totalParticipants,
        // deliveryRequests: ... // Implement later with aggregation
      }
    });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
