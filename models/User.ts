import mongoose, { Schema, Document, Model } from 'mongoose';

export enum UserRole {
  CUSTOMER = 'customer',
  ORGANIZER = 'organizer',
  DELIVERY = 'delivery',
  ADMIN = 'admin',
}

export interface IAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  isDefault: boolean;
  location?: { // simplified for now, can be GeoJSON later
    lat: number;
    lng: number;
  };
}

export interface IUser extends Document {
  mobile?: string;
  email?: string;
  password?: string; // Hashed
  role: UserRole;
  name?: string;
  
  // For Customers
  otp?: {
    code: string;
    expiresAt: Date;
  };
  isVerified: boolean;
  savedAddresses: IAddress[];
  alternateMobile?: string;

  // For Delivery
  isAvailable?: boolean;
  currentLocation?: {
    lat: number;
    lng: number;
  };

  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema({
  street: String,
  city: String,
  state: String,
  zip: String,
  isDefault: { type: Boolean, default: false },
  location: {
    lat: Number,
    lng: Number
  }
});

const UserSchema = new Schema<IUser>(
  {
    mobile: {
      type: String,
      unique: true,
      sparse: true, // Allows null/undefined to be non-unique if multiple roles exist? Actually mobile should be unique for customers.
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, select: false }, // Don't return by default
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.CUSTOMER,
      required: true,
    },
    name: String,
    
    // Auth & Verification
    otp: {
      code: String,
      expiresAt: Date,
    },
    isVerified: { type: Boolean, default: false },

    // Customer specific
    savedAddresses: [AddressSchema],
    alternateMobile: String,

    // Delivery specific
    isAvailable: { type: Boolean, default: true },
    currentLocation: {
      lat: Number,
      lng: Number,
    },
  },
  { timestamps: true }
);

// Indexes
UserSchema.index({ mobile: 1 });
UserSchema.index({ email: 1 });

// Check if model already exists to prevent overwrite during hot reload
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
