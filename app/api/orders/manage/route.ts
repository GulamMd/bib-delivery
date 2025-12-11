import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order, { OrderStatus } from '@/models/Order';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/models/User';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    const decoded: any = token ? verifyToken(token) : null;
    
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();

    // IF DELIVERY PERSON: Show assigned tasks
    if (decoded.role === UserRole.DELIVERY) {
      const orders = await Order.find({ 
        deliveryPerson: decoded.id, 
        status: { $in: [OrderStatus.ASSIGNED, OrderStatus.PICKED_FROM_ORGANIZER, OrderStatus.OUT_FOR_DELIVERY] } 
      }).populate('customer', 'name mobile'); // Show customer details
      
      return NextResponse.json({ success: true, orders });
    }

    // IF ADMIN: Show all Pending/Assigned orders for management
    if (decoded.role === UserRole.ADMIN) {
      const orders = await Order.find().sort({ createdAt: -1 })
        .populate('customer', 'mobile name')
        .populate('deliveryPerson', 'name mobile');
      
      return NextResponse.json({ success: true, orders });
    }

    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  } catch (error) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  // Assign Order (Admin Only)
  try {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    const decoded: any = token ? verifyToken(token) : null;

    if (!decoded || decoded.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { orderId, deliveryPersonId } = await req.json();
    await dbConnect();

    const order = await Order.findById(orderId);
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    order.deliveryPerson = deliveryPersonId;
    order.status = OrderStatus.ASSIGNED;
    order.statusHistory.push({ status: OrderStatus.ASSIGNED, timestamp: new Date() });
    
    await order.save();
    
    return NextResponse.json({ success: true, order });

  } catch (error) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
