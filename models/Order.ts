import mongoose, { Schema, Document, Model } from 'mongoose';

export enum OrderStatus {
  CREATED = 'Order Created',
  ASSIGNED = 'Assigned', // Assigned to delivery person
  PICKED_FROM_ORGANIZER = 'Picked From Organizer',
  OUT_FOR_DELIVERY = 'Out For Delivery',
  DELIVERED = 'Delivered',
  FAILED = 'Delivery Failed',
  CANCELLED = 'Cancelled'
}

export enum PaymentStatus {
  PENDING = 'Pending',
  COMPLETED = 'Completed',
  FAILED = 'Failed'
}

export interface IOrderItem {
  participantId: mongoose.Types.ObjectId; // Link to Participant
  bibNumber: string;
  eventName: string;
  qrImage?: string; // URL if uploaded
}

export interface IOrder extends Document {
  customer: mongoose.Types.ObjectId;
  items: IOrderItem[];
  
  deliveryAddress: {
    street: string;
    city: string;
    zip: string;
    location?: { lat: number; lng: number };
  };

  status: OrderStatus;
  
  // Delivery Assignment
  deliveryPerson?: mongoose.Types.ObjectId;
  
  // Logistics
  pickupPin?: string; // Validated against Event's PIN or generated one
  deliveryOtp: string; // OTP to be shared with customer upon delivery

  // Financials
  distanceKm: number;
  deliveryFee: number;
  paymentMethod: 'COD' | 'ONLINE';
  paymentStatus: PaymentStatus;

  // Timestamps for tracking
  statusHistory: {
    status: OrderStatus;
    timestamp: Date;
    note?: string;
  }[];

  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
      participantId: { type: Schema.Types.ObjectId, ref: 'Participant' },
      bibNumber: String,
      eventName: String,
      qrImage: String
    }],
    deliveryAddress: {
      street: String,
      city: String,
      zip: String,
      location: { lat: Number, lng: Number }
    },
    status: { 
      type: String, 
      enum: Object.values(OrderStatus),
      default: OrderStatus.CREATED 
    },
    deliveryPerson: { type: Schema.Types.ObjectId, ref: 'User' },
    pickupPin: String,
    deliveryOtp: String,
    
    distanceKm: Number,
    deliveryFee: Number,
    paymentMethod: { type: String, enum: ['COD', 'ONLINE'], default: 'COD' },
    paymentStatus: { type: String, enum: Object.values(PaymentStatus), default: PaymentStatus.PENDING },

    statusHistory: [{
      status: String,
      timestamp: { type: Date, default: Date.now },
      note: String
    }]
  },
  { timestamps: true }
);

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
