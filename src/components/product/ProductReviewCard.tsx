
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import StarRating from './StarRating';
import { ThumbsUp, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Review } from '@/types/review';

interface ProductReviewCardProps {
  review: Review;
  onMarkHelpful?: (reviewId: string) => void;
}

const ProductReviewCard: React.FC<ProductReviewCardProps> = ({
  review,
  onMarkHelpful,
}) => {
  const date = new Date(review.createdAt);
  const formattedDate = formatDistanceToNow(date, { addSuffix: true });

  const handleMarkHelpful = () => {
    if (onMarkHelpful) {
      onMarkHelpful(review.id);
    }
  };

  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src={review.userAvatar} alt={review.userName} />
              <AvatarFallback>{review.userName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{review.userName}</div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar size={12} className="mr-1" />
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>
          <StarRating rating={review.rating} size={14} />
        </div>
        
        {review.title && (
          <h4 className="font-medium mb-1">{review.title}</h4>
        )}
        
        <p className="text-gray-600 mb-4">{review.comment}</p>
        
        {review.images && review.images.length > 0 && (
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {review.images.map((image, idx) => (
              <img
                key={idx}
                src={image}
                alt={`Review image ${idx + 1}`}
                className="h-16 w-16 object-cover rounded-md"
              />
            ))}
          </div>
        )}
        
        {review.verified && (
          <div className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mb-2">
            Verified Purchase
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t pt-4 flex justify-between">
        <div className="text-sm text-muted-foreground">
          {review.helpful} {review.helpful === 1 ? 'person' : 'people'} found this helpful
        </div>
        <Button variant="outline" size="sm" onClick={handleMarkHelpful}>
          <ThumbsUp size={14} className="mr-2" />
          Helpful
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductReviewCard;
