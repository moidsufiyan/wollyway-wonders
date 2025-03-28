
import { Product } from '@/pages/Shop';

const allProducts: Product[] = [
  {
    id: 1,
    name: "Super Hero Keychain",
    price: 19.99,
    image: "/lovable-uploads/9b7faa7c-2370-41a7-8fe8-74ec795bcaa4.png",
    category: "Keychains",
    tags: ["superhero", "black", "red", "white"],
    rating: 4.5,
    isNew: true,
    colors: ["black", "red", "white"],
    description: "Handcrafted superhero themed keychain made with premium materials. Each piece is carefully created with attention to detail, featuring bold colors and durable construction. The metal clasp ensures secure attachment to your keys or bags.",
    stockCount: 15
  },
  {
    id: 2,
    name: "Friendship Bracelets Set",
    price: 24.99,
    image: "/lovable-uploads/0ebd024d-195a-4c96-aa94-bbdecc95fbb0.png",
    category: "Bracelets",
    tags: ["friendship", "wristband", "black", "red", "white"],
    rating: 4.8,
    isFeatured: true,
    colors: ["black", "red", "white"],
    description: "Set of handwoven friendship bands with custom designs. These bracelets are made with high-quality cotton threads and showcase intricate patterns. Perfect as a gift for friends or for adding a personal touch to your style.",
    stockCount: 10
  },
  {
    id: 3,
    name: "Batman Inspired Band",
    price: 22.99,
    image: "/lovable-uploads/3f97e89a-56b1-43a3-a5ca-a3c402262b9f.png",
    category: "Bands",
    tags: ["superhero", "batman", "black", "yellow"],
    rating: 4.7,
    isNew: false,
    colors: ["black", "yellow"],
    description: "Superhero-inspired handwoven band with iconic pattern. This band features the instantly recognizable bat symbol woven with precision. Made from durable materials that will last, while maintaining a comfortable feel.",
    stockCount: 8
  }
];

export const getProductById = (id: string | number): Product | null => {
  const productId = typeof id === 'string' ? parseInt(id) : id;
  return allProducts.find(p => p.id === productId) || null;
};

export const getRelatedProducts = (currentId: number): Product[] => {
  return allProducts
    .filter(product => product.id !== currentId)
    .slice(0, 4);
};

export default {
  getProductById,
  getRelatedProducts,
  allProducts
};
