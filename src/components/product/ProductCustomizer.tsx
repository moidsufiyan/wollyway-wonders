
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';

interface CustomizationOption {
  type: string;
  name: string;
  price: number;
}

interface ProductCustomizerProps {
  basePrice: number;
  onUpdatePrice: (newPrice: number) => void;
  onCustomizationChange: (customizations: ProductCustomizations) => void;
  productType: 'band' | 'keychain' | 'bracelet';
}

export interface ProductCustomizations {
  color: string;
  text: string;
  charmType: string;
  knotStyle: string;
  additionalOptions: string[];
}

const colorOptions = [
  { name: 'Red', value: 'red', class: 'bg-red-500' },
  { name: 'Blue', value: 'blue', class: 'bg-blue-500' },
  { name: 'Green', value: 'green', class: 'bg-green-500' },
  { name: 'Purple', value: 'purple', class: 'bg-purple-500' },
  { name: 'Black', value: 'black', class: 'bg-black' },
  { name: 'White', value: 'white', class: 'bg-white border border-gray-300' },
];

const charmOptions: CustomizationOption[] = [
  { type: 'charm', name: 'None', price: 0 },
  { type: 'charm', name: 'Heart', price: 249 },
  { type: 'charm', name: 'Star', price: 249 },
  { type: 'charm', name: 'Infinity', price: 331 },
  { type: 'charm', name: 'Moon', price: 331 },
];

const knotStyleOptions: CustomizationOption[] = [
  { type: 'knot', name: 'Standard', price: 0 },
  { type: 'knot', name: 'Double', price: 165 },
  { type: 'knot', name: 'Celtic', price: 331 },
  { type: 'knot', name: 'Fishtail', price: 249 },
];

const additionalOptions: CustomizationOption[] = [
  { type: 'additional', name: 'Gift Wrap', price: 249 },
  { type: 'additional', name: 'Premium Box', price: 414 },
  { type: 'additional', name: 'Personalized Card', price: 165 },
];

