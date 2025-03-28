
import React from 'react';
import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export type FilterProps = {
  filters: {
    categories: string[];
    priceRange: [number, number];
    colors: string[];
  };
  onFilterChange: (filters: Partial<{
    categories: string[];
    priceRange: [number, number];
    colors: string[];
  }>) => void;
  resetFilters: () => void;
  onClose: () => void;
};

const categories = ["Bands", "Keychains", "Bracelets", "Accessories"];
const colors = [
  { name: "Black", value: "black" },
  { name: "White", value: "white" },
  { name: "Red", value: "red" },
  { name: "Blue", value: "blue" },
  { name: "Yellow", value: "yellow" },
  { name: "Purple", value: "purple" },
  { name: "Orange", value: "orange" },
  { name: "Green", value: "green" },
];

const ProductFilters = ({ filters, onFilterChange, resetFilters, onClose }: FilterProps) => {
  const handleCategoryChange = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    
    onFilterChange({ categories: newCategories });
  };

  const handlePriceChange = (value: number[]) => {
    onFilterChange({ priceRange: [value[0], value[1]] });
  };

  const handleColorChange = (color: string) => {
    const newColors = filters.colors.includes(color)
      ? filters.colors.filter(c => c !== color)
      : [...filters.colors, color];
    
    onFilterChange({ colors: newColors });
  };

  const clearFilters = () => {
    resetFilters();
  };

  const hasActiveFilters = filters.categories.length > 0 || 
                           filters.colors.length > 0 || 
                           filters.priceRange[0] > 0 || 
                           filters.priceRange[1] < 100;

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-6 rounded-xl shadow-sm border border-border"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Filters</h3>
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="text-xs text-muted-foreground flex items-center"
          >
            Clear All <X size={14} className="ml-1" />
          </Button>
        )}
      </div>

      {/* Categories */}
      <div className="mb-8">
        <h4 className="font-medium mb-3">Categories</h4>
        <div className="space-y-2">
          {categories.map(category => (
            <div key={category} className="flex items-center">
              <Checkbox 
                id={`category-${category}`}
                checked={filters.categories.includes(category)}
                onCheckedChange={() => handleCategoryChange(category)}
              />
              <Label 
                htmlFor={`category-${category}`}
                className="ml-2 text-sm cursor-pointer"
              >
                {category}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-8">
        <h4 className="font-medium mb-3">Price Range</h4>
        <Slider
          defaultValue={[filters.priceRange[0], filters.priceRange[1]]}
          max={100}
          step={1}
          value={[filters.priceRange[0], filters.priceRange[1]]}
          onValueChange={handlePriceChange}
          className="mb-4"
        />
        <div className="flex justify-between items-center text-sm">
          <span>${filters.priceRange[0]}</span>
          <span>${filters.priceRange[1]}</span>
        </div>
      </div>

      {/* Colors */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Colors</h4>
        <div className="flex flex-wrap gap-2">
          {colors.map(color => (
            <button
              key={color.value}
              className={`w-7 h-7 rounded-full border ${
                filters.colors.includes(color.value) 
                ? 'ring-2 ring-wolly-magenta ring-offset-2' 
                : 'ring-0'
              }`}
              style={{ backgroundColor: color.value }}
              onClick={() => handleColorChange(color.value)}
              aria-label={`Filter by ${color.name}`}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Apply Filters Button - Mobile only */}
      <div className="mt-6 lg:hidden">
        <Button 
          className="w-full bg-wolly-magenta hover:bg-wolly-magenta/90"
          onClick={onClose}
        >
          Apply Filters
        </Button>
      </div>
    </motion.div>
  );
};

export default ProductFilters;
