"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductFilters from "@/components/ProductFilters";
import ProductGrid from "@/components/ProductGrid";
import { useProducts, parseQueryFilters } from "@/hooks/useProducts";
import SearchPage from "@/components/SearchPage";
import { Button } from "@/components/ui/button";
import { Filter, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import ProductBreadcrumb from "@/components/product/ProductBreadcrumb";
import { type Product, mapProductCardToUI } from "@/types/Product";

const Shop = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSearchMode = searchParams ? searchParams.has("search") || searchParams.has("keyword") || searchParams.has("q") : false;

  const [showFilters, setShowFilters] = useState(false);
  const [savedCart, setSavedCart] = useState<Product[]>([]);

  // Get filters strictly from URL (Source of truth)
  const queryFilters = searchParams ? parseQueryFilters(searchParams) : {};
  const activeCategory = queryFilters.categorySlug;

  // Use enhanced products hook which strictly reads from URL internally
  const { data: discoveryResult, isLoading } = useProducts();
  const products = (discoveryResult?.products || []).map(mapProductCardToUI);
  const totalItems = discoveryResult?.pagination?.totalItems || 0;

  const { addItem } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (product: Product) => {
    addItem(product, 1);
  };

  const toggleFilters = () => {
    setShowFilters((prev) => !prev);
  };

  // Save an item for later
  const saveForLater = (product: Product) => {
    setSavedCart((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (!exists) {
        toast({
          title: "Saved for later",
          description: `${product.name} has been saved for later.`,
          duration: 3000,
        });
        return [...prev, product];
      }
      return prev;
    });
  };

  // Move saved item to cart
  const moveToCart = (product: Product) => {
    addItem(product, 1);
    setSavedCart((prev) => prev.filter((item) => item.id !== product.id));
    toast({
      title: "Moved to cart",
      description: `${product.name} has been moved to your cart.`,
      duration: 3000,
    });
  };

  // Handle URL updates when filters change
  const applyFilterUpdate = (newParamsObj: Record<string, string | null>) => {
    const currentParams = new URLSearchParams(searchParams?.toString() || "");
    
    Object.entries(newParamsObj).forEach(([key, value]) => {
      if (value === null || value === "") {
        currentParams.delete(key);
      } else {
        currentParams.set(key, value);
      }
    });

    // Reset to page 1 on filter change
    if (!newParamsObj.page && currentParams.has('page')) {
      currentParams.set('page', '1');
    }

    const newSearch = currentParams.toString();
    router.replace(`/shop${newSearch ? `?${newSearch}` : ""}`);
  };

  const resetFilters = () => {
    router.replace('/shop');
  };

  const handleFilterChange = (
    newFilters: Partial<{
      categories: string[];
      priceRange: [number, number];
      ratingRange: [number, number]; // legacy
      inStock: boolean;
      sortBy: string;
    }>
  ) => {
    const updates: Record<string, string | null> = {};

    if (newFilters.categories !== undefined) {
      updates.category = newFilters.categories.length > 0 ? newFilters.categories.join(",") : null;
    }
    
    if (newFilters.priceRange !== undefined) {
      if (newFilters.priceRange[0] > 0) updates.minPrice = newFilters.priceRange[0].toString();
      else updates.minPrice = null;
      
      if (newFilters.priceRange[1] < 5000) updates.maxPrice = newFilters.priceRange[1].toString();
      else updates.maxPrice = null;
    }

    // ratingRange skipped for backend API (we don't pass it to discovery params)
    
    if (newFilters.inStock !== undefined) {
      updates.inStock = newFilters.inStock ? "true" : null;
    }

    if (newFilters.sortBy !== undefined) {
      updates.sortBy = newFilters.sortBy !== 'newest' ? newFilters.sortBy : null;
    }

    applyFilterUpdate(updates);
  };

  // Convert DiscoveryQueryParams back to the shape ProductFilters component expects
  const currentFilterProps = {
    categories: queryFilters.categorySlug ? [queryFilters.categorySlug] : [],
    priceRange: [queryFilters.minPrice || 0, queryFilters.maxPrice || 5000] as [number, number],
    ratingRange: [1, 5] as [number, number], // Stubbed out for UI component compat
    inStock: queryFilters.availability === 'in_stock',
    sortBy: searchParams?.get('sortBy') || 'newest' // keep raw string for UI toggle group matching
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const savedCartItems = localStorage.getItem("savedCart");
    if (savedCartItems) {
      try {
        setSavedCart(JSON.parse(savedCartItems));
      } catch (e) {
        console.error("Error parsing saved cart data", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("savedCart", JSON.stringify(savedCart));
  }, [savedCart]);

  return (
    <div className="min-h-screen dark:bg-gray-900 dark:text-white transition-colors duration-300">
      <Navbar />

      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {isSearchMode ? (
            <SearchPage />
          ) : (
            <>
              <div className="mb-8 flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    Shop Our Collection
                  </h1>
                  <p className="text-muted-foreground dark:text-gray-400">
                    Browse our handcrafted products made with love
                  </p>
                </div>
              </div>

              {activeCategory && (
                <div className="mb-6">
                  {/* Dummy product passed just to satisfy component props for category path display */}
                  <ProductBreadcrumb
                    categoryPath={activeCategory}
                    product={{ category: activeCategory } as any}
                  />
                </div>
              )}

              <div className="flex flex-col md:flex-row gap-8">
                <div
                  className={`md:w-1/4 ${
                    showFilters ? "block" : "hidden md:block"
                  }`}
                >
                  <ProductFilters
                    filters={currentFilterProps}
                    onFilterChange={handleFilterChange}
                    resetFilters={resetFilters}
                    onClose={() => setShowFilters(false)}
                  />
                </div>

                <div className="md:w-3/4">
                  <div className="flex justify-between items-center mb-6">
                    <Button
                      variant="outline"
                      className="md:hidden"
                      onClick={toggleFilters}
                    >
                      <Filter size={16} className="mr-2" />
                      {showFilters ? "Hide Filters" : "Show Filters"}
                    </Button>

                    <div className="flex items-center">
                      <span className="text-sm text-muted-foreground dark:text-gray-400 mr-3 hidden md:inline">
                        {totalItems} Products
                      </span>
                    </div>
                  </div>

                  {isLoading ? (
                    <div className="flex justify-center items-center h-96">
                      <div className="animate-pulse">Loading products...</div>
                    </div>
                  ) : (
                    <>
                      {products.length === 0 ? (
                        <div className="text-center py-12">
                          <h2 className="text-xl font-medium mb-4">
                            No products found
                          </h2>
                          <p className="text-muted-foreground dark:text-gray-400 mb-6">
                            Try adjusting your filters to find what you're
                            looking for
                          </p>
                          <Button onClick={resetFilters}>
                            Clear All Filters
                          </Button>
                        </div>
                      ) : (
                        <>
                          <ProductGrid
                            products={products}
                            onAddToCart={handleAddToCart}
                            onSaveForLater={saveForLater}
                          />
                          
                          {/* Pagination Controls */}
                          {discoveryResult?.pagination && discoveryResult.pagination.totalPages > 1 && (
                            <div className="flex justify-center mt-12 space-x-2">
                              <Button
                                variant="outline"
                                disabled={discoveryResult.pagination.page === 1}
                                onClick={() => applyFilterUpdate({ page: String(discoveryResult.pagination.page - 1) })}
                              >
                                Previous
                              </Button>
                              <span className="flex items-center px-4">
                                Page {discoveryResult.pagination.page} of {discoveryResult.pagination.totalPages}
                              </span>
                              <Button
                                variant="outline"
                                disabled={discoveryResult.pagination.page === discoveryResult.pagination.totalPages}
                                onClick={() => applyFilterUpdate({ page: String(discoveryResult.pagination.page + 1) })}
                              >
                                Next
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </>
          )}

          {savedCart.length > 0 && !isSearchMode && (
            <div className="mt-16">
              <div className="container mx-auto px-4">
                <h2 className="text-2xl font-bold mb-6">Saved For Later</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {savedCart.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white dark:bg-gray-800 border border-border dark:border-gray-700 rounded-lg shadow-sm overflow-hidden"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full aspect-square object-cover"
                      />
                      <div className="p-4">
                        <h3 className="font-medium text-sm mb-1 truncate">
                          {product.name}
                        </h3>
                        <p className="text-wolly-magenta font-bold">
                          {/* This is a legacy render, if formatting is needed we format, but saved items shouldn't crash */}
                          ₹{(product.price / 100).toFixed(2)}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full mt-2 text-xs"
                          onClick={() => moveToCart(product)}
                        >
                          <ShoppingBag size={14} className="mr-1" /> Move to
                          Cart
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Shop;
