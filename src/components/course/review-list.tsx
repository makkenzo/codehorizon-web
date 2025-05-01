import { ReviewDTO } from '@/types/review';

import ReviewItem from './review-item';

interface ReviewListProps {
    reviews: ReviewDTO[];
}

const ReviewList = ({ reviews }: ReviewListProps) => {
    return (
        <div className="space-y-6">
            {reviews.map((review) => (
                <ReviewItem key={review.id} review={review} />
            ))}
        </div>
    );
};

export default ReviewList;
