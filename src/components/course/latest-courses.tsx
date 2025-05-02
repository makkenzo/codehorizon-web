'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

import Link from 'next/link';

import { Course } from '@/types';

import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import CourseCard from './card';

interface LatestCoursesSectionProps {
    initialCourses?: Omit<Course, 'lessons'>[] | null;
    isLoading?: boolean;
}

export default function LatestCourses({ initialCourses, isLoading = false }: LatestCoursesSectionProps) {
    if (isLoading) {
        return (
            <section className="space-y-4 md:space-y-6">
                <Skeleton className="h-7 w-1/3" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={`skeleton-latest-${i}`} className="flex flex-col gap-1">
                            <Skeleton className="h-[162px] w-full rounded-sm md:rounded-[14px]" />
                            <Skeleton className="h-[24px] w-2/3" />
                            <Skeleton className="h-[20px] w-1/4" />
                            <Skeleton className="h-[20px] w-1/2" />
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    if (!initialCourses || initialCourses.length === 0) {
        return null;
    }

    return (
        <motion.section
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 7 * 0.1, duration: 0.3 }}
            className="space-y-4 md:space-y-6"
        >
            <div className="flex items-center justify-between">
                <h2 className="text-xl md:text-2xl font-bold">Недавно добавленные</h2>
                <Link href="/courses?sortBy=date_desc">
                    <Button variant="link" className="text-primary">
                        Смотреть все
                        <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {initialCourses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                ))}
            </div>
        </motion.section>
    );
}
