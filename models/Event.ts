import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEvent extends Document {
  name: string;
  description?: string;
  organizer: mongoose.Types.ObjectId;
  date: Date;
  venue: string;
  registrationOpen: boolean;
  deliveryEnabled: boolean;
  image?: string;
  
  // Custom Settings
  deliveryPickupPin?: string; // Optional PIN for delivery person pickup
  deliveryChargeOverwrite?: number; // Base charge override

  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    name: { type: String, required: true },
    description: String,
    organizer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    venue: { type: String, required: true },
    registrationOpen: { type: Boolean, default: true },
    deliveryEnabled: { type: Boolean, default: true },
    image: String,
    deliveryPickupPin: String,
    deliveryChargeOverwrite: Number,
  },
  { timestamps: true }
);

const Event: Model<IEvent> = mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);

export default Event;
