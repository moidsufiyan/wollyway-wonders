import { Product, normalizeProduct } from '@/types/Product';
import productsData from '@/data/products.json';

// Consolidate mock data: load from products.json and normalize
export const allProducts: Product[] = (productsData as Record<string, unknown>[]).map(normalizeProduct);

export const getProductById = (id: string | number): Product | null => {
  const targetId = String(id);
  return allProducts.find(p => String(p.id) === targetId) || null;
};

export const getRelatedProducts = (currentId: string | number): Product[] => {
  const targetId = String(currentId);
  return allProducts
    .filter(product => String(product.id) !== targetId)
    .slice(0, 3);
};

export default {
  getProductById,
  getRelatedProducts,
  allProducts
};
