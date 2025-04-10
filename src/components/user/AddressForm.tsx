
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { Address } from './AddressCard';

interface AddressFormProps {
  onSubmit: (data: Omit<Address, 'id'>) => void;
  onCancel: () => void;
  initialData?: Address;
  isSubmitting?: boolean;
}

const AddressForm: React.FC<AddressFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  isSubmitting = false,
}) => {
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    setValue,
  } = useForm<Omit<Address, 'id'>>({
    defaultValues: initialData ? {
      street: initialData.street,
      city: initialData.city,
      state: initialData.state,
      zipCode: initialData.zipCode,
      country: initialData.country,
      isDefault: initialData.isDefault,
    } : {
      country: 'United States',
      isDefault: false,
    }
  });

  const handleCountryChange = (value: string) => {
    setValue('country', value);
  };

  const handleDefaultChange = (checked: boolean) => {
    setValue('isDefault', checked);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="street">Street Address</Label>
        <Input
          id="street"
          {...register('street', { required: 'Street address is required' })}
          placeholder="123 Main Street, Apt 4B"
        />
        {errors.street && (
          <p className="text-xs text-red-500">{errors.street.message}</p>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            {...register('city', { required: 'City is required' })}
            placeholder="New York"
          />
          {errors.city && (
            <p className="text-xs text-red-500">{errors.city.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="state">State/Province</Label>
          <Input
            id="state"
            {...register('state', { required: 'State is required' })}
            placeholder="NY"
          />
          {errors.state && (
            <p className="text-xs text-red-500">{errors.state.message}</p>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="zipCode">Zip/Postal Code</Label>
          <Input
            id="zipCode"
            {...register('zipCode', { required: 'Zip code is required' })}
            placeholder="10001"
          />
          {errors.zipCode && (
            <p className="text-xs text-red-500">{errors.zipCode.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Select 
            defaultValue={initialData?.country || 'United States'} 
            onValueChange={handleCountryChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="United States">United States</SelectItem>
              <SelectItem value="Canada">Canada</SelectItem>
              <SelectItem value="United Kingdom">United Kingdom</SelectItem>
              <SelectItem value="Australia">Australia</SelectItem>
              <SelectItem value="Germany">Germany</SelectItem>
              <SelectItem value="France">France</SelectItem>
              <SelectItem value="Japan">Japan</SelectItem>
              <SelectItem value="China">China</SelectItem>
              <SelectItem value="India">India</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="isDefault" 
          defaultChecked={initialData?.isDefault || false}
          onCheckedChange={handleDefaultChange}
        />
        <Label htmlFor="isDefault" className="text-sm">
          Set as default address
        </Label>
      </div>
      
      <div className="flex justify-end space-x-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          type="submit"
          className="bg-wolly-magenta hover:bg-wolly-magenta/90"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? 'Saving...'
            : initialData
              ? 'Update Address'
              : 'Add Address'}
        </Button>
      </div>
    </form>
  );
};

export default AddressForm;
