
import { Product } from '@/types/Product';

const allProducts: Product[] = [
  {
    id: 1,
    name: "Hand-Knitted Wool Beanie",
    price: 29.99,
    image: "/lovable-uploads/9b7faa7c-2370-41a7-8fe8-74ec795bcaa4.png",
    category: "Knitted Hats",
    tags: ["wool", "beanie", "winter", "handmade", "knitted"],
    rating: 4.8,
    isNew: true,
    colors: ["gray", "navy", "burgundy"],
    description: "Cozy hand-knitted beanie made with premium merino wool. Perfect for cold weather with a stylish cable knit pattern.",
    stockCount: 15
  },
  {
    id: 2,
    name: "Hand-Knitted Wool Scarf",
    price: 39.99,
    image: "/lovable-uploads/0ebd024d-195a-4c96-aa94-bbdecc95fbb0.png",
    category: "Knitted Scarves",
    tags: ["wool", "scarf", "winter", "handmade", "knitted"],
    rating: 4.9,
    isFeatured: true,
    colors: ["cream", "charcoal", "forest green"],
    description: "Luxurious hand-knitted scarf crafted with the softest alpaca wool. Features a classic ribbed pattern that provides both warmth and style.",
    stockCount: 20
  },
  {
    id: 3,
    name: "Hand-Knitted Winter Mittens",
    price: 24.99,
    image: "/lovable-uploads/3f97e89a-56b1-43a3-a5ca-a3c402262b9f.png",
    category: "Knitted Gloves",
    tags: ["wool", "mittens", "winter", "handmade", "knitted"],
    rating: 4.7,
    isFeatured: true,
    colors: ["red", "black", "white"],
    description: "Warm and comfortable mittens hand-knitted with premium wool and lined with soft fleece. Perfect for keeping your hands cozy during winter activities.",
    stockCount: 18
  },
  {
    id: 4,
    name: "Hand-Knitted Wool Headband",
    price: 18.99,
    image: "/lovable-uploads/0ebd024d-195a-4c96-aa94-bbdecc95fbb0.png",
    category: "Knitted Headbands",
    tags: ["wool", "headband", "winter", "handmade", "knitted"],
    rating: 4.6,
    colors: ["burgundy", "navy", "cream"],
    description: "Stylish hand-knitted headband with beautiful cable knit pattern and soft fleece lining for extra warmth and comfort.",
    stockCount: 25
  }
];

export const getProductById = (id: string | number): Product | null => {
  const productId = typeof id === 'string' ? parseInt(id) : id;
  return allProducts.find(p => p.id === productId) || null;
};

export const getRelatedProducts = (currentId: number): Product[] => {
  return allProducts
    .filter(product => product.id !== currentId)
    .slice(0, 3);
};

export default {
  getProductById,
  getRelatedProducts,
  allProducts
};
