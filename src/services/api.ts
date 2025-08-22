
// Static data imports
import productsData from '@/data/products.json';
import usersData from '@/data/users.json';

// Mock API delay for realistic experience
const mockDelay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Generate mock token
const generateMockToken = (userId: string) => {
  return `mock_token_${userId}_${Date.now()}`;
};

// API service methods with static data
export const userService = {
  login: async (email: string, password: string) => {
    await mockDelay();
    
    const user = usersData.find(u => u.email === email && u.password === password);
    if (!user) {
      throw new Error('Invalid email or password');
    }
    
    const token = generateMockToken(user.id);
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      token
    };
    
    // Store in localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    
    return userData;
  },
  
  register: async (name: string, email: string, password: string) => {
    await mockDelay();
    
    // Check if user already exists
    if (usersData.find(u => u.email === email)) {
      throw new Error('User already exists with this email');
    }
    
    const newUser = {
      id: String(Date.now()),
      name,
      email,
      password,
      avatar: 'https://i.pravatar.cc/150',
      role: 'user'
    };
    
    const token = generateMockToken(newUser.id);
    const userData = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      avatar: newUser.avatar,
      role: newUser.role,
      token
    };
    
    // Store in localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    
    return userData;
  },
  
  getProfile: async () => {
    await mockDelay();
    
    const userData = localStorage.getItem('user');
    if (!userData) {
      throw new Error('Not authenticated');
    }
    
    return JSON.parse(userData);
  },
  
  updateProfile: async (userData: any) => {
    await mockDelay();
    
    const currentUser = localStorage.getItem('user');
    if (!currentUser) {
      throw new Error('Not authenticated');
    }
    
    const user = JSON.parse(currentUser);
    const updatedUser = { ...user, ...userData };
    
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    return updatedUser;
  },
};

export const productService = {
  getProducts: async (params: any = {}) => {
    await mockDelay();
    
    let filteredProducts = [...productsData];
    
    // Apply filters
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase();
      filteredProducts = filteredProducts.filter(product => 
        product.name.toLowerCase().includes(keyword) ||
        product.description.toLowerCase().includes(keyword) ||
        product.category.toLowerCase().includes(keyword)
      );
    }
    
    if (params.category) {
      filteredProducts = filteredProducts.filter(product => 
        product.category.toLowerCase() === params.category.toLowerCase()
      );
    }
    
    if (params.featured !== undefined) {
      filteredProducts = filteredProducts.filter(product => product.featured === params.featured);
    }
    
    // Apply sorting
    if (params.sort) {
      switch (params.sort) {
        case 'price_asc':
          filteredProducts.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          filteredProducts.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          filteredProducts.sort((a, b) => b.rating - a.rating);
          break;
        case 'newest':
          // Mock newest sort by id
          filteredProducts.sort((a, b) => Number(b.id) - Number(a.id));
          break;
        default:
          break;
      }
    }
    
    return {
      products: filteredProducts,
      page: 1,
      pages: 1,
      count: filteredProducts.length
    };
  },
  
  getProductById: async (id: string) => {
    await mockDelay();
    
    const product = productsData.find(p => p.id === id);
    if (!product) {
      throw new Error('Product not found');
    }
    
    return product;
  },
  
  createReview: async (productId: string, reviewData: any) => {
    await mockDelay();
    
    // Mock review creation - in a real app this would update the database
    const review = {
      id: String(Date.now()),
      user: reviewData.user || 'Anonymous',
      rating: reviewData.rating,
      comment: reviewData.comment,
      createdAt: new Date().toISOString()
    };
    
    return { message: 'Review added successfully', review };
  },
  
  getTopProducts: async () => {
    await mockDelay();
    
    const topProducts = productsData
      .filter(p => p.featured)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 4);
    
    return topProducts;
  },
};

export const orderService = {
  createOrder: async (orderData: any) => {
    await mockDelay();
    
    const order = {
      id: String(Date.now()),
      ...orderData,
      status: 'Processing',
      isPaid: false,
      isDelivered: false,
      createdAt: new Date().toISOString(),
      orderNumber: `WW${Date.now().toString().slice(-6)}`
    };
    
    // Store order in localStorage for demo purposes
    const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    existingOrders.push(order);
    localStorage.setItem('orders', JSON.stringify(existingOrders));
    
    return order;
  },
  
  getOrderById: async (id: string) => {
    await mockDelay();
    
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const order = orders.find((o: any) => o.id === id);
    
    if (!order) {
      throw new Error('Order not found');
    }
    
    return order;
  },
  
  payOrder: async (id: string, paymentResult: any) => {
    await mockDelay();
    
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const orderIndex = orders.findIndex((o: any) => o.id === id);
    
    if (orderIndex === -1) {
      throw new Error('Order not found');
    }
    
    orders[orderIndex] = {
      ...orders[orderIndex],
      isPaid: true,
      paidAt: new Date().toISOString(),
      paymentResult
    };
    
    localStorage.setItem('orders', JSON.stringify(orders));
    
    return orders[orderIndex];
  },
  
  getMyOrders: async () => {
    await mockDelay();
    
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    
    // Filter orders by current user (in a real app)
    return orders;
  },
};
