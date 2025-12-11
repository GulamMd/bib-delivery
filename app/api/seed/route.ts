import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User, { UserRole } from '@/models/User';
import Event from '@/models/Event';
import Participant from '@/models/Participant';
import { hashPassword } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    await dbConnect();

    // 1. Create Admin
    const adminPass = await hashPassword('admin123');
    await User.findOneAndUpdate(
      { email: 'admin@bib.com' },
      { role: UserRole.ADMIN, password: adminPass, name: 'Super Admin', email: 'admin@bib.com' },
      { upsert: true }
    );

    // 2. Create Organizer
    const orgPass = await hashPassword('org123');
    const organizer = await User.findOneAndUpdate(
      { email: 'org@bib.com' },
      { role: UserRole.ORGANIZER, password: orgPass, name: 'Kolkata Runners', email: 'org@bib.com' },
      { upsert: true, new: true }
    );

    // 3. Create Delivery Person
    const delPass = await hashPassword('del123');
    await User.findOneAndUpdate(
      { email: 'del@bib.com' },
      { role: UserRole.DELIVERY, password: delPass, name: 'Raju Delivery', mobile: '9000000001', email: 'del@bib.com' },
      { upsert: true }
    );

    // 4. Create Event
    const event = await Event.findOneAndUpdate(
      { name: 'Kolkata Full Marathon 2025' },
      { 
        organizer: organizer?._id,
        date: new Date('2025-12-25'),
        venue: 'Red Road, Kolkata',
        deliveryEnabled: true,
        deliveryPickupPin: '1234'
      },
      { upsert: true, new: true }
    );

    // 5. Create Participant (for testing Customer flow with mobile 9876543210)
    // Note: Customer account will be auto-created on login, 
    // but Participant record must exist for them to see Bibs.
    await Participant.findOneAndUpdate(
      { bibNumber: '101', event: event?._id },
      {
        mobile: '9876543210',
        name: 'Rahul Sharma',
        category: 'Full Marathon',
        registrationId: 'REG001'
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true, message: 'Seeding Complete. Users: admin@bib.com, org@bib.com, del@bib.com. Test Mobile: 9876543210' });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Seeding Failed' });
  }
}
