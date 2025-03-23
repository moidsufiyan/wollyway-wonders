
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SearchIcon, MessageSquare, HelpCircle, Package, ArrowLeft, ArrowRight, Send } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';

const Support = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{sender: 'user' | 'agent', text: string, time: string}>>([]);
  const [supportCategory, setSupportCategory] = useState('order');
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    orderNumber: '',
    subject: '',
    message: '',
  });
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would search the KB
    toast({
      title: "Search initiated",
      description: `Searching for "${searchQuery}"...`,
    });
  };
  
  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;
    
    // Add user message
    const newUserMessage = {
      sender: 'user' as const,
      text: chatMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    setChatMessages([...chatMessages, newUserMessage]);
    setChatMessage('');
    
    // Simulate agent response after a delay
    setTimeout(() => {
      const agentMessage = {
        sender: 'agent' as const,
        text: "Thank you for your message. A customer support representative will be with you shortly.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      
      setChatMessages(prev => [...prev, agentMessage]);
    }, 1000);
  };
  
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, this would submit the form to your backend
    toast({
      title: "Message sent!",
      description: "We've received your message and will respond soon.",
    });
    
    // Reset form
    setContactForm({
      name: '',
      email: '',
      orderNumber: '',
      subject: '',
      message: '',
    });
  };
  
  const faqs = [
    {
      question: "How do I track my order?",
      answer: "You can track your order by going to the 'Order Tracking' page and entering your order number which was sent to you in your order confirmation email.",
    },
    {
      question: "What is your return policy?",
      answer: "We offer a 30-day return policy for all unused and unworn items. Custom products cannot be returned unless there is a defect.",
    },
    {
      question: "How do I care for my Wollyway products?",
      answer: "For hand bands, we recommend hand washing with mild soap and air drying. For keychains, simply wipe with a damp cloth as needed.",
    },
    {
      question: "Do you ship internationally?",
      answer: "Yes, we ship to most countries worldwide. International shipping typically takes 7-14 business days, depending on the destination.",
    },
    {
      question: "Can I change or cancel my order?",
      answer: "You can change or cancel your order within 2 hours of placing it. After that, the order goes into processing and cannot be modified.",
    },
    {
      question: "Do you offer wholesale options?",
      answer: "Yes, we offer wholesale pricing for bulk orders. Please contact our sales team at sales@wollyway.com for more information.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-8 text-center">Customer Support</h1>
          
          <Tabs defaultValue="faq" className="w-full">
            <TabsList className="grid grid-cols-4 mb-8">
              <TabsTrigger value="faq">
                <HelpCircle className="mr-2 h-4 w-4" />
                FAQs
              </TabsTrigger>
              <TabsTrigger value="chat">
                <MessageSquare className="mr-2 h-4 w-4" />
                Live Chat
              </TabsTrigger>
              <TabsTrigger value="contact">
                <Send className="mr-2 h-4 w-4" />
                Contact Us
              </TabsTrigger>
              <TabsTrigger value="orders">
                <Package className="mr-2 h-4 w-4" />
                Orders
              </TabsTrigger>
            </TabsList>
            
            {/* FAQs Section */}
            <TabsContent value="faq">
              <Card>
                <CardHeader>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                  <CardDescription>Find quick answers to common questions.</CardDescription>
                  <form onSubmit={handleSearch} className="mt-4">
                    <div className="relative">
                      <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                      <Input 
                        placeholder="Search our knowledge base..." 
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </form>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {faqs.map((faq, index) => (
                      <div key={index} className="border-b border-border pb-4 last:border-0">
                        <h3 className="font-semibold mb-2">{faq.question}</h3>
                        <p className="text-muted-foreground">{faq.answer}</p>
                      </div>
                    ))}
                    
                    <div className="flex justify-between pt-4">
                      <Button variant="outline" disabled>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Previous
                      </Button>
                      <Button variant="outline">
                        Next
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Live Chat Section */}
            <TabsContent value="chat">
              <Card>
                <CardHeader>
                  <CardTitle>Live Chat Support</CardTitle>
                  <CardDescription>Chat with our support team in real-time.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] flex flex-col">
                    <div className="flex-1 overflow-y-auto border rounded-t-md p-4 space-y-4 mb-4">
                      {chatMessages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground">
                          <MessageSquare size={48} className="mb-4 text-muted-foreground/50" />
                          <p>No messages yet</p>
                          <p className="text-sm">Start a conversation with our support team</p>
                        </div>
                      ) : (
                        chatMessages.map((msg, index) => (
                          <div
                            key={index}
                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div 
                              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                                msg.sender === 'user' 
                                  ? 'bg-wolly-magenta text-white' 
                                  : 'bg-muted text-foreground'
                              }`}
                            >
                              <p>{msg.text}</p>
                              <p className={`text-xs mt-1 ${
                                msg.sender === 'user' ? 'text-white/70' : 'text-muted-foreground'
                              }`}>
                                {msg.time}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type your message here..."
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <Button 
                        onClick={handleSendMessage}
                        className="bg-wolly-magenta hover:bg-wolly-magenta/90"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Contact Us Section */}
            <TabsContent value="contact">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Us</CardTitle>
                  <CardDescription>Send us a message and we'll get back to you.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleContactSubmit} className="space-y-6">
                    <RadioGroup 
                      value={supportCategory} 
                      onValueChange={setSupportCategory}
                      className="flex flex-wrap gap-4 mb-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="order" id="category-order" />
                        <Label htmlFor="category-order">Order Support</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="product" id="category-product" />
                        <Label htmlFor="category-product">Product Inquiry</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="returns" id="category-returns" />
                        <Label htmlFor="category-returns">Returns & Refunds</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="category-other" />
                        <Label htmlFor="category-other">Other</Label>
                      </div>
                    </RadioGroup>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Your Name</Label>
                        <Input 
                          id="name" 
                          value={contactForm.name}
                          onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                          required 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          value={contactForm.email}
                          onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                          required 
                        />
                      </div>
                    </div>
                    
                    {supportCategory === 'order' && (
                      <div className="space-y-2">
                        <Label htmlFor="orderNumber">Order Number</Label>
                        <Input 
                          id="orderNumber" 
                          placeholder="e.g. WW-12345" 
                          value={contactForm.orderNumber}
                          onChange={(e) => setContactForm({...contactForm, orderNumber: e.target.value})}
                        />
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input 
                        id="subject" 
                        value={contactForm.subject}
                        onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                        required 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea 
                        id="message" 
                        rows={5} 
                        value={contactForm.message}
                        onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                        required 
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="bg-wolly-magenta hover:bg-wolly-magenta/90"
                    >
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Orders Section */}
            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle>Order Support</CardTitle>
                  <CardDescription>Get help with your orders.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="p-6 bg-muted/50 rounded-lg">
                      <h3 className="font-semibold text-lg mb-2">Track Your Order</h3>
                      <p className="text-muted-foreground mb-4">
                        Enter your order number to check the current status of your purchase.
                      </p>
                      <div className="flex gap-3">
                        <Input placeholder="Order number (e.g. WW-12345)" className="flex-1" />
                        <Button className="bg-wolly-magenta hover:bg-wolly-magenta/90">
                          Track
                        </Button>
                      </div>
                    </div>
                    
                    <div className="p-6 bg-muted/50 rounded-lg">
                      <h3 className="font-semibold text-lg mb-2">Returns & Exchanges</h3>
                      <p className="text-muted-foreground mb-4">
                        Initiate a return or exchange for items purchased within the last 30 days.
                      </p>
                      <Button variant="outline">
                        Start Return/Exchange
                      </Button>
                    </div>
                    
                    <div className="p-6 bg-muted/50 rounded-lg">
                      <h3 className="font-semibold text-lg mb-2">Missing or Damaged Items</h3>
                      <p className="text-muted-foreground mb-4">
                        Report a problem with your order if items are missing or damaged.
                      </p>
                      <Button variant="outline">
                        Report Problem
                      </Button>
                    </div>
                    
                    <div className="p-6 bg-muted/50 rounded-lg">
                      <h3 className="font-semibold text-lg mb-2">Order History</h3>
                      <p className="text-muted-foreground mb-4">
                        View all your past and current orders.
                      </p>
                      <Button variant="outline">
                        View Order History
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-border p-6 text-center">
              <MessageSquare size={32} className="mx-auto mb-4 text-wolly-magenta" />
              <h2 className="text-lg font-bold mb-2">Chat Support</h2>
              <p className="text-muted-foreground mb-4">Available 24/7 for all your questions.</p>
              <Button 
                variant="outline" 
                onClick={() => document.querySelector('[data-value="chat"]')?.dispatchEvent(new Event('click'))}
              >
                Start Chat
              </Button>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-border p-6 text-center">
              <HelpCircle size={32} className="mx-auto mb-4 text-wolly-magenta" />
              <h2 className="text-lg font-bold mb-2">Help Center</h2>
              <p className="text-muted-foreground mb-4">Browse our knowledge base for quick answers.</p>
              <Button 
                variant="outline" 
                onClick={() => document.querySelector('[data-value="faq"]')?.dispatchEvent(new Event('click'))}
              >
                View FAQs
              </Button>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-border p-6 text-center">
              <Package size={32} className="mx-auto mb-4 text-wolly-magenta" />
              <h2 className="text-lg font-bold mb-2">Order Issues</h2>
              <p className="text-muted-foreground mb-4">Get help with your orders or returns.</p>
              <Button 
                variant="outline" 
                onClick={() => document.querySelector('[data-value="orders"]')?.dispatchEvent(new Event('click'))}
              >
                Order Support
              </Button>
            </div>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Support;
