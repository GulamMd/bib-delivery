import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IParticipant extends Document {
  event: mongoose.Types.ObjectId;
  mobile: string; // The primary identifier from the CSV
  bibNumber: string;
  name: string;
  category?: string; // e.g., 10k, 21k
  registrationId?: string;
  
  // Optional: Link to actual User account if they have registered on this platform
  linkedUser?: mongoose.Types.ObjectId; 

  // Status
  isKitDelivered: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const ParticipantSchema = new Schema<IParticipant>(
  {
    event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    mobile: { type: String, required: true, index: true },
    bibNumber: { type: String, required: true },
    name: { type: String, required: true },
    category: String,
    registrationId: String,
    linkedUser: { type: Schema.Types.ObjectId, ref: 'User' },
    isKitDelivered: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Compound index to ensure unique bib per event
ParticipantSchema.index({ event: 1, bibNumber: 1 }, { unique: true });
ParticipantSchema.index({ event: 1, mobile: 1 }); // Fast lookup of bibs for a user in an event

const Participant: Model<IParticipant> = mongoose.models.Participant || mongoose.model<IParticipant>('Participant', ParticipantSchema);

export default Participant;
