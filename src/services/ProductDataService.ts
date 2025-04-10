
import { Product } from '@/pages/Shop';

const allProducts: Product[] = [
  {
    id: 1,
    name: "Hand-Knitted Hero Keychain",
    price: 19.99,
    image: "/lovable-uploads/9b7faa7c-2370-41a7-8fe8-74ec795bcaa4.png",
    category: "Keychains",
    tags: ["knitted", "superhero", "black", "red", "white"],
    rating: 4.5,
    isNew: true,
    colors: ["black", "red", "white"],
    description: "Handcrafted superhero themed keychain carefully knitted with premium wool. Each piece features bold colors and durable construction with meticulous attention to detail. The metal clasp ensures secure attachment to your keys or bags.",
    stockCount: 15
  },
  {
    id: 2,
    name: "Knitted Friendship Bracelet Set",
    price: 24.99,
    image: "/lovable-uploads/0ebd024d-195a-4c96-aa94-bbdecc95fbb0.png",
    category: "Bracelets",
    tags: ["friendship", "knitted", "wristband", "black", "red", "white"],
    rating: 4.8,
    isFeatured: true,
    colors: ["black", "red", "white"],
    description: "Set of hand-knitted friendship bands with custom designs. These bracelets are made with high-quality wool yarn and showcase intricate knitting patterns. Perfect as a gift for friends or for adding a personal touch to your style.",
    stockCount: 10
  },
  {
    id: 3,
    name: "Batman Inspired Knitted Band",
    price: 22.99,
    image: "/lovable-uploads/3f97e89a-56b1-43a3-a5ca-a3c402262b9f.png",
    category: "Bands",
    tags: ["knitted", "superhero", "batman", "black", "yellow"],
    rating: 4.7,
    isNew: false,
    colors: ["black", "yellow"],
    description: "Superhero-inspired hand-knitted band with iconic pattern. This band features the instantly recognizable bat symbol knitted with precision. Made from soft merino wool that will last, while maintaining a comfortable feel against your skin.",
    stockCount: 8
  },
  {
    id: 4,
    name: "Wool Winter Headband",
    price: 18.99,
    image: "/lovable-uploads/0ebd024d-195a-4c96-aa94-bbdecc95fbb0.png",
    category: "Headbands",
    tags: ["knitted", "winter", "warm", "wool"],
    rating: 4.6,
    colors: ["red", "blue", "gray"],
    description: "Keep your ears warm with this stylish hand-knitted wool headband. Features a beautiful cable knit pattern and soft fleece lining for extra comfort during cold days. Made with premium wool that's both warm and breathable.",
    stockCount: 12
  },
  {
    id: 5,
    name: "Rainbow Knitted Coasters Set",
    price: 15.99,
    image: "/lovable-uploads/9b7faa7c-2370-41a7-8fe8-74ec795bcaa4.png",
    category: "Home Accessories",
    tags: ["knitted", "home", "rainbow", "colorful"],
    rating: 4.9,
    isNew: true,
    colors: ["multicolor"],
    description: "Set of 4 vibrant hand-knitted coasters that will brighten up any table. Each coaster is made with cotton yarn in a rainbow of colors and features a unique pattern. Absorbent and durable, perfect for hot or cold beverages.",
    stockCount: 20
  },
  {
    id: 6,
    name: "Knitted Baby Booties",
    price: 12.99,
    image: "/lovable-uploads/3f97e89a-56b1-43a3-a5ca-a3c402262b9f.png",
    category: "Baby Items",
    tags: ["knitted", "baby", "booties", "gift"],
    rating: 5.0,
    isFeatured: true,
    colors: ["pink", "blue", "white", "yellow"],
    description: "Adorable hand-knitted baby booties made with the softest hypoallergenic yarn. Perfect for keeping tiny feet warm and cozy. Each pair is knitted with love and features secure ties to ensure they stay on active little feet.",
    stockCount: 15,
    sizes: ["0-3m", "3-6m", "6-12m"]
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
