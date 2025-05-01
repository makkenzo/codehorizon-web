'use client';

import { useEffect, useState } from 'react';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

import Link from 'next/link';

import { useAuth } from '@/providers/auth-provider';
import CoursesApiClient from '@/server/courses';
import { useUserStore } from '@/stores/user/user-store-provider';
import { UserCourseDTO } from '@/types';

import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import CourseCard from './card';

interface CoursesInProgressProps {}

const CoursesInProgress = ({}: CoursesInProgressProps) => {
    const [courses, setCourses] = useState<UserCourseDTO[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { isAuthenticated, isPending: isAuthPending } = useAuth();
    const { user } = useUserStore((state) => state);
    const apiClient = new CoursesApiClient();

    useEffect(() => {
        if (isAuthPending || !isAuthenticated || !user) {
            setIsLoading(false);
            setCourses([]);
            return;
        }

        const fetchCoursesInProgress = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await apiClient.getMyCourses({ page: 1, size: 4 });
                if (response?.content) {
                    setCourses(response.content);
                } else {
                    setCourses([]);
                }
            } catch (err) {
                console.error('Ошибка загрузки курсов в процессе:', err);
                setError('Не удалось загрузить ваши текущие курсы.');
                setCourses([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCoursesInProgress();
    }, [isAuthenticated]);

    if (!isAuthenticated || !user) {
        return null;
    }

    if (isAuthPending || isLoading) {
        return (
            <section className="space-y-4 md:space-y-6">
                <Skeleton className="h-7 w-1/3" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={`skeleton-in-progress-${i}`} className="flex flex-col gap-1">
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

    if (error) {
        return (
            <section className="space-y-4 md:space-y-6 text-center text-destructive bg-destructive/10 p-4 rounded-md">
                <p>{error}</p>
            </section>
        );
    }

    if (courses && courses.length > 0) {
        return (
            <motion.section
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 3 * 0.1, duration: 0.3 }}
                className="space-y-2 md:space-y-4"
            >
                <div className="flex items-center justify-between">
                    <h2 className="text-xl md:text-2xl font-bold">Продолжите обучение</h2>
                    <Link href="/me/courses">
                        <Button variant="link" className="text-primary">
                            Мои курсы
                            <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                    </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {courses.map((userCourse) => (
                        <CourseCard
                            key={userCourse.course.id}
                            course={userCourse.course}
                            progress={userCourse.progress}
                        />
                    ))}
                </div>
            </motion.section>
        );
    }

    return null;
};

export default CoursesInProgress;
