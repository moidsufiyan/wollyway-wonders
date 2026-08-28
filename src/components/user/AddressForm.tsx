"use client";

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
  onSubmit: (data: Omit<Address, '_id'>) => void;
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
  } = useForm<Omit<Address, '_id'>>({
    defaultValues: initialData ? {
      label: initialData.label,
      customLabel: initialData.customLabel,
      streetAddress: initialData.streetAddress,
      apartmentSuite: initialData.apartmentSuite,
      city: initialData.city,
      state: initialData.state,
      postalCode: initialData.postalCode,
      country: initialData.country,
      phone: initialData.phone,
      isDefault: initialData.isDefault,
    } : {
      label: 'Home',
      country: 'India', // Using India as backend default
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
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="label">Address Label</Label>
          <Select 
            defaultValue={initialData?.label || 'Home'} 
            onValueChange={(val: any) => setValue('label', val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Label" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Home">Home</SelectItem>
              <SelectItem value="Work">Work</SelectItem>
              <SelectItem value="Office">Office</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            {...register('phone', { 
              required: 'Phone number is required',
              pattern: {
                value: /^\+[1-9]\d{1,14}$/,
                message: 'Phone number must be in E.164 format (e.g. +919876543210)'
              }
            })}
            placeholder="+919876543210"
          />
          {errors.phone && (
            <p className="text-xs text-red-500">{errors.phone.message}</p>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="streetAddress">Street Address</Label>
        <Input
          id="streetAddress"
          {...register('streetAddress', { required: 'Street address is required' })}
          placeholder="123 Main Street"
        />
        {errors.streetAddress && (
          <p className="text-xs text-red-500">{errors.streetAddress.message}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="apartmentSuite">Apartment/Suite (Optional)</Label>
        <Input
          id="apartmentSuite"
          {...register('apartmentSuite')}
          placeholder="Apt 4B"
        />
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
          <Label htmlFor="postalCode">Zip/Postal Code</Label>
          <Input
            id="postalCode"
            {...register('postalCode', { required: 'Zip code is required' })}
            placeholder="10001"
          />
          {errors.postalCode && (
            <p className="text-xs text-red-500">{errors.postalCode.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Select 
            defaultValue={initialData?.country || 'India'} 
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
