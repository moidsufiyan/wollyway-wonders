
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Share2, Copy, Mail, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReferralProgramProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ReferralProgram: React.FC<ReferralProgramProps> = ({ open, onOpenChange }) => {
  const { toast } = useToast();
  // Generate a fake referral code
  const referralCode = "FRIEND" + Math.floor(1000 + Math.random() * 9000);
  const referralLink = `${window.location.origin}/ref/${referralCode}`;
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });
  };
  
  const shareViaEmail = () => {
    const subject = "Check out Wolly Handcrafts!";
    const body = `Hey! I thought you might like Wolly Handcrafts. Use my referral code ${referralCode} to get 10% off your first order: ${referralLink}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };
  
  const shareViaSMS = () => {
    const message = `Hey! Check out Wolly Handcrafts and get 10% off with my code ${referralCode}: ${referralLink}`;
    
    // For mobile devices that can handle SMS links
    if (/Android|iPhone/i.test(navigator.userAgent)) {
      window.location.href = `sms:?body=${encodeURIComponent(message)}`;
    } else {
      copyToClipboard();
      toast({
        title: "SMS not available",
        description: "Link copied instead. You can paste it into your SMS app.",
      });
    }
  };
  
  const shareViaWhatsApp = () => {
    const message = `Hey! Check out Wolly Handcrafts and get 10% off with my code ${referralCode}: ${referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="flex items-center text-xl">
          <Share2 className="mr-2" size={20} />
          Refer & Earn Rewards
        </DialogTitle>
        <DialogDescription>
          Share with friends and family. You'll earn <span className="font-bold text-wolly-magenta">500 loyalty points</span> for each friend who makes a purchase!
        </DialogDescription>
        
        <div className="p-4 bg-muted rounded-lg mb-4">
          <div className="text-sm text-muted-foreground mb-2">Your referral code:</div>
          <div className="flex items-center justify-between">
            <code className="bg-background px-3 py-2 rounded-md font-mono text-lg font-bold text-wolly-magenta">
              {referralCode}
            </code>
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2"
              onClick={copyToClipboard}
            >
              <Copy size={14} className="mr-1" />
              Copy
            </Button>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="text-sm text-muted-foreground mb-2">Shareable link:</div>
          <div className="flex">
            <Input
              value={referralLink}
              readOnly
              className="font-mono text-sm"
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="ml-2"
              onClick={copyToClipboard}
            >
              <Copy size={16} />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-4">
          <Button variant="outline" className="flex flex-col py-4" onClick={shareViaEmail}>
            <Mail className="h-5 w-5 mb-1" />
            <span className="text-xs">Email</span>
          </Button>
          <Button variant="outline" className="flex flex-col py-4" onClick={shareViaSMS}>
            <MessageSquare className="h-5 w-5 mb-1" />
            <span className="text-xs">SMS</span>
          </Button>
          <Button variant="outline" className="flex flex-col py-4" onClick={shareViaWhatsApp}>
            <svg className="h-5 w-5 mb-1" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.523.146-.181.194-.301.297-.496.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.195 2.105 3.195 5.1 4.485.714.3 1.27.48 1.704.629.714.227 1.365.195 1.88.121.574-.091 1.767-.721 2.016-1.426.255-.705.255-1.29.18-1.425-.074-.135-.27-.21-.57-.345m-5.446 7.443h-.016c-1.77 0-3.524-.48-5.055-1.38l-.36-.214-3.75.975 1.005-3.645-.239-.375a9.869 9.869 0 0 1-1.516-5.26c0-5.445 4.455-9.885 9.942-9.885a9.865 9.865 0 0 1 7.022 2.91 9.788 9.788 0 0 1 2.918 6.975c-.001 5.444-4.456 9.885-9.946 9.885M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.334.101 11.893c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652a12.062 12.062 0 0 0 5.71 1.447h.006c6.585 0 11.946-5.336 11.949-11.896 0-3.176-1.24-6.165-3.495-8.411" />
            </svg>
            <span className="text-xs">WhatsApp</span>
          </Button>
        </div>
        
        <div className="bg-wolly-pink/10 p-4 rounded-lg border border-wolly-pink">
          <h4 className="text-sm font-semibold text-wolly-magenta mb-2">How it works:</h4>
          <ol className="text-sm space-y-2 text-muted-foreground list-decimal list-inside">
            <li>Share your unique referral code with friends</li>
            <li>They get 10% off their first order</li>
            <li>You earn 500 loyalty points when they make a purchase</li>
            <li>Redeem your points for discounts and free products</li>
          </ol>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReferralProgram;
