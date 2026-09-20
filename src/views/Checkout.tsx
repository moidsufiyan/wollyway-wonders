"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { authService } from '@/services/auth.service';
import { checkoutService, CheckoutSummaryDTO } from '@/services/checkout.service';
import { paymentService } from '@/services/payment.service';
import { formatMoney } from '@/utils/currency';

type CheckoutState = 
  | 'INITIALIZING' 
  | 'ADDRESS_REQUIRED' 
  | 'READY' 
  | 'CREATING_INTENT' 
  | 'OPENING_GATEWAY' 
  | 'PAYMENT_PROCESSING' 
  | 'CONFIRMING_ORDER' 
  | 'EXPIRED' 
  | 'FAILURE';

export default function Checkout() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [checkoutState, setCheckoutState] = useState<CheckoutState>('INITIALIZING');
  const [checkoutSummary, setCheckoutSummary] = useState<CheckoutSummaryDTO | null>(null);
  const [defaultAddress, setDefaultAddress] = useState<any | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  
  // Address form state
  const [form, setForm] = useState({
    label: 'Home',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    phone: '',
  });

  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pollingCountRef = useRef(0);

  useEffect(() => {
    initCheckoutFlow();
    return () => {
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (checkoutSummary?.reservationExpiresAt) {
      const interval = setInterval(() => {
        const remaining = new Date(checkoutSummary.reservationExpiresAt).getTime() - Date.now();
        if (remaining <= 0) {
          setTimeLeft(0);
          setCheckoutState('EXPIRED');
          clearInterval(interval);
        } else {
          setTimeLeft(Math.floor(remaining / 1000));
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [checkoutSummary?.reservationExpiresAt]);

  const initCheckoutFlow = async () => {
    try {
      // 1. Fetch Addresses
      const addresses = await authService.getAddresses();
      const defaultAddr = addresses.find((a: any) => a.isDefault) || addresses[0];
      
      if (!defaultAddr) {
        setCheckoutState('ADDRESS_REQUIRED');
        return;
      }
      
      setDefaultAddress(defaultAddr);
      await loadCheckoutSession(defaultAddr._id);
    } catch (error: any) {
      if (error?.status === 401 || error?.message?.toLowerCase().includes('unauthorized')) {
        router.push(`/login?from=${encodeURIComponent('/checkout')}`);
        return;
      }
      toast({ title: 'Error initializing checkout', description: error.message, variant: 'destructive' });
      setCheckoutState('FAILURE');
    }
  };

  const loadCheckoutSession = async (addressId?: string) => {
    try {
      let summary: CheckoutSummaryDTO;
      try {
        summary = await checkoutService.getCurrentCheckout();
      } catch (err: any) {
        if (err.message?.includes('No active checkout session found')) {
          summary = await checkoutService.startCheckout();
        } else {
          throw err;
        }
      }

      if (!summary.shippingAddressSnapshot && addressId) {
        summary = await checkoutService.updateShippingAddress(addressId);
      }

      setCheckoutSummary(summary);
      setCheckoutState('READY');
    } catch (error: any) {
      if (error?.status === 401 || error?.message?.toLowerCase().includes('unauthorized')) {
        router.push(`/login?from=${encodeURIComponent('/checkout')}`);
        return;
      }
      if (error.message?.includes('empty cart')) {
        toast({ title: 'Cart empty', description: 'Your cart is empty', variant: 'destructive' });
        router.push('/cart');
      } else {
        toast({ title: 'Checkout Error', description: error.message, variant: 'destructive' });
        setCheckoutState('FAILURE');
      }
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCheckoutState('INITIALIZING');
      let formattedPhone = form.phone.trim();
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = `+1${formattedPhone.replace(/\D/g, '')}`;
      }
      await authService.addAddress({ ...form, phone: formattedPhone });
      // Re-initialize flow to pick up the new address
      await initCheckoutFlow();
    } catch (error: any) {
      toast({ title: 'Failed to add address', description: error.message, variant: 'destructive' });
      setCheckoutState('ADDRESS_REQUIRED');
    }
  };

  const handlePayment = async () => {
    if (!checkoutSummary) return;
    
    try {
      setCheckoutState('CREATING_INTENT');
      const intent = await paymentService.createPaymentIntent('razorpay');
      
      setCheckoutState('OPENING_GATEWAY');
      
      if (intent.keyId === 'mock_razorpay_key_id') {
        // MOCK ENVIRONMENT: Simulate a successful Razorpay flow
        console.log("Mocking Razorpay success for order:", intent.clientReference);
        
        // Let's call the real webhook endpoint to simulate Razorpay calling the webhook (since signature check is mocked)
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/payments/webhook/razorpay`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-razorpay-signature': 'mock_signature'
          },
          body: JSON.stringify({
            event: 'payment.captured',
            payload: {
              payment: {
                entity: {
                  id: `mock_txn_${Math.random().toString(36).substring(7)}`,
                  order_id: intent.clientReference,
                  amount: intent.amount,
                  currency: intent.currency,
                  status: 'captured'
                }
              }
            }
          })
        });
        
        startPollingReconciliation();
        return;
      }

      const options = {
        key: intent.keyId,
        amount: intent.amount, // Amount from backend is already in paise
        currency: intent.currency,
        name: 'WollyWay',
        description: 'Order Payment',
        order_id: intent.clientReference,
        handler: function (response: any) {
          // Browser callback -> start backend polling
          startPollingReconciliation();
        },
        prefill: {
          name: '', // could pull from profile
          email: '',
          contact: ''
        },
        theme: {
          color: '#000000'
        },
        modal: {
          ondismiss: async function() {
            try {
              await checkoutService.cancelPaymentIntent();
            } catch {
              // Swallowed if already restored or expired
            }
            setCheckoutState('READY');
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', async function (response: any) {
        toast({ title: 'Payment Failed', description: response.error?.description || 'Payment failed', variant: 'destructive' });
        try {
          await checkoutService.cancelPaymentIntent();
        } catch {
          // Swallowed if already restored or expired
        }
        setCheckoutState('READY');
      });
      
      rzp.open();
      setCheckoutState('PAYMENT_PROCESSING');
      
    } catch (error: any) {
      toast({ title: 'Payment Initialization Failed', description: error.message, variant: 'destructive' });
      setCheckoutState('READY');
    }
  };

  const startPollingReconciliation = () => {
    setCheckoutState('CONFIRMING_ORDER');
    pollingCountRef.current = 0;
    
    pollingTimerRef.current = setInterval(async () => {
      pollingCountRef.current += 1;
      
      // Hard timeout at 60 seconds (assuming 3s interval -> 20 attempts)
      if (pollingCountRef.current > 20) {
        if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
        toast({ 
          title: 'Confirmation Delayed', 
          description: 'Payment received, but order confirmation is delayed. Please check your order history in your profile in a few minutes.' 
        });
        router.push('/profile');
        return;
      }
      
      if (!checkoutSummary?.sessionId) return;
      
      try {
        const statusData = await checkoutService.getCheckoutStatus(checkoutSummary.sessionId);
        
        if (statusData.status === 'COMPLETED' && statusData.orderId) {
          if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
          queryClient.invalidateQueries({ queryKey: ['cart'] });
          router.push(`/checkout-success?orderId=${statusData.orderId}`);
        } else if (statusData.status === 'EXPIRED') {
          if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
          toast({ title: 'Session Expired', description: 'Your checkout session expired.', variant: 'destructive' });
          setCheckoutState('EXPIRED');
        } else if (statusData.status === 'CANCELLED') {
          if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
          toast({ title: 'Session Cancelled', description: 'Your checkout session was cancelled.', variant: 'destructive' });
          setCheckoutState('FAILURE');
        }
        // If still PAYMENT_PENDING, keep polling
      } catch (err) {
        // Ignore network errors during polling and try again
      }
    }, 3000);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>
          
          {checkoutState === 'INITIALIZING' && (
            <div className="text-center py-12">Loading checkout session...</div>
          )}

          {checkoutState === 'EXPIRED' && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold mb-4">Checkout Session Expired</h2>
              <p className="mb-4">Your reservation has expired. Please return to the cart to try again.</p>
              <Button onClick={() => router.push('/cart')}>Return to Cart</Button>
            </div>
          )}

          {checkoutState === 'FAILURE' && (
            <div className="text-center py-12">
              <h2 className="text-2xl font-semibold mb-4 text-destructive">Checkout Failed</h2>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          )}

          {checkoutState === 'CONFIRMING_ORDER' && (
            <div className="text-center py-12 space-y-4">
              <h2 className="text-2xl font-semibold">Payment received. Confirming your order...</h2>
              <p className="text-muted-foreground">Please wait while we verify the payment with our servers. Do not close this window.</p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          )}

          {checkoutState === 'ADDRESS_REQUIRED' && (
            <Card className="max-w-xl mx-auto">
              <CardHeader>
                <CardTitle>Add Shipping Address</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddressSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="streetAddress">Street Address *</Label>
                    <Input id="streetAddress" name="streetAddress" value={form.streetAddress} onChange={handleAddressChange} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input id="city" name="city" value={form.city} onChange={handleAddressChange} required />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input id="state" name="state" value={form.state} onChange={handleAddressChange} required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="postalCode">Zip/Postal Code *</Label>
                      <Input id="postalCode" name="postalCode" value={form.postalCode} onChange={handleAddressChange} required />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone *</Label>
                      <Input id="phone" name="phone" value={form.phone} onChange={handleAddressChange} required />
                    </div>
                  </div>
                  <Button type="submit" className="w-full">Save Address & Continue</Button>
                </form>
              </CardContent>
            </Card>
          )}

          {(checkoutState === 'READY' || checkoutState === 'CREATING_INTENT' || checkoutState === 'OPENING_GATEWAY' || checkoutState === 'PAYMENT_PROCESSING') && checkoutSummary && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Shipping Information */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Shipping Address</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {defaultAddress ? (
                      <div className="space-y-1">
                        <p className="font-medium">{defaultAddress.label}</p>
                        <p>{defaultAddress.streetAddress}</p>
                        <p>{defaultAddress.city}, {defaultAddress.state} {defaultAddress.postalCode}</p>
                        <p>{defaultAddress.country}</p>
                        <p className="text-muted-foreground mt-2">Phone: {defaultAddress.phone}</p>
                      </div>
                    ) : (
                      <p>Loading address...</p>
                    )}
                  </CardContent>
                </Card>

                {timeLeft > 0 && (
                  <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
                    <CardContent className="pt-6">
                      <p className="text-center font-medium text-orange-600 dark:text-orange-400">
                        Items reserved for {formatTime(timeLeft)}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="max-h-[300px] overflow-y-auto space-y-4 pr-2">
                    {checkoutSummary.items.map((item) => (
                      <div key={item.productId} className="flex items-center space-x-4">
                        <img
                          src={item.image || '/placeholder.png'}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium">{formatMoney(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatMoney(checkoutSummary.totals.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>{checkoutSummary.totals.shippingFee === 0 ? 'Free' : formatMoney(checkoutSummary.totals.shippingFee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (8%)</span>
                      <span>{formatMoney(checkoutSummary.totals.taxTotal)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>{formatMoney(checkoutSummary.totals.orderTotal)}</span>
                    </div>
                  </div>

                  <Button
                    onClick={handlePayment}
                    disabled={checkoutState !== 'READY'}
                    className="w-full"
                    size="lg"
                  >
                    {checkoutState === 'READY' ? 'Pay Now' :
                     checkoutState === 'CREATING_INTENT' ? 'Initializing...' :
                     checkoutState === 'OPENING_GATEWAY' ? 'Opening Payment...' :
                     checkoutState === 'PAYMENT_PROCESSING' ? 'Processing...' : 'Please Wait...'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
