import React, { useState } from 'react';
import { FiStar } from 'react-icons/fi';

const RatingStars = ({
  rating = 0,
  size = 'md',
  showNumber = false,
  showCount = false,
  count = 0,
  interactive = false,
  onChange,
}) => {
  const sizes = { sm: 'w-3 h-3', md: 'w-4 h-4', lg: 'w-5 h-5', xl: 'w-7 h-7' };
  const [hover, setHover] = useState(0);
  const displayRating = hover || rating;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <FiStar
          key={star}
          className={`${sizes[size]} ${
            star <= displayRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
          } ${interactive ? 'cursor-pointer transition-transform hover:scale-110' : ''}`}
          onClick={() => interactive && onChange && onChange(star)}
          onMouseEnter={() => interactive && setHover(star)}
          onMouseLeave={() => interactive && setHover(0)}
        />
      ))}
      {showNumber && (
        <span className="ml-1 text-sm font-semibold text-gray-700">
          {Number(rating).toFixed(1)}
        </span>
      )}
      {showCount && (
        <span className="ml-1 text-sm text-gray-500">({count} ulasan)</span>
      )}
    </div>
  );
};

export default RatingStars;