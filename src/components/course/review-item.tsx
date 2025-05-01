import { FaUserSecret } from 'react-icons/fa6';

import Link from 'next/link';

import { ReviewDTO } from '@/types/review';

import RatingStars from '../reusable/rating-stars';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Card, CardContent } from '../ui/card';

interface ReviewItemProps {
    review: ReviewDTO;
}

const ReviewItem = ({ review }: ReviewItemProps) => {
    return (
        <Card className="mb-4">
            <CardContent>
                <div className="flex items-start space-x-4">
                    <Link href={`/u/${review.author.username}`}>
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={review.author.avatarUrl ?? undefined} alt={review.author.username} />
                            <AvatarFallback style={{ backgroundColor: review.author.avatarColor ?? undefined }}>
                                {review.author.username?.[0]?.toUpperCase() ?? <FaUserSecret />}
                            </AvatarFallback>
                        </Avatar>
                    </Link>
                    <div className="flex-1">
                        <div className="mb-2 flex items-center">
                            <RatingStars count={review.rating} />
                            <span className="ml-2 text-sm text-muted-foreground">
                                {new Date(review.createdAt).toLocaleDateString()}
                                {review.createdAt !== review.updatedAt && ' (изменен)'}
                            </span>
                        </div>
                        <Link href={`/u/${review.author.username}`} className="hover:underline">
                            <h4 className="font-bold text-foreground">{review.author.username}</h4>
                        </Link>
                        <p className="mb-4 text-muted-foreground">{review.text}</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default ReviewItem;
