import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order, { OrderStatus, PaymentStatus } from '@/models/Order';
import { verifyToken } from '@/lib/auth';
import { UserRole } from '@/models/User';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const orderId = params.id;
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    const decoded: any = token ? verifyToken(token) : null;

    if (!decoded || (decoded.role !== UserRole.DELIVERY && decoded.role !== UserRole.ADMIN)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { action, pin, otp } = await req.json(); // action: 'PICKUP' | 'DELIVER'
    
    await dbConnect();
    const order = await Order.findById(orderId);
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    // Validate ownership (if Delivery role)
    if (decoded.role === UserRole.DELIVERY && order.deliveryPerson?.toString() !== decoded.id) {
       return NextResponse.json({ error: 'Not your order' }, { status: 403 });
    }

    if (action === 'PICKUP') {
      // Logic: Validate PIN (Event-wide PIN or Order-specific?)
      // We stored `pickupPin` in Order (generated randomly) OR we can use Event PIN.
      // Current implementation: Order has `pickupPin`.
      // We also allowed Event to have `deliveryPickupPin`.
      // Let's assume Order PIN is sufficient for valid verification OR verify Event PIN.
      // Simpler: Use the random PIN generated at Order creation which Organizer must give? 
      // Actually, usually Organizer has a Master PIN.
      // Let's stick to the generated `pickupPin` in Order model for now (Organizer sees it in their dashboard).
      
      if (!pin) return NextResponse.json({ error: 'PIN required' }, { status: 400 });
      if (order.pickupPin !== pin) return NextResponse.json({ error: 'Invalid PIN' }, { status: 400 });

      order.status = OrderStatus.OUT_FOR_DELIVERY; // Or Picked
      order.statusHistory.push({ status: OrderStatus.OUT_FOR_DELIVERY, timestamp: new Date() });
      await order.save();

      return NextResponse.json({ success: true, message: 'Pickup Confirmed' });
    }

    if (action === 'DELIVER') {
      if (!otp) return NextResponse.json({ error: 'OTP required' }, { status: 400 });
      if (order.deliveryOtp !== otp) return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });

      order.status = OrderStatus.DELIVERED;
      order.paymentStatus = PaymentStatus.COMPLETED; // Assume COD collected
      order.statusHistory.push({ status: OrderStatus.DELIVERED, timestamp: new Date() });
      await order.save();

      return NextResponse.json({ success: true, message: 'Delivery Confirmed' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
