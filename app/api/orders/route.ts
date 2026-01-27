import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order, { OrderStatus, PaymentStatus } from '@/models/Order';
import { verifyToken, generateOTP } from '@/lib/auth';
import { calculateDeliveryFee, checkPinCodeAvailability, calculateDistanceDiff } from '@/lib/pricing';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    const decoded: any = token ? verifyToken(token) : null;

    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { items, deliveryAddress, paymentMethod } = body; 
    // items: [{ participantId, bibNumber, eventName, qrImage }]

    if (!items || items.length === 0 || !deliveryAddress) {
      return NextResponse.json({ error: 'Missing logic' }, { status: 400 });
    }

    // Check PIN availability
    const isServiceable = await checkPinCodeAvailability(deliveryAddress.zip);
    if (!isServiceable) {
      return NextResponse.json({ error: 'Delivery not available in this area' }, { status: 400 });
    }

    // Calculate Distance & Fee
    const distanceKm = calculateDistanceDiff(0,0,0,0); // Mock distance
    const fee = calculateDeliveryFee(distanceKm);

    await dbConnect();

    // Prevent duplicate orders for same items
    const participantIds = items.map((i: any) => i.participantId);
    const existingOrder = await Order.findOne({
      customer: decoded.id,
      'items.participantId': { $in: participantIds },
      status: { $nin: ['Cancelled', 'Delivery Failed'] }
    });

    if (existingOrder) {
      return NextResponse.json({ 
        error: 'One or more items in this order are already being processed. View existing order in dashboard.' 
      }, { status: 400 });
    }

    // Create Order
    const order = new Order({
      customer: decoded.id,
      items,
      deliveryAddress,
      distanceKm,
      deliveryFee: fee,
      paymentMethod: paymentMethod || 'COD',
      paymentStatus: PaymentStatus.PENDING,
      status: OrderStatus.CREATED,
      pickupPin: generateOTP(), // Simple 4 digit PIN
      deliveryOtp: generateOTP(), // Start with one, maybe regenerate when out for delivery
      statusHistory: [{ status: OrderStatus.CREATED }]
    });

    await order.save();

    return NextResponse.json({ success: true, order });

  } catch (error) {
    console.error('Create Order Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
