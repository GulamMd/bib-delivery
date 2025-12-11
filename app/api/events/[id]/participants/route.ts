import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Participant from '@/models/Participant';
import Event from '@/models/Event';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/models/User';

// We need a CSV parser. But doing it in Web Streams in Next.js App Router can be tricky.
// For simplicity, we'll assume the client sends JSON or we simple-parse a text body.
// Or we can rely on client-side parsing (PapaParse) and sending JSON array.
// Let's implement JSON array receiving for robustness, 
// as server-side multipart/form-data parsing in App Router usually requires extra boilerplate or `formData()`.
// Actually `req.formData()` works well in Next.js 13/14.

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const eventId = params.id;
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    const decoded: any = token ? verifyToken(token) : null;

    if (!decoded || (decoded.role !== UserRole.ORGANIZER && decoded.role !== UserRole.ADMIN)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const event = await Event.findById(eventId);
    if (!event) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

    // Permissions check: Organizer must own the event or be Admin
    if (decoded.role === UserRole.ORGANIZER && event.organizer.toString() !== decoded.id) {
       return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Expecting JSON array of participants for simplicity and reliability
    // Client will parse CSV -> JSON
    const { participants } = await req.json(); 

    if (!Array.isArray(participants)) {
      return NextResponse.json({ error: 'Invalid data format. Expected array of participants.' }, { status: 400 });
    }

    // Bulk write is more efficient
    const bulkOps = participants.map((p: any) => ({
      updateOne: {
        filter: { event: eventId, mobile: p.mobile },
        update: { 
          $set: { 
            bibNumber: p.bibNumber,
            name: p.name,
            category: p.category,
            registrationId: p.registrationId
          }
        },
        upsert: true
      }
    }));

    if (bulkOps.length > 0) {
      await Participant.bulkWrite(bulkOps);
    }

    return NextResponse.json({ success: true, count: bulkOps.length });

  } catch (error) {
    console.error('Participant Upload Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