const ProductCustomizer: React.FC<ProductCustomizerProps> = ({ 
  basePrice, 
  onUpdatePrice, 
  onCustomizationChange,
  productType 
}) => {
  const { toast } = useToast();
  const [selectedColor, setSelectedColor] = useState<string>(colorOptions[0].value);
  const [customText, setCustomText] = useState<string>('');
  const [selectedCharm, setSelectedCharm] = useState<string>('None');
  const [selectedKnotStyle, setSelectedKnotStyle] = useState<string>('Standard');
  const [selectedAdditional, setSelectedAdditional] = useState<string[]>([]);
  
  // Calculate total price based on selections
  const calculateTotalPrice = (): number => {
    let total = basePrice;
    
    // Add price for charm
    const selectedCharmOption = charmOptions.find(c => c.name === selectedCharm);
    if (selectedCharmOption) {
      total += selectedCharmOption.price;
    }
    
    // Add price for knot style
    const selectedKnotOption = knotStyleOptions.find(k => k.name === selectedKnotStyle);
    if (selectedKnotOption) {
      total += selectedKnotOption.price;
    }
    
    // Add price for custom text if any
    if (customText.trim().length > 0) {
      total += 2.99;
    }
    
    // Add price for additional options
    selectedAdditional.forEach(opt => {
      const option = additionalOptions.find(o => o.name === opt);
      if (option) {
        total += option.price;
      }
    });
    
    return parseFloat(total.toFixed(2));
  };
  
  // Update parent component when customizations change
  useEffect(() => {
    const totalPrice = calculateTotalPrice();
    onUpdatePrice(totalPrice);
    
    onCustomizationChange({
      color: selectedColor,
      text: customText,
      charmType: selectedCharm,
      knotStyle: selectedKnotStyle,
      additionalOptions: selectedAdditional
    });
  }, [selectedColor, customText, selectedCharm, selectedKnotStyle, selectedAdditional]);
  
  const toggleAdditionalOption = (option: string) => {
    setSelectedAdditional(prev => {
      if (prev.includes(option)) {
        return prev.filter(item => item !== option);
      } else {
        return [...prev, option];
      }
    });
  };
  
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    if (text.length <= 20) {
      setCustomText(text);
    } else {
      toast({
        title: "Text too long",
        description: "Custom text can't exceed 20 characters",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="border border-border rounded-lg p-4 space-y-6">
      <h3 className="text-lg font-semibold mb-4">Customize Your {productType === 'band' ? 'Band' : productType === 'keychain' ? 'Keychain' : 'Bracelet'}</h3>
      
      {/* Color Selection */}
      <div className="space-y-3">
        <Label htmlFor="color-section">Choose Color</Label>
        <div className="flex flex-wrap gap-3" id="color-section">
          {colorOptions.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() => setSelectedColor(color.value)}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-transform ${color.class} ${
                selectedColor === color.value ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''
              }`}
              title={color.name}
            >
              {selectedColor === color.value && (
                <Check 
                  className={`h-4 w-4 ${color.value === 'white' ? 'text-black' : 'text-white'}`} 
                />
              )}
            </button>
          ))}
        </div>
      </div>
      
      {/* Custom Text */}
      <div className="space-y-3">
        <div className="flex justify-between">
          <Label htmlFor="custom-text">Add Custom Text</Label>
          <span className="text-xs text-muted-foreground">
            {20 - customText.length} characters remaining
          </span>
        </div>
        <Input 
          id="custom-text"
          placeholder="Enter text to be engraved or printed" 
          value={customText}
          onChange={handleTextChange}
          maxLength={20}
        />
        <p className="text-sm text-muted-foreground">
          Custom text adds $2.99
        </p>
      </div>
      
      {/* Charm Selection */}
      <div className="space-y-3">
        <Label htmlFor="charm">Charm Type</Label>
        <Select value={selectedCharm} onValueChange={setSelectedCharm}>
          <SelectTrigger id="charm">
            <SelectValue placeholder="Select charm" />
          </SelectTrigger>
          <SelectContent>
            {charmOptions.map((charm) => (
              <SelectItem key={charm.name} value={charm.name}>
                {charm.name} {charm.price > 0 ? `(+₹${charm.price.toFixed(2)})` : '(No charge)'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Knot Style - only for bands and bracelets */}
      {(productType === 'band' || productType === 'bracelet') && (
        <div className="space-y-3">
          <Label htmlFor="knot-style">Knot Style</Label>
          <Select value={selectedKnotStyle} onValueChange={setSelectedKnotStyle}>
            <SelectTrigger id="knot-style">
              <SelectValue placeholder="Select style" />
            </SelectTrigger>
            <SelectContent>
              {knotStyleOptions.map((style) => (
                <SelectItem key={style.name} value={style.name}>
                  {style.name} {style.price > 0 ? `(+₹${style.price.toFixed(2)})` : '(No charge)'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      {/* Additional Options */}
      <div className="space-y-3">
        <Label className="block mb-2">Additional Options</Label>
        <div className="space-y-2">
          {additionalOptions.map((option) => (
            <div key={option.name} className="flex items-center">
              <input
                type="checkbox"
                id={`option-${option.name}`}
                checked={selectedAdditional.includes(option.name)}
                onChange={() => toggleAdditionalOption(option.name)}
                className="rounded border-gray-300 text-primary focus:ring-primary mr-2"
              />
              <label 
                htmlFor={`option-${option.name}`} 
                className="text-sm"
              >
                {option.name} (+₹{option.price.toFixed(2)})
              </label>
            </div>
          ))}
        </div>
      </div>
      
      {/* Total Price Display */}
      <div className="pt-3 border-t">
        <div className="text-lg font-semibold flex justify-between">
          <span>Total Price:</span>
          <span className="text-primary">₹{calculateTotalPrice().toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCustomizer;
