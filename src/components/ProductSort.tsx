
import React, { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type SortOption = 'newest' | 'priceAsc' | 'priceDesc' | 'popularity';

type SortProps = {
  onSortChange: (option: SortOption) => void;
};

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'priceAsc', label: 'Price: Low to High' },
  { value: 'priceDesc', label: 'Price: High to Low' },
  { value: 'popularity', label: 'Most Popular' },
];

const ProductSort = ({ onSortChange }: SortProps) => {
  const [activeSortOption, setActiveSortOption] = useState<SortOption>('newest');
  
  const handleSortChange = (option: SortOption) => {
    setActiveSortOption(option);
    onSortChange(option);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          Sort by: {sortOptions.find(opt => opt.value === activeSortOption)?.label}
          <ChevronDown size={15} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {sortOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            className="flex items-center justify-between cursor-pointer"
            onClick={() => handleSortChange(option.value as SortOption)}
          >
            {option.label}
            {activeSortOption === option.value && <Check size={16} />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProductSort;
