import { PiUserBold } from 'react-icons/pi';

import Image from 'next/image';

import { Course } from '@/types';

import Price from '../reusable/price';
import RatingStars from '../reusable/rating-stars';

interface CourseCardProps {
    course: Omit<Course, 'lessons'>;
}

const CourseCard = ({ course }: CourseCardProps) => {
    return (
        <div className="w-full flex flex-col gap-1">
            <Image
                src={course.imagePreview ?? '/image_not_available.webp'}
                alt={course.title}
                width={285}
                height={161}
                className="h-[161px] object-cover rounded-[23px] bg-foreground/10"
            />
            <h2 className="font-semibold">{course.title}</h2>
            <div className="flex items-center gap-1 pl-0.5">
                <PiUserBold className="text-black-60/60" />
                <span className="text-primary">{course.authorName}</span>
            </div>
            <p className="line-clamp-3">
                {course.description && course.description !== '' ? course.description : 'Курс не описан'}
            </p>
            <RatingStars count={course.rating} showEmpty />
            <Price discount={course.discount} price={course.price} />
        </div>
    );
};

export default CourseCard;

