import { FaStarHalfAlt } from 'react-icons/fa';
import { FaStar } from 'react-icons/fa6';

interface RatingStarsProps {
    count: number;
}

const RatingStars = ({ count }: RatingStarsProps) => {
    const fullStars = Math.floor(count);
    const hasHalfStar = count % 1 >= 0.5;

    return (
        <div className="flex items-center gap-1">
            {Array.from({ length: fullStars }).map((_, i) => (
                <FaStar key={`full-${i}`} size={14} className="text-secondary" />
            ))}
            {hasHalfStar && <FaStarHalfAlt key="half" size={14} className="text-secondary" />}
        </div>
    );
};

export default RatingStars;
