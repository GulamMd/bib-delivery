import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Participant from '@/models/Participant';
import Event from '@/models/Event'; 
import Order from '@/models/Order';
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
    const participants = await Participant.find({ mobile: decoded.mobile })
      .populate({
        path: 'event',
        model: Event,
        select: 'name date venue deliveryEnabled'
      }).lean();

    // Fetch existing orders for this user to check for duplicates
    const existingOrders = await Order.find({ 
      customer: decoded.id,
      status: { $nin: ['Cancelled', 'Delivery Failed'] } 
    }).select('_id items status').lean();

    // Map participant IDs to their order details
    const orderMap: Record<string, { orderId: string, status: string }> = {};
    existingOrders.forEach(order => {
      order.items.forEach((item: any) => {
        orderMap[item.participantId.toString()] = {
          orderId: order._id.toString(),
          status: order.status
        };
      });
    });

    const participantsWithOrderInfo = participants.map(p => ({
      ...p,
      orderInfo: orderMap[p._id.toString()] || null
    }));

    return NextResponse.json({ success: true, participants: participantsWithOrderInfo });

  } catch (error) {
    console.error('Fetch Bibs Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
