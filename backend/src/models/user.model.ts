import { Schema, model, Document, Types } from 'mongoose';

// Address Interface & Sub-Schema
export interface IAddress {
  _id: Types.ObjectId;
  label: 'Home' | 'Work' | 'Office' | 'Other';
  customLabel?: string;
  streetAddress: string;
  apartmentSuite?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

const AddressSchema = new Schema<IAddress>({
  label: {
    type: String,
    enum: ['Home', 'Work', 'Office', 'Other'],
    default: 'Home',
  },
  customLabel: {
    type: String,
    default: null,
    trim: true,
  },
  streetAddress: {
    type: String,
    required: true,
    trim: true,
  },
  apartmentSuite: {
    type: String,
    default: null,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    required: true,
    trim: true,
  },
  postalCode: {
    type: String,
    required: true,
    trim: true,
  },
  country: {
    type: String,
    required: true,
    default: 'India',
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
});

// Cart Item Interface & Sub-Schema
export interface ICartItem {
  productId: Types.ObjectId;
  quantity: number;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity cannot be less than 1.'],
      default: 1,
    },
  },
  { _id: false }
);

// User Interface & Main Schema
export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  avatar: {
    url: string | null;
    publicId: string | null;
  };
  role: 'customer' | 'admin';
  status: 'active' | 'suspended' | 'deactivated';
  phone: string | null;
  addresses: IAddress[];
  wishlist: Types.ObjectId[];
  cart: ICartItem[];
  preferences: {
    newsletter: boolean;
    marketingEmails: boolean;
    language: string;
    currency: string;
  };
  emailVerified: boolean;
  lastLoginAt: Date | null;
  passwordChangedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required.'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required.'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required.'],
      select: false,
    },
    avatar: {
      url: {
        type: String,
        default: null,
      },
      publicId: {
        type: String,
        default: null,
      },
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'deactivated'],
      default: 'active',
    },
    phone: {
      type: String,
      default: null,
      trim: true,
    },
    addresses: [AddressSchema],
    wishlist: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    cart: [CartItemSchema],
    preferences: {
      newsletter: {
        type: Boolean,
        default: false,
      },
      marketingEmails: {
        type: Boolean,
        default: false,
      },
      language: {
        type: String,
        default: 'en',
      },
      currency: {
        type: String,
        default: 'INR',
      },
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    passwordChangedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Enforce single default address logic in pre-save hooks
UserSchema.pre<IUser>('save', function (next) {
  if (this.isModified('addresses')) {
    const defaultAddresses = this.addresses.filter((addr) => addr.isDefault);
    if (defaultAddresses.length > 1) {
      // Revert earlier default addresses, retaining the last one modified
      const primaryDefault = defaultAddresses[defaultAddresses.length - 1];
      this.addresses.forEach((addr) => {
        if (addr._id.toString() !== primaryDefault._id.toString()) {
          addr.isDefault = false;
        }
      });
    } else if (defaultAddresses.length === 0 && this.addresses.length > 0) {
      // Enforce the first address as default if none is set
      this.addresses[0].isDefault = true;
    }
  }
  next();
});

export const User = model<IUser>('User', UserSchema);
