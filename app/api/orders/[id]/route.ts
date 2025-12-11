import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/models/User';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const orderId = params.id;
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    const decoded: any = token ? verifyToken(token) : null;

    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();

    // Populate deliveryPerson to show name/phone to customer
    // Populate customer to show to delivery person
    const order = await Order.findById(orderId)
      .populate('deliveryPerson', 'name mobile')
      .populate('customer', 'name mobile');

    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Access Control
    const isOwner = order.customer._id.toString() === decoded.id;
    const isAssigned = order.deliveryPerson?._id.toString() === decoded.id;
    const isAdmin = decoded.role === UserRole.ADMIN;
    
    // Organizer logic? Organizer should see it if it contains their event items? 
    // For now, simplify.

    if (!isOwner && !isAssigned && !isAdmin) {
       return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ success: true, order });

  } catch (error) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
