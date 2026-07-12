import { Schema, model, Document, Types } from 'mongoose';

export interface IImage {
  url: string;
  publicId: string;
  alt: string;
  width: number;
  height: number;
  isPrimary: boolean;
  displayOrder: number;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  categoryId: Types.ObjectId;

  price: number;
  salePrice?: number;

  images: IImage[];

  materials: string[];
  careInstructions?: string;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'in';
  };
  weight?: {
    value: number;
    unit: 'g' | 'kg' | 'oz' | 'lb';
  };

  isCustomizable: boolean;
  estimatedProductionDays?: number;

  tags: string[];
  featured: boolean;
  visibility: 'draft' | 'published' | 'hidden' | 'archived';

  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
    canonicalUrl?: string;
  };

  createdBy?: Types.ObjectId | null;
  updatedBy?: Types.ObjectId | null;
  archivedAt?: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

const ImageSchema = new Schema<IImage>(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    alt: { type: String, default: '' },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    isPrimary: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      minlength: [3, 'Product name must be at least 3 characters'],
      maxlength: [100, 'Product name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Product slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-z0-9-]+$/,
        'Slug must only contain lowercase alphanumeric characters and hyphens',
      ],
    },
    shortDescription: {
      type: String,
      trim: true,
      maxlength: [200, 'Short description cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category reference is required'],
    },
    price: {
      type: Number,
      required: [true, 'Base price is required'],
      min: [0, 'Price cannot be negative'],
    },
    salePrice: {
      type: Number,
      min: [0, 'Sale price cannot be negative'],
    },
    images: {
      type: [ImageSchema],
      default: [],
    },
    materials: {
      type: [String],
      default: [],
    },
    careInstructions: {
      type: String,
      trim: true,
    },
    dimensions: {
      length: { type: Number, min: 0 },
      width: { type: Number, min: 0 },
      height: { type: Number, min: 0 },
      unit: { type: String, enum: ['cm', 'in'] },
    },
    weight: {
      value: { type: Number, min: 0 },
      unit: { type: String, enum: ['g', 'kg', 'oz', 'lb'] },
    },
    isCustomizable: {
      type: Boolean,
      default: false,
    },
    estimatedProductionDays: {
      type: Number,
      min: [0, 'Production days cannot be negative'],
    },
    tags: {
      type: [String],
      default: [],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    visibility: {
      type: String,
      enum: ['draft', 'published', 'hidden', 'archived'],
      default: 'draft',
      index: true,
    },
    seo: {
      title: { type: String },
      description: { type: String },
      keywords: { type: [String], default: [] },
      canonicalUrl: { type: String },
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    archivedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ProductSchema.index({ slug: 1 }, { unique: true });
ProductSchema.index({ categoryId: 1, visibility: 1 });
ProductSchema.index({ visibility: 1, featured: -1 });
ProductSchema.index({ tags: 1 });
ProductSchema.index({ _id: 1, visibility: 1 });

// Text Index for native search
ProductSchema.index(
  {
    name: 'text',
    materials: 'text',
    shortDescription: 'text',
    tags: 'text',
  },
  {
    weights: {
      name: 10,
      tags: 5,
      materials: 5,
      shortDescription: 1,
    },
    name: 'product_text_index',
  }
);

export const Product = model<IProduct>('Product', ProductSchema);
