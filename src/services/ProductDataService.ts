
import { Product } from '@/pages/Shop';

const allProducts: Product[] = [
  {
    id: 1,
    name: "Hand-Knitted Superhero Keychain",
    price: 19.99,
    image: "/lovable-uploads/9b7faa7c-2370-41a7-8fe8-74ec795bcaa4.png",
    category: "Knitted Keychains",
    tags: ["knitted", "superhero", "black", "red", "white", "handmade"],
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
    category: "Knitted Bracelets",
    tags: ["friendship", "knitted", "wristband", "black", "red", "white", "handmade"],
    rating: 4.8,
    isFeatured: true,
    colors: ["black", "red", "white"],
    description: "Set of hand-knitted friendship bands with custom designs. These bracelets are made with high-quality wool yarn and showcase intricate knitting patterns. Perfect as a gift for friends or for adding a personal touch to your style.",
    stockCount: 10
  },
  {
    id: 3,
    name: "Batman Inspired Knitted Wristband",
    price: 22.99,
    image: "/lovable-uploads/3f97e89a-56b1-43a3-a5ca-a3c402262b9f.png",
    category: "Knitted Wristbands",
    tags: ["knitted", "superhero", "batman", "black", "yellow", "handmade"],
    rating: 4.7,
    isNew: false,
    colors: ["black", "yellow"],
    description: "Superhero-inspired hand-knitted wristband with iconic pattern. This band features the instantly recognizable bat symbol knitted with precision. Made from soft merino wool that will last, while maintaining a comfortable feel against your skin.",
    stockCount: 8
  },
  {
    id: 4,
    name: "Wool Knitted Winter Headband",
    price: 18.99,
    image: "/lovable-uploads/0ebd024d-195a-4c96-aa94-bbdecc95fbb0.png",
    category: "Knitted Headbands",
    tags: ["knitted", "winter", "warm", "wool", "handmade"],
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
    category: "Knitted Home Accessories",
    tags: ["knitted", "home", "rainbow", "colorful", "handmade"],
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
    category: "Knitted Baby Items",
    tags: ["knitted", "baby", "booties", "gift", "handmade"],
    rating: 5.0,
    isFeatured: true,
    colors: ["pink", "blue", "white", "yellow"],
    description: "Adorable hand-knitted baby booties made with the softest hypoallergenic yarn. Perfect for keeping tiny feet warm and cozy. Each pair is knitted with love and features secure ties to ensure they stay on active little feet.",
    stockCount: 15,
    sizes: ["0-3m", "3-6m", "6-12m"]
  },
  {
    id: 7,
    name: "Cozy Knitted Fingerless Gloves",
    price: 16.99,
    image: "/lovable-uploads/9b7faa7c-2370-41a7-8fe8-74ec795bcaa4.png",
    category: "Knitted Gloves",
    tags: ["knitted", "winter", "fingerless", "gloves", "handmade"],
    rating: 4.7,
    colors: ["burgundy", "navy", "forest green"],
    description: "Elegant hand-knitted fingerless gloves that provide warmth while allowing dexterity for typing, texting, or any activity requiring finger freedom. Made with super soft alpaca wool blend for maximum comfort and durability.",
    stockCount: 14
  },
  {
    id: 8,
    name: "Knitted Coffee Mug Cozy",
    price: 9.99,
    image: "/lovable-uploads/0ebd024d-195a-4c96-aa94-bbdecc95fbb0.png",
    category: "Knitted Home Accessories",
    tags: ["knitted", "mug", "coffee", "cozy", "handmade"],
    rating: 4.5,
    isNew: true,
    colors: ["teal", "mustard", "cream"],
    description: "Keep your drinks warm and your hands protected with these adorable hand-knitted coffee mug cozies. Each cozy features a button closure for easy removal and washing. Perfect for coffee lovers and tea enthusiasts alike.",
    stockCount: 25
  },
  {
    id: 9,
    name: "Cable Knit Ear Warmers",
    price: 14.99,
    image: "/lovable-uploads/3f97e89a-56b1-43a3-a5ca-a3c402262b9f.png",
    category: "Knitted Headbands",
    tags: ["knitted", "ear warmers", "winter", "cable knit", "handmade"],
    rating: 4.9,
    colors: ["ivory", "charcoal", "dusty rose"],
    description: "Beautiful cable knit ear warmers handcrafted with premium merino wool. These stylish ear warmers feature an intricate cable pattern and can be worn under a hat or on their own. Perfect for keeping ears toasty during winter activities.",
    stockCount: 18
  },
  {
    id: 10,
    name: "Knitted Phone Pouch",
    price: 11.99,
    image: "/lovable-uploads/9b7faa7c-2370-41a7-8fe8-74ec795bcaa4.png",
    category: "Knitted Accessories",
    tags: ["knitted", "phone", "pouch", "gadget", "handmade"],
    rating: 4.4,
    isFeatured: false,
    colors: ["lilac", "mint green", "peach"],
    description: "Protect your phone in style with this hand-knitted phone pouch. Features a button closure and soft lining to prevent scratches. The stretchy yarn accommodates most smartphone sizes while the reinforced bottom provides extra protection.",
    stockCount: 22
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
