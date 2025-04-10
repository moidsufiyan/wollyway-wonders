
import React from 'react';
import { Star, StarHalf } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  color?: string;
  className?: string;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 16,
  color = "text-yellow-400",
  className = "",
  interactive = false,
  onChange,
}) => {
  const [hoverRating, setHoverRating] = React.useState(0);

  const renderStar = (starNumber: number) => {
    const value = interactive && hoverRating > 0 ? hoverRating : rating;
    const filled = starNumber <= Math.floor(value);
    const half = !filled && starNumber === Math.ceil(value) && value % 1 !== 0;

    if (filled) {
      return <Star size={size} className={`fill-current ${color}`} />;
    } else if (half) {
      return <StarHalf size={size} className={`fill-current ${color}`} />;
    } else {
      return <Star size={size} className="text-gray-300" />;
    }
  };

  const handleClick = (starNumber: number) => {
    if (interactive && onChange) {
      onChange(starNumber);
    }
  };

  const handleMouseEnter = (starNumber: number) => {
    if (interactive) {
      setHoverRating(starNumber);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  return (
    <div 
      className={`flex items-center ${className}`}
      onMouseLeave={handleMouseLeave}
    >
      {[...Array(maxRating)].map((_, i) => (
        <span
          key={i}
          className={`inline-block ${interactive ? 'cursor-pointer' : ''}`}
          onClick={() => handleClick(i + 1)}
          onMouseEnter={() => handleMouseEnter(i + 1)}
        >
          {renderStar(i + 1)}
        </span>
      ))}
    </div>
  );
};

export default StarRating;
