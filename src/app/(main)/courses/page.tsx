'use client';

import { useEffect, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import CatalogFilters from '@/components/catalog/filters';
import CourseCard from '@/components/course/card';
import PageWrapper from '@/components/reusable/page-wrapper';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { mapFiltersToApiParams } from '@/lib/utils';
import CoursesApiClient from '@/server/courses';
import { useCatalogFiltersStore } from '@/stores/catalog-filters/catalog-filters-store-provider';
import { CatalogFiltersState } from '@/stores/catalog-filters/types';
import { Course } from '@/types';

const CoursesPage = () => {
    const { categories, level, rating, videoDuration, sortBy, setSortBy } = useCatalogFiltersStore((state) => state);
    const [courses, setCourses] = useState<Omit<Course, 'lessons'>[] | null>(null);

    const fetchCourses = async (filters: CatalogFiltersState) => {
        try {
            const data = await new CoursesApiClient().getCourses(mapFiltersToApiParams(filters));

            if (data) {
                setCourses(data?.content);
            } else {
                setCourses([]);
            }
        } catch (error) {
            console.error('Failed to fetch courses:', error);
        }
    };

    useEffect(() => {
        fetchCourses({ categories, level, rating, videoDuration, sortBy });
    }, [categories, level, rating, videoDuration, sortBy]);

    return (
        <PageWrapper className="grid grid-cols-4 mb-20 gap-5">
            <CatalogFilters />
            <div className="col-span-3">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="font-semibold">Все курсы</h2>
                    <Select onValueChange={(value) => setSortBy(value)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Упорядочить по" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="popular">Самые популярные</SelectItem>
                            <SelectItem value="price_asc">Сначала дешевые</SelectItem>
                            <SelectItem value="price_desc">Сначала дорогие</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <AnimatePresence>
                    <motion.div
                        className="grid grid-cols-3 gap-5"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        {courses ? (
                            courses.length > 0 ? (
                                courses.map((course, idx) => (
                                    <motion.div
                                        key={course.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.5, ease: 'easeInOut', delay: idx * 0.05 }}
                                    >
                                        <CourseCard course={course} />
                                    </motion.div>
                                ))
                            ) : (
                                <div>No courses found</div>
                            )
                        ) : (
                            Array.from({ length: 12 }).map((_, i) => (
                                <motion.div
                                    key={`skeleton-${i}`}
                                    className="flex flex-col gap-1"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.5, ease: 'easeInOut', delay: i * 0.1 }}
                                >
                                    <Skeleton className="h-[162px] w-full rounded-[23px]" />
                                    <Skeleton className="h-[24px] w-2/3" />
                                    <Skeleton className="h-[24px] w-2/5" />
                                    <Skeleton className="h-[20px] w-full" />
                                    <Skeleton className="h-[20px] w-full" />
                                    <Skeleton className="h-[20px] w-1/4" />
                                    <Skeleton className="h-[20px] w-1/2" />
                                    <Skeleton className="h-[26px] w-1/3" />
                                </motion.div>
                            ))
                        )}
                    </motion.div>
                </AnimatePresence>
                <div className="bg-purple-200 mt-15">Pagination here</div>
            </div>
        </PageWrapper>
    );
};

export default CoursesPage;
