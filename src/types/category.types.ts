export type CategoryStatus = 'active' | 'hidden' | 'archived';

export interface CategoryImageDTO {
  url?: string | null;
  publicId?: string | null;
  alt?: string | null;
  width?: number | null;
  height?: number | null;
}

export interface CategorySeoDTO {
  title?: string | null;
  description?: string | null;
  keywords?: string[];
  canonicalUrl?: string | null;
}

export interface CategoryDTO {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image?: CategoryImageDTO;
  status: CategoryStatus;
  sortOrder: number;
  featured: boolean;
  seo?: CategorySeoDTO;
  parentId?: string | null;
  archivedAt?: string | null;
  createdBy?: string | null;
  updatedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryDTO {
  name: string;
  description: string;
  image?: CategoryImageDTO;
  status?: CategoryStatus;
  sortOrder?: number;
  featured?: boolean;
  seo?: CategorySeoDTO;
  parentId?: string | null;
}

export interface UpdateCategoryDTO {
  name?: string;
  description?: string;
  image?: CategoryImageDTO;
  status?: CategoryStatus;
  sortOrder?: number;
  featured?: boolean;
  seo?: CategorySeoDTO;
  parentId?: string | null;
}

export interface CategoryFilterParams {
  featured?: boolean;
  status?: CategoryStatus;
}
