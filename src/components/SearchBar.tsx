
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useProductSearch } from '@/hooks/useProductSearch';
import { Skeleton } from '@/components/ui/skeleton';
import { AspectRatio } from '@/components/ui/aspect-ratio';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const { 
    setKeyword, 
    searchResults, 
    isSearching, 
    isLoading 
  } = useProductSearch();

  // Clear search when changing routes
  useEffect(() => {
    setSearchTerm('');
    setIsOpen(false);
  }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/shop?keyword=${encodeURIComponent(searchTerm.trim())}`);
      setIsOpen(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setKeyword(value);
    
    if (value.length > 2) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setKeyword('');
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen && searchResults.length > 0} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <form onSubmit={handleSearch} className="relative flex w-full max-w-sm items-center">
          <Input
            type="search"
            placeholder="Search products..."
            className="pr-16"
            value={searchTerm}
            onChange={handleInputChange}
          />
          {searchTerm && (
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              className="absolute right-8 top-0 h-full"
              onClick={clearSearch}
            >
              <X size={18} />
            </Button>
          )}
          <Button 
            type="submit" 
            variant="ghost" 
            size="icon" 
            className="absolute right-0 top-0 h-full"
          >
            <Search size={18} />
          </Button>
        </form>
      </PopoverTrigger>
      
      <PopoverContent className="w-[300px] p-0" align="start">
        <div className="max-h-[400px] overflow-auto rounded-md py-2">
          <h3 className="px-4 py-2 text-sm font-medium">Search Results</h3>
          
          {isSearching || isLoading ? (
            <div className="space-y-2 p-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-10 w-10" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {searchResults.slice(0, 5).map((product) => (
                <div
                  key={product.id}
                  className="flex cursor-pointer items-center gap-2 px-4 py-2 hover:bg-muted"
                  onClick={() => {
                    navigate(`/product/${product.id}`);
                    setIsOpen(false);
                  }}
                >
                  <div className="h-10 w-10 overflow-hidden rounded-md">
                    <AspectRatio ratio={1/1}>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </AspectRatio>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.category}</p>
                  </div>
                </div>
              ))}
              
              {searchResults.length > 5 && (
                <div 
                  className="cursor-pointer px-4 py-2 text-center text-xs text-primary hover:underline"
                  onClick={() => {
                    navigate(`/shop?keyword=${encodeURIComponent(searchTerm.trim())}`);
                    setIsOpen(false);
                  }}
                >
                  View all {searchResults.length} results
                </div>
              )}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default SearchBar;
