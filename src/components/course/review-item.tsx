import { FaUserSecret } from 'react-icons/fa6';

import Link from 'next/link';

import { ReviewDTO } from '@/types/review';

import RatingStars from '../reusable/rating-stars';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface ReviewItemProps {
    review: ReviewDTO;
}

const ReviewItem = ({ review }: ReviewItemProps) => {
    return (
        <div className="flex items-start gap-4 border-b pb-4 last:border-b-0 last:pb-0">
            <Link href={`/u/${review.author.username}`}>
                <Avatar className="h-10 w-10">
                    <AvatarImage src={review.author.avatarUrl ?? undefined} alt={review.author.username} />
                    <AvatarFallback style={{ backgroundColor: review.author.avatarColor ?? undefined }}>
                        {review.author.username?.[0]?.toUpperCase() ?? <FaUserSecret />}
                    </AvatarFallback>
                </Avatar>
            </Link>
            <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                    <Link href={`/u/${review.author.username}`} className="hover:underline">
                        <span className="font-semibold">{review.author.username}</span>
                    </Link>
                </div>
                <div className="flex items-center gap-2 mb-1">
                    <RatingStars count={review.rating} />
                    <span className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                        {review.createdAt !== review.updatedAt && ' (изменен)'}
                    </span>
                </div>
                {review.text && <p className="text-sm text-foreground/90 whitespace-pre-wrap">{review.text}</p>}
            </div>
        </div>
    );
};

export default ReviewItem;
