import { FaStarHalfAlt } from 'react-icons/fa';
import { FaRegStar, FaStar } from 'react-icons/fa6';

interface RatingStarsProps {
    count: number;
    showEmpty?: boolean;
    maxStars?: number;
}

const RatingStars = ({ count, showEmpty = false, maxStars = 5 }: RatingStarsProps) => {
    const fullStars = Math.floor(count);
    const hasHalfStar = count % 1 >= 0.5;
    const emptyStars = showEmpty ? maxStars - fullStars - (hasHalfStar ? 1 : 0) : 0;

    return (
        <div className="flex items-center gap-1">
            {Array.from({ length: fullStars }).map((_, i) => (
                <FaStar key={`full-${i}`} size={14} className="text-secondary" />
            ))}
            {hasHalfStar && <FaStarHalfAlt key="half" size={14} className="text-secondary" />}
            {Array.from({ length: emptyStars }).map((_, i) => (
                <FaRegStar key={`empty-${i}`} size={14} className="text-secondary" />
            ))}
        </div>
    );
};

export default RatingStars;
