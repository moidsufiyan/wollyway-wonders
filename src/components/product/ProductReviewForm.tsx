
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import StarRating from './StarRating';
import { Upload, X } from 'lucide-react';

interface ProductReviewFormProps {
  productId: string;
  onSubmitSuccess?: () => void;
}

const ProductReviewForm: React.FC<ProductReviewFormProps> = ({
  productId,
  onSubmitSuccess,
}) => {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      const newImages = [...images, ...selectedFiles].slice(0, 3); // Limit to 3 images
      setImages(newImages);
      
      // Create preview URLs
      const newPreviewUrls = newImages.map(file => URL.createObjectURL(file));
      setPreviewUrls(newPreviewUrls);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);

    const newPreviewUrls = [...previewUrls];
    URL.revokeObjectURL(newPreviewUrls[index]);
    newPreviewUrls.splice(index, 1);
    setPreviewUrls(newPreviewUrls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to submit a review",
        variant: "destructive",
      });
      return;
    }
    
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a star rating",
        variant: "destructive",
      });
      return;
    }
    
    if (!review.trim()) {
      toast({
        title: "Review required",
        description: "Please write your review",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Here we would normally send the review to an API
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });
      
      // Reset the form
      setRating(0);
      setTitle('');
      setReview('');
      setImages([]);
      setPreviewUrls([]);
      
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Submission failed",
        description: "There was a problem submitting your review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
      
      {!isAuthenticated ? (
        <div className="text-center py-4">
          <p className="mb-3">Please log in to leave a review</p>
          <Button className="bg-wolly-magenta hover:bg-wolly-magenta/90">
            Log In to Review
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="rating" className="block mb-2">Rating</Label>
            <StarRating 
              rating={rating}
              interactive={true}
              onChange={handleRatingChange}
              size={24}
              className="mb-1"
            />
            <p className="text-sm text-muted-foreground">
              {rating === 0 ? 'Select a rating' : 
                rating === 5 ? 'Excellent' : 
                rating === 4 ? 'Very Good' : 
                rating === 3 ? 'Good' : 
                rating === 2 ? 'Fair' : 'Poor'}
            </p>
          </div>
          
          <div>
            <Label htmlFor="title" className="block mb-2">Review Title (Optional)</Label>
            <Input 
              id="title" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience"
              maxLength={100}
            />
          </div>
          
          <div>
            <Label htmlFor="review" className="block mb-2">Your Review</Label>
            <Textarea 
              id="review" 
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="What did you like or dislike? What did you use this product for?"
              rows={4}
              className="resize-none"
              maxLength={1000}
            />
            <p className="text-sm text-right text-muted-foreground mt-1">
              {review.length}/1000
            </p>
          </div>
          
          <div>
            <Label className="block mb-2">Add Photos (Optional)</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative">
                  <img 
                    src={url} 
                    alt={`Preview ${index + 1}`} 
                    className="h-20 w-20 object-cover rounded-md border"
                  />
                  <button 
                    type="button"
                    className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              
              {images.length < 3 && (
                <label className="h-20 w-20 border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                  <Upload size={24} className="text-gray-400" />
                  <span className="text-xs text-gray-500 mt-1">Upload</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Max 3 images, JPG or PNG only
            </p>
          </div>
          
          <Button 
            type="submit" 
            className="bg-wolly-magenta hover:bg-wolly-magenta/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </form>
      )}
    </div>
  );
};

export default ProductReviewForm;
