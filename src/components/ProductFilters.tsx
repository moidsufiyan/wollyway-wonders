import React from "react";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X, Star } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export type FilterProps = {
  filters: {
    categories: string[];
    priceRange: [number, number];
    ratingRange: [number, number];
    inStock: boolean;
    sortBy: string;
  };
  onFilterChange: (
    filters: Partial<{
      categories: string[];
      priceRange: [number, number];
      ratingRange: [number, number];
      inStock: boolean;
      sortBy: string;
    }>
  ) => void;
  resetFilters: () => void;
  onClose: () => void;
};

const categories = ["Bands", "Keychains", "Bracelets", "Accessories"];
const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "bestsellers", label: "Best Sellers" },
  { value: "trending", label: "Trending" },
  { value: "rating", label: "Highest Rated" },
];

const ProductFilters = ({
  filters,
  onFilterChange,
  resetFilters,
  onClose,
}: FilterProps) => {
  const handleCategoryChange = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];

    onFilterChange({ categories: newCategories });
  };

  const handlePriceChange = (value: number[]) => {
    onFilterChange({ priceRange: [value[0], value[1]] });
  };

  const handleRatingChange = (value: number[]) => {
    onFilterChange({ ratingRange: [value[0], value[1]] });
  };

  const handleInStockChange = (checked: boolean) => {
    onFilterChange({ inStock: checked });
  };

  const handleSortChange = (value: string) => {
    onFilterChange({ sortBy: value });
  };

  const clearFilters = () => {
    resetFilters();
  };

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 5000 ||
    filters.ratingRange[0] > 1 ||
    filters.inStock;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-border"
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

      {/* Categories - Multi-select */}
      <div className="mb-8">
        <h4 className="font-medium mb-3">Categories</h4>
        <div className="space-y-2">
          {categories.map((category) => (
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

      {/* Price Range Slider */}
      <div className="mb-8">
        <h4 className="font-medium mb-3">Price Range</h4>
        <Slider
          defaultValue={[filters.priceRange[0], filters.priceRange[1]]}
          max={5000}
          step={100}
          value={[filters.priceRange[0], filters.priceRange[1]]}
          onValueChange={handlePriceChange}
          className="mb-4"
        />
        <div className="flex justify-between items-center text-sm">
          <span>₹{filters.priceRange[0]}</span>
          <span>₹{filters.priceRange[1]}</span>
        </div>
      </div>

      {/* Rating Range Slider */}
      <div className="mb-8">
        <h4 className="font-medium mb-3">Rating</h4>
        <Slider
          defaultValue={[filters.ratingRange[0], filters.ratingRange[1]]}
          max={5}
          step={0.5}
          value={[filters.ratingRange[0], filters.ratingRange[1]]}
          onValueChange={handleRatingChange}
          className="mb-4"
        />
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center">
            <span className="mr-1">{filters.ratingRange[0]}</span>
            <Star size={12} className="fill-yellow-400 text-yellow-400" />
          </div>
          <div className="flex items-center">
            <span className="mr-1">{filters.ratingRange[1]}</span>
            <Star size={12} className="fill-yellow-400 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* In Stock Only */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <Label htmlFor="in-stock" className="font-medium cursor-pointer">
            In Stock Only
          </Label>
          <Switch
            id="in-stock"
            checked={filters.inStock}
            onCheckedChange={handleInStockChange}
          />
        </div>
      </div>

      {/* Sort By */}
      <div className="mb-6">
        <h4 className="font-medium mb-3">Sort By</h4>
        <ToggleGroup
          type="single"
          value={filters.sortBy}
          onValueChange={handleSortChange}
          className="flex flex-wrap gap-2"
        >
          {sortOptions.map((option) => (
            <ToggleGroupItem
              key={option.value}
              value={option.value}
              className="text-xs px-3 py-1"
            >
              {option.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
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
