
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Review } from '@/types/review';
import ProductReviewCard from './ProductReviewCard';
import ProductReviewForm from './ProductReviewForm';
import StarRating from './StarRating';
import { Progress } from '@/components/ui/progress';
import { PlusCircle, FilterX } from 'lucide-react';

interface ProductReviewsSectionProps {
  productId: string;
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  ratingsBreakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({
  productId,
  reviews: initialReviews,
  averageRating,
  totalReviews,
  ratingsBreakdown,
}) => {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [filter, setFilter] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>('newest');
  const [showReviewForm, setShowReviewForm] = useState<boolean>(false);

  // Filter and sort reviews
  const filteredAndSortedReviews = React.useMemo(() => {
    let result = [...reviews];
    
    // Apply star filter
    if (filter !== null) {
      result = result.filter(review => Math.floor(review.rating) === filter);
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'newest':
        return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'oldest':
        return result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'highest':
        return result.sort((a, b) => b.rating - a.rating);
      case 'lowest':
        return result.sort((a, b) => a.rating - b.rating);
      case 'helpful':
        return result.sort((a, b) => b.helpful - a.helpful);
      default:
        return result;
    }
  }, [reviews, filter, sortBy]);

  const handleFilterChange = (stars: number | null) => {
    setFilter(stars);
  };
  
  const handleSortChange = (value: string) => {
    setSortBy(value);
  };
  
  const handleMarkHelpful = (reviewId: string) => {
    setReviews(reviews.map(review => 
      review.id === reviewId 
        ? { ...review, helpful: review.helpful + 1 } 
        : review
    ));
  };
  
  const handleAddReview = () => {
    setShowReviewForm(true);
  };

  const getStarPercentage = (stars: number) => {
    if (totalReviews === 0) return 0;
    return (ratingsBreakdown[stars as keyof typeof ratingsBreakdown] / totalReviews) * 100;
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Summary */}
        <div>
          <div className="text-center lg:text-left mb-6">
            <div className="text-3xl font-bold mb-2">{averageRating.toFixed(1)}</div>
            <div className="flex justify-center lg:justify-start mb-1">
              <StarRating rating={averageRating} size={20} />
            </div>
            <div className="text-sm text-muted-foreground">
              Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
            </div>
          </div>
          
          {/* Rating breakdown */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map(stars => (
              <div 
                key={stars} 
                className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded"
                onClick={() => handleFilterChange(filter === stars ? null : stars)}
              >
                <div className="w-8 text-sm font-medium">{stars}</div>
                <div className="flex-1 mx-2">
                  <Progress value={getStarPercentage(stars)} className="h-2" />
                </div>
                <div className="w-8 text-sm text-muted-foreground text-right">
                  {ratingsBreakdown[stars as keyof typeof ratingsBreakdown]}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6">
            <Button 
              variant="outline" 
              onClick={handleAddReview}
              className="w-full"
            >
              <PlusCircle size={16} className="mr-2" />
              Write a Review
            </Button>
          </div>
        </div>
        
        {/* Reviews list */}
        <div className="lg:col-span-2">
          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between mb-4">
            <div className="flex items-center mb-2 sm:mb-0">
              <span className="mr-2 text-sm">Sort by:</span>
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="highest">Highest Rating</SelectItem>
                  <SelectItem value="lowest">Lowest Rating</SelectItem>
                  <SelectItem value="helpful">Most Helpful</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {filter !== null && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleFilterChange(null)}
                className="text-xs"
              >
                <FilterX size={14} className="mr-1" />
                Clear Filter
              </Button>
            )}
          </div>
          
          {/* Review Form */}
          {showReviewForm && (
            <ProductReviewForm 
              productId={productId} 
              onSubmitSuccess={() => setShowReviewForm(false)} 
            />
          )}
          
          {/* Reviews List */}
          {filteredAndSortedReviews.length > 0 ? (
            <div>
              {filteredAndSortedReviews.map(review => (
                <ProductReviewCard 
                  key={review.id} 
                  review={review} 
                  onMarkHelpful={handleMarkHelpful}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <p className="text-lg font-medium mb-2">No reviews yet</p>
              <p className="text-muted-foreground mb-4">
                {filter !== null 
                  ? `No ${filter}-star reviews available.` 
                  : "Be the first to review this product!"}
              </p>
              
              {filter !== null ? (
                <Button 
                  variant="outline" 
                  onClick={() => handleFilterChange(null)}
                >
                  View All Reviews
                </Button>
              ) : (
                <Button 
                  onClick={handleAddReview}
                  className="bg-wolly-magenta hover:bg-wolly-magenta/90"
                >
                  Write a Review
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductReviewsSection;
