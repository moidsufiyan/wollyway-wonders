import { Schema, model, Document, Types } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  description: string;
  image: {
    url: string | null;
    publicId: string | null;
    alt: string | null;
    width: number | null;
    height: number | null;
  };
  status: 'active' | 'hidden' | 'archived';
  sortOrder: number;
  featured: boolean;
  seo: {
    title: string | null;
    description: string | null;
    keywords: string[];
    canonicalUrl: string | null;
  };
  parentId: Types.ObjectId | null;
  archivedAt: Date | null;
  createdBy: Types.ObjectId | null;
  updatedBy: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required.'],
      trim: true,
      minlength: [2, 'Category name must have at least 2 characters.'],
      maxlength: [50, 'Category name cannot exceed 50 characters.'],
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Category description is required.'],
      trim: true,
      minlength: [10, 'Category description must have at least 10 characters.'],
      maxlength: [500, 'Category description cannot exceed 500 characters.'],
    },
    image: {
      url: {
        type: String,
        default: null,
      },
      publicId: {
        type: String,
        default: null,
      },
      alt: {
        type: String,
        default: null,
      },
      width: {
        type: Number,
        default: null,
      },
      height: {
        type: Number,
        default: null,
      },
    },
    status: {
      type: String,
      enum: ['active', 'hidden', 'archived'],
      default: 'active',
      index: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
      index: true,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    seo: {
      title: {
        type: String,
        default: null,
      },
      description: {
        type: String,
        default: null,
      },
      keywords: {
        type: [String],
        default: [],
      },
      canonicalUrl: {
        type: String,
        default: null,
      },
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    archivedAt: {
      type: Date,
      default: null,
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
  },
  {
    timestamps: true,
  }
);

// Create compound index for sorting & status lookups
CategorySchema.index({ status: 1, sortOrder: 1 });

// Slug auto-generation pre-save hook
CategorySchema.pre<ICategory>('save', async function (next) {
  if (!this.isModified('name')) return next();

  try {
    let baseSlug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Check database collisions
    const slugRegex = new RegExp(`^${baseSlug}(-\\d+)?$`);
    const matchingCategories = await model<ICategory>('Category')
      .find({
        slug: slugRegex,
        _id: { $ne: this._id },
      })
      .select('slug');

    if (matchingCategories.length > 0) {
      let maxNumber = 1;
      matchingCategories.forEach((cat) => {
        const match = cat.slug.match(/-(\d+)$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNumber) {
            maxNumber = num;
          }
        }
      });
      baseSlug = `${baseSlug}-${maxNumber + 1}`;
    }

    this.slug = baseSlug;
    next();
  } catch (error: unknown) {
    next(error as Error);
  }
});

export const Category = model<ICategory>('Category', CategorySchema);
