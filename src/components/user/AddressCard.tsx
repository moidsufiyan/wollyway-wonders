
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Heart, Edit2, Trash2 } from 'lucide-react';

export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

interface AddressCardProps {
  address: Address;
  onEdit?: (address: Address) => void;
  onDelete?: (id: string) => void;
  onSetDefault?: (id: string) => void;
}

const AddressCard: React.FC<AddressCardProps> = ({
  address,
  onEdit,
  onDelete,
  onSetDefault,
}) => {
  const { toast } = useToast();

  const handleSetDefault = () => {
    if (onSetDefault) {
      onSetDefault(address.id);
      toast({
        title: "Default address updated",
        description: "Your default shipping address has been updated",
      });
    }
  };
  
  const handleDelete = () => {
    if (onDelete) {
      onDelete(address.id);
    }
  };
  
  const handleEdit = () => {
    if (onEdit) {
      onEdit(address);
    }
  };

  return (
    <Card className={`relative ${address.isDefault ? 'border-wolly-magenta' : ''}`}>
      {address.isDefault && (
        <div className="absolute top-2 right-2 bg-wolly-magenta text-white text-xs px-2 py-1 rounded-full">
          Default
        </div>
      )}
      
      <CardContent className="p-6">
        <div className="flex items-start">
          <MapPin className="text-muted-foreground shrink-0 mt-1 mr-2" size={18} />
          <div>
            <p className="font-medium">Shipping Address</p>
            <p className="text-sm">{address.street}</p>
            <p className="text-sm">{address.city}, {address.state} {address.zipCode}</p>
            <p className="text-sm">{address.country}</p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t p-4">
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" onClick={handleEdit}>
            <Edit2 size={14} className="mr-1" /> Edit
          </Button>
          {!address.isDefault && (
            <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={handleDelete}>
              <Trash2 size={14} className="mr-1" />
            </Button>
          )}
        </div>
        
        {!address.isDefault && (
          <Button size="sm" variant="ghost" onClick={handleSetDefault}>
            <Heart size={14} className="mr-1" /> Set as Default
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default AddressCard;
