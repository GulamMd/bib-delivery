import { NextResponse } from 'next/server';
import { calculateDistanceDiff, calculateDeliveryFee, checkPinCodeAvailability } from '@/lib/pricing';

export async function POST(req: Request) {
  try {
    const { deliveryAddress } = await req.json();

    if (!deliveryAddress || !deliveryAddress.zip) {
       return NextResponse.json({ error: 'Address required' }, { status: 400 });
    }

    const isServiceable = await checkPinCodeAvailability(deliveryAddress.zip);
    if (!isServiceable) {
      return NextResponse.json({ error: 'Not Serviceable' }, { status: 400 });
    }

    const dist = calculateDistanceDiff(0,0,0,0);
    const fee = calculateDeliveryFee(dist);

    return NextResponse.json({ 
      success: true, 
      estimate: {
        distanceKm: dist,
        deliveryFee: fee
      }
    });
  } catch (error) {
     return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
