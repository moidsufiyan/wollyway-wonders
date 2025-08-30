import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Checkout = () => {
  const { items, subtotal, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Contact Info
    email: user?.email || '',
    phone: '',
    
    // Shipping Information
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    
    // Payment Information
    cardNumber: '',
    nameOnCard: '',
    expiryDate: '',
    cvv: '',
    
    // Other
    saveInfo: true,
    paymentMethod: 'credit-card'
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  // Calculate shipping, total, etc.
  const shipping = items.length > 0 ? (subtotal >= 50 ? 0 : 5.99) : 0;
  const tax = subtotal * 0.08; // Assuming 8% tax rate
  const total = subtotal + shipping + tax;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleRadioChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      paymentMethod: value
    }));
  };
  
  const handleNextStep = () => {
    setStep(prev => prev + 1);
    window.scrollTo(0, 0);
  };
  
  const handlePrevStep = () => {
    setStep(prev => prev - 1);
    window.scrollTo(0, 0);
  };
  
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate API call for order processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    setIsComplete(true);
    clearCart();
    
    // Scroll to top to show success message
    window.scrollTo(0, 0);
  };
  
  const handleReturnToHome = () => {
    navigate('/');
  };

  if (isComplete) {
    return (
      <div className="min-h-screen">
        <Navbar />
        
        <div className="pt-24 pb-16 section-container">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-lg mx-auto text-center px-4"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check size={32} className="text-green-600" />
            </div>
            
            <h1 className="text-3xl font-bold mb-4">Order Confirmed!</h1>
            
            <p className="text-muted-foreground mb-8">
              Thank you for your purchase. Your order has been confirmed and will be shipped shortly.
              You will receive an email confirmation with your order details and tracking information.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="font-semibold mb-2">Order Reference</h2>
              <p className="text-lg font-mono bg-white py-2 px-4 rounded border mb-4">
                #WW{Math.floor(Math.random() * 100000).toString().padStart(6, '0')}
              </p>
              
              <div className="text-sm text-muted-foreground">
                <p>A confirmation email has been sent to:</p>
                <p className="font-medium text-foreground">{formData.email || user?.email}</p>
              </div>
            </div>
            
            <Button
              className="bg-wolly-magenta hover:bg-wolly-magenta/90"
              onClick={handleReturnToHome}
            >
              Return to Home Page
            </Button>
          </motion.div>
        </div>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="pt-24 pb-12 section-container">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center">
              {['Information', 'Shipping', 'Payment'].map((stepName, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && (
                    <div className="w-10 h-[2px] bg-gray-200 mx-2">
                      {idx < step && <div className="h-full bg-wolly-magenta" />}
                    </div>
                  )}
                  <div 
                    className={`flex items-center justify-center w-8 h-8 rounded-full ${
                      idx + 1 === step 
                        ? 'bg-wolly-magenta text-white'
                        : idx + 1 < step
                          ? 'bg-wolly-magenta/20 text-wolly-magenta'
                          : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {idx + 1 < step ? <Check size={16} /> : idx + 1}
                  </div>
                </React.Fragment>
              ))}
            </div>
            <div className="flex justify-center mt-2">
              <p className="text-sm font-medium">
                {step === 1 ? 'Contact Information' : step === 2 ? 'Shipping Address' : 'Payment Details'}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-border p-6">
                <form onSubmit={handleSubmitOrder}>
                  {/* Step 1: Contact Information */}
                  {step === 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
                      
                      <div className="space-y-4 mb-8">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email address</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone number (optional)</Label>
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      
                      <div className="mt-8 flex justify-end">
                        <Button
                          type="button"
                          className="bg-wolly-magenta hover:bg-wolly-magenta/90"
                          onClick={handleNextStep}
                        >
                          Continue to Shipping
                        </Button>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Step 2: Shipping Information */}
                  {step === 2 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h2 className="text-2xl font-bold mb-4">Shipping Information</h2>
                      
                      <div className="space-y-4 mb-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">First name</Label>
                            <Input
                              id="firstName"
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleChange}
                              required
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="lastName">Last name</Label>
                            <Input
                              id="lastName"
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="address">Address</Label>
                          <Input
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="apartment">Apartment, suite, etc. (optional)</Label>
                          <Input
                            id="apartment"
                            name="apartment"
                            value={formData.apartment}
                            onChange={handleChange}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                              id="city"
                              name="city"
                              value={formData.city}
                              onChange={handleChange}
                              required
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="state">State</Label>
                            <Input
                              id="state"
                              name="state"
                              value={formData.state}
                              onChange={handleChange}
                              required
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="zipCode">Zip code</Label>
                            <Input
                              id="zipCode"
                              name="zipCode"
                              value={formData.zipCode}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="country">Country</Label>
                          <Input
                            id="country"
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="mt-8 flex justify-between">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handlePrevStep}
                        >
                          Back to Information
                        </Button>
                        
                        <Button
                          type="button"
                          className="bg-wolly-magenta hover:bg-wolly-magenta/90"
                          onClick={handleNextStep}
                        >
                          Continue to Payment
                        </Button>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Step 3: Payment */}
                  {step === 3 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h2 className="text-2xl font-bold mb-4">Payment Method</h2>
                      
                      <RadioGroup
                        value={formData.paymentMethod}
                        onValueChange={handleRadioChange}
                        className="mb-6"
                      >
                        <div className="flex items-center space-x-2 border rounded-md p-4 mb-3">
                          <RadioGroupItem value="credit-card" id="credit-card" />
                          <Label htmlFor="credit-card" className="flex-1">Credit Card</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2 border rounded-md p-4 mb-3">
                          <RadioGroupItem value="paypal" id="paypal" />
                          <Label htmlFor="paypal" className="flex-1">PayPal</Label>
                        </div>
                      </RadioGroup>
                      
                      {formData.paymentMethod === 'credit-card' && (
                        <div className="space-y-4 mb-8">
                          <div className="space-y-2">
                            <Label htmlFor="cardNumber">Card number</Label>
                            <Input
                              id="cardNumber"
                              name="cardNumber"
                              placeholder="0000 0000 0000 0000"
                              value={formData.cardNumber}
                              onChange={handleChange}
                              required
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="nameOnCard">Name on card</Label>
                            <Input
                              id="nameOnCard"
                              name="nameOnCard"
                              value={formData.nameOnCard}
                              onChange={handleChange}
                              required
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="expiryDate">Expiry date (MM/YY)</Label>
                              <Input
                                id="expiryDate"
                                name="expiryDate"
                                placeholder="MM/YY"
                                value={formData.expiryDate}
                                onChange={handleChange}
                                required
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="cvv">Security code (CVV)</Label>
                              <Input
                                id="cvv"
                                name="cvv"
                                value={formData.cvv}
                                onChange={handleChange}
                                required
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-8 flex justify-between">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handlePrevStep}
                        >
                          Back to Shipping
                        </Button>
                        
                        <Button
                          type="submit"
                          className="bg-wolly-magenta hover:bg-wolly-magenta/90"
                          disabled={isProcessing}
                        >
                          {isProcessing ? 'Processing...' : 'Complete Order'}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </form>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-border p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                
                <div className="space-y-4 mb-4">
                  {items.map(item => (
                    <div key={item.product.id} className="flex justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0 mr-3 relative">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute -top-1 -right-1 bg-gray-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                            {item.quantity}
                          </span>
                        </div>
                        <span className="text-sm truncate max-w-[150px]">{item.product.name}</span>
                      </div>
                      <span className="text-sm font-medium">
                        ₹{(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    {shipping === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      <span>₹{shipping.toFixed(2)}</span>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax (18%)</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-wolly-magenta text-xl">
                    ₹{total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Checkout;
