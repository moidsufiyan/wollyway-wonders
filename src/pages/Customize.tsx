
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { Check, Heart, ShoppingCart, RotateCcw, Download } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';

type ProductType = 'handband' | 'keychain';

const Customize = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addItem } = useCart();
  
  const [productType, setProductType] = useState<ProductType>('handband');
  const [color, setColor] = useState('red');
  const [size, setSize] = useState('medium');
  const [style, setStyle] = useState('classic');
  const [text, setText] = useState('');
  const [quantity, setQuantity] = useState(1);
  
  const colors = [
    { id: 'red', name: 'Red', class: 'bg-red-500' },
    { id: 'blue', name: 'Blue', class: 'bg-blue-500' },
    { id: 'green', name: 'Green', class: 'bg-green-500' },
    { id: 'purple', name: 'Purple', class: 'bg-purple-500' },
    { id: 'pink', name: 'Pink', class: 'bg-pink-500' },
    { id: 'yellow', name: 'Yellow', class: 'bg-yellow-400' },
    { id: 'black', name: 'Black', class: 'bg-black' },
    { id: 'white', name: 'White', class: 'bg-white border border-gray-300' },
  ];
  
  const sizes = [
    { id: 'small', name: 'Small' },
    { id: 'medium', name: 'Medium' },
    { id: 'large', name: 'Large' },
  ];
  
  const styles = [
    { id: 'classic', name: 'Classic' },
    { id: 'braided', name: 'Braided' },
    { id: 'woven', name: 'Woven' },
    { id: 'beaded', name: 'Beaded' },
  ];
  
  const handleAddToCart = () => {
    // Create a customized product object
    const customProduct = {
      id: `custom-${productType}-${Date.now()}`,
      name: `Custom ${productType === 'handband' ? 'Hand Band' : 'Keychain'}`,
      price: productType === 'handband' ? 19.99 : 14.99,
      image: productType === 'handband' ? 'https://placehold.co/400x400/red/white?text=Custom+Band' : 'https://placehold.co/400x400/blue/white?text=Custom+Keychain',
      category: 'Custom',
      customizations: {
        color,
        size: productType === 'handband' ? size : null,
        style,
        text: text.trim() || null,
      },
      isCustom: true,
    };
    
    // Add to cart
    addItem(customProduct as any, quantity);
    
    // Show toast notification
    toast({
      title: "Added to cart!",
      description: `${quantity} x ${customProduct.name} added to your cart.`,
    });
    
    // Navigate to cart page
    navigate('/cart');
  };
  
  const handleReset = () => {
    setColor('red');
    setSize('medium');
    setStyle('classic');
    setText('');
    setQuantity(1);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-8 text-center">Customize Your Product</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Preview */}
            <div className="bg-gray-50 rounded-xl p-8 flex items-center justify-center">
              <div className="relative">
                <img 
                  src={productType === 'handband' 
                    ? 'https://placehold.co/400x400/red/white?text=Hand+Band' 
                    : 'https://placehold.co/400x400/blue/white?text=Keychain'
                  } 
                  alt="Product Preview" 
                  className="w-full max-w-md mx-auto rounded-lg shadow-md"
                />
                
                {text && (
                  <div className="absolute bottom-6 left-0 right-0 text-center">
                    <span className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full font-semibold text-black">
                      {text}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Customization Options */}
            <div>
              <Tabs defaultValue="handband" onValueChange={(value) => setProductType(value as ProductType)}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="handband">Hand Band</TabsTrigger>
                  <TabsTrigger value="keychain">Keychain</TabsTrigger>
                </TabsList>
                
                <TabsContent value="handband">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-semibold mb-3">Choose Color</h2>
                      <div className="flex flex-wrap gap-2">
                        {colors.map((colorOption) => (
                          <button
                            key={colorOption.id}
                            type="button"
                            onClick={() => setColor(colorOption.id)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform ${colorOption.class} ${
                              color === colorOption.id ? 'ring-2 ring-offset-2 ring-wolly-magenta scale-110' : ''
                            }`}
                            title={colorOption.name}
                          >
                            {color === colorOption.id && (
                              <Check className={`h-5 w-5 ${colorOption.id === 'white' ? 'text-black' : 'text-white'}`} />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h2 className="text-lg font-semibold mb-3">Choose Size</h2>
                      <RadioGroup 
                        value={size} 
                        onValueChange={setSize}
                        className="flex flex-wrap gap-4"
                      >
                        {sizes.map((sizeOption) => (
                          <div key={sizeOption.id} className="flex items-center space-x-2">
                            <RadioGroupItem value={sizeOption.id} id={`size-${sizeOption.id}`} />
                            <Label htmlFor={`size-${sizeOption.id}`}>{sizeOption.name}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                    
                    <div>
                      <h2 className="text-lg font-semibold mb-3">Choose Style</h2>
                      <RadioGroup 
                        value={style} 
                        onValueChange={setStyle}
                        className="grid grid-cols-2 gap-4"
                      >
                        {styles.map((styleOption) => (
                          <div key={styleOption.id} className="flex items-center space-x-2">
                            <RadioGroupItem value={styleOption.id} id={`style-${styleOption.id}`} />
                            <Label htmlFor={`style-${styleOption.id}`}>{styleOption.name}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                    
                    <div>
                      <h2 className="text-lg font-semibold mb-3">Add Custom Text</h2>
                      <Input 
                        placeholder="Enter your text here (optional)" 
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        maxLength={20}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Max 20 characters. {20 - text.length} characters remaining.
                      </p>
                    </div>
                    
                    <div>
                      <h2 className="text-lg font-semibold mb-3">Quantity</h2>
                      <div className="flex items-center gap-4">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={quantity <= 1}
                        >
                          -
                        </Button>
                        <span className="w-8 text-center">{quantity}</span>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => setQuantity(Math.min(10, quantity + 1))}
                          disabled={quantity >= 10}
                        >
                          +
                        </Button>
                        <div className="ml-4">
                          <p className="font-bold text-xl text-wolly-magenta">
                            ${(19.99 * quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4 flex flex-wrap gap-3">
                      <Button 
                        className="flex-1 bg-wolly-magenta hover:bg-wolly-magenta/90"
                        onClick={handleAddToCart}
                      >
                        <ShoppingCart size={18} className="mr-2" />
                        Add to Cart
                      </Button>
                      <Button variant="outline" onClick={handleReset}>
                        <RotateCcw size={18} className="mr-2" />
                        Reset
                      </Button>
                      <Button variant="outline">
                        <Heart size={18} className="mr-2" />
                        Save
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="keychain">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-lg font-semibold mb-3">Choose Color</h2>
                      <div className="flex flex-wrap gap-2">
                        {colors.map((colorOption) => (
                          <button
                            key={colorOption.id}
                            type="button"
                            onClick={() => setColor(colorOption.id)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform ${colorOption.class} ${
                              color === colorOption.id ? 'ring-2 ring-offset-2 ring-wolly-magenta scale-110' : ''
                            }`}
                            title={colorOption.name}
                          >
                            {color === colorOption.id && (
                              <Check className={`h-5 w-5 ${colorOption.id === 'white' ? 'text-black' : 'text-white'}`} />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h2 className="text-lg font-semibold mb-3">Choose Style</h2>
                      <RadioGroup 
                        value={style} 
                        onValueChange={setStyle}
                        className="grid grid-cols-2 gap-4"
                      >
                        {styles.map((styleOption) => (
                          <div key={styleOption.id} className="flex items-center space-x-2">
                            <RadioGroupItem value={styleOption.id} id={`keychain-style-${styleOption.id}`} />
                            <Label htmlFor={`keychain-style-${styleOption.id}`}>{styleOption.name}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                    
                    <div>
                      <h2 className="text-lg font-semibold mb-3">Add Custom Text</h2>
                      <Input 
                        placeholder="Enter your text here (optional)" 
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        maxLength={15}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Max 15 characters. {15 - text.length} characters remaining.
                      </p>
                    </div>
                    
                    <div>
                      <h2 className="text-lg font-semibold mb-3">Quantity</h2>
                      <div className="flex items-center gap-4">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={quantity <= 1}
                        >
                          -
                        </Button>
                        <span className="w-8 text-center">{quantity}</span>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => setQuantity(Math.min(10, quantity + 1))}
                          disabled={quantity >= 10}
                        >
                          +
                        </Button>
                        <div className="ml-4">
                          <p className="font-bold text-xl text-wolly-magenta">
                            ${(14.99 * quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4 flex flex-wrap gap-3">
                      <Button 
                        className="flex-1 bg-wolly-magenta hover:bg-wolly-magenta/90"
                        onClick={handleAddToCart}
                      >
                        <ShoppingCart size={18} className="mr-2" />
                        Add to Cart
                      </Button>
                      <Button variant="outline" onClick={handleReset}>
                        <RotateCcw size={18} className="mr-2" />
                        Reset
                      </Button>
                      <Button variant="outline">
                        <Heart size={18} className="mr-2" />
                        Save
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          <div className="mt-16 bg-white rounded-xl shadow-sm border border-border p-6">
            <h2 className="text-xl font-bold mb-4">Custom Design FAQs</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">How long will my custom order take?</h3>
                <p className="text-muted-foreground">Custom orders typically ship within 3-5 business days.</p>
              </div>
              
              <div>
                <h3 className="font-semibold">Can I see a preview before production?</h3>
                <p className="text-muted-foreground">Yes, for orders with custom text or designs, we'll send you a digital proof before production.</p>
              </div>
              
              <div>
                <h3 className="font-semibold">What if I'm not satisfied with my order?</h3>
                <p className="text-muted-foreground">We offer a 30-day satisfaction guarantee. Contact us if you're not happy with your order.</p>
              </div>
              
              <div>
                <h3 className="font-semibold">Can I order in bulk for an event?</h3>
                <p className="text-muted-foreground">Yes! For bulk orders of 20+ items, please contact us for special pricing.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Customize;
