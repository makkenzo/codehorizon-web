import { PiUserBold } from 'react-icons/pi';

import Image from 'next/image';
import Link from 'next/link';

import { Course } from '@/types';

import Price from '../reusable/price';
import RatingStars from '../reusable/rating-stars';

interface CourseCardProps {
    course: Omit<Course, 'lessons'>;
}

const CourseCard = ({ course }: CourseCardProps) => {
    return (
        <div className="w-full flex flex-col gap-1">
            <Link href={`/courses/${course.id}`} className="group">
                <Image
                    src={course.imagePreview ?? '/image_not_available.webp'}
                    alt={course.title}
                    width={285}
                    height={161}
                    className="h-[90px] md:h-[161px] object-cover rounded-sm md:rounded-[23px] bg-foreground/10 group-hover:rounded-md transition-all duration-200 ease-in-out group-hover:scale-95"
                />
            </Link>
            <Link href={`/courses/${course.id}`} className="w-fit hover:underline">
                <h2 className="font-semibold w-fit line-clamp-1">{course.title}</h2>
            </Link>
            <Link href={`/u/${course.authorUsername}`} className="w-fit hover:underline hover:text-primary">
                <div className="flex items-center gap-1 pl-0.5">
                    <PiUserBold className="text-black-60/60" />
                    <span className="text-primary">{course.authorName}</span>
                </div>
            </Link>
            <p className="line-clamp-2 md:line-clamp-3">
                {course.description && course.description !== '' ? course.description : 'Курс не описан'}
            </p>
            <RatingStars count={course.rating} showEmpty />
            <Price discount={course.discount} price={course.price} />
        </div>
    );
};

export default CourseCard;

