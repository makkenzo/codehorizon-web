'use client';

import { PiUserBold } from 'react-icons/pi';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { CourseDifficultyLevels } from '@/types';

import Price from '../reusable/price';
import RatingStars from '../reusable/rating-stars';

interface CourseInfoForCard {
    id: string;
    title: string;
    slug: string;
    imagePreview?: string | null;
    description?: string | null;
    authorName?: string | null;
    authorUsername?: string | null;
    rating?: number | null;
    price?: number | null;
    discount?: number | null;
    difficulty?: CourseDifficultyLevels | null;
}

interface CourseCardProps {
    course: CourseInfoForCard;
    progress?: number;
}

const CourseCard = ({ course, progress }: CourseCardProps) => {
    const pathname = usePathname();

    return (
        <div className="w-full flex flex-col gap-1">
            <Link
                href={`/courses/${course.slug}`}
                className="group block aspect-[16/9] overflow-hidden rounded-sm md:rounded-[14px] bg-muted"
            >
                <Image
                    src={course.imagePreview || '/image_not_available.webp'}
                    alt={course.title}
                    width={285}
                    height={161}
                    className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105" // object-cover для заполнения контейнера
                />
            </Link>
            <Link href={`/courses/${course.slug}`} className="w-fit hover:underline">
                <h2 className="font-semibold w-fit line-clamp-1">{course.title}</h2>
            </Link>
            {course.authorUsername ? (
                <Link href={`/u/${course.authorUsername}`} className="w-fit hover:underline hover:text-primary text-sm">
                    <div className="flex items-center gap-1 pl-0.5">
                        <PiUserBold className="text-muted-foreground" size={14} />
                        <span className="text-primary">{course.authorName || course.authorUsername}</span>
                    </div>
                </Link>
            ) : null}
            {course.description && pathname !== '/me/courses' ? (
                <p className="line-clamp-2 md:line-clamp-3">{course.description}</p>
            ) : null}
            {typeof course.rating === 'number' && course.rating > 0 && pathname !== '/me/courses' ? (
                <div className="mt-1">
                    <RatingStars count={course.rating} showEmpty />
                </div>
            ) : null}
            {typeof course.price === 'number' ? (
                <div className="mt-1">
                    <Price discount={course.discount ?? 0} price={course.price} />
                </div>
            ) : null}
            {typeof progress === 'number' ? (
                progress === 0 ? (
                    <div className="text-sm text-muted-foreground mt-1">Вы еще не начали этот курс</div>
                ) : (
                    <div className="text-sm text-muted-foreground mt-1">{progress.toFixed(0)}% пройдено</div>
                )
            ) : null}
        </div>
    );
};

export default CourseCard;
