'use client';

import { useEffect, useState } from 'react';

import { isAxiosError } from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';

import { useSearchParams } from 'next/navigation';

import CatalogFilters from '@/components/catalog/filters';
import CourseCard from '@/components/course/card';
import MyPagination from '@/components/reusable/my-pagination';
import PageWrapper from '@/components/reusable/page-wrapper';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { mapFiltersToApiParams } from '@/lib/utils';
import CoursesApiClient from '@/server/courses';
import { useCatalogFiltersStore } from '@/stores/catalog-filters/catalog-filters-store-provider';
import { CatalogFiltersState, PriceStatus } from '@/stores/catalog-filters/types';
import { Course } from '@/types';

import { Button } from '../ui/button';

const CoursesPageContent = () => {
    const searchParams = useSearchParams();
    const {
        categories,
        level,
        rating,
        videoDuration,
        sortBy,
        setSortBy,
        page,
        priceStatus,
        setPriceStatus,
        setPage,
        totalPages,
        setTotalPages,
        setCategories,
        setLevels,
        setVideoDurations,
        setRating: setStoreRating,
    } = useCatalogFiltersStore((state) => state);

    const [courses, setCourses] = useState<Omit<Course, 'lessons'>[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const categoryParams = searchParams.getAll('category');
        const levelParams = searchParams.getAll('level');
        const ratingParam = searchParams.get('rating');
        const durationParams = searchParams.getAll('duration');
        const sortByParam = searchParams.get('sortBy');
        const pageParam = searchParams.get('page');
        const priceStatusParam = searchParams.get('priceStatus');

        if (
            categoryParams.length > 0 &&
            JSON.stringify(categoryParams.sort()) !== JSON.stringify([...categories].sort())
        ) {
            setCategories(categoryParams);
        } else if (categoryParams.length === 0 && categories.length > 0) {
            setCategories([]);
        }

        if (levelParams.length > 0 && JSON.stringify(levelParams.sort()) !== JSON.stringify([...level].sort())) {
            setLevels(levelParams);
        } else if (levelParams.length === 0 && level.length > 0) {
            setLevels([]);
        }

        if (ratingParam && ratingParam !== rating) {
            setStoreRating(ratingParam);
        } else if (!ratingParam && rating !== 'all') {
            setStoreRating('all');
        }

        if (
            durationParams.length > 0 &&
            JSON.stringify(durationParams.sort()) !== JSON.stringify([...videoDuration].sort())
        ) {
            setVideoDurations(durationParams);
        } else if (durationParams.length === 0 && videoDuration.length > 0) {
            setVideoDurations([]);
        }

        if (sortByParam && sortByParam !== sortBy) {
            setSortBy(sortByParam);
        } else if (!sortByParam && sortBy !== 'popular') {
            setSortBy('popular');
        }

        if (priceStatusParam && priceStatusParam !== priceStatus) {
            setPriceStatus(priceStatusParam as PriceStatus);
        } else if (!priceStatusParam && priceStatus !== 'all') {
            setPriceStatus('all');
        }

        const pageNumber = parseInt(pageParam || '1', 10);
        if (!isNaN(pageNumber) && pageNumber !== page) {
            setPage(pageNumber);
        } else if (!pageParam && page !== 1) {
            setPage(1);
        }

        const initialCategory = searchParams.getAll('category');
        if (initialCategory.length > 0) setCategories(initialCategory);

        const initialLevel = searchParams.getAll('level');
        if (initialLevel.length > 0) setLevels(initialLevel);

        const initialRating = searchParams.get('rating');
        if (initialRating) setStoreRating(initialRating);

        const initialDuration = searchParams.getAll('duration');
        if (initialDuration.length > 0) setVideoDurations(initialDuration);

        const initialSortBy = searchParams.get('sortBy');
        if (initialSortBy) setSortBy(initialSortBy);

        const initialPriceStatus = searchParams.get('priceStatus') as PriceStatus | null;
        if (initialPriceStatus) setPriceStatus(initialPriceStatus);

        const initialPage = parseInt(searchParams.get('page') || '1', 10);
        setPage(initialPage);
    }, []);

    const fetchCourses = async (filters: Omit<CatalogFiltersState, 'totalPages'>) => {
        setIsLoading(true);
        setCourses(null);
        setError(null);

        try {
            const data = await new CoursesApiClient().getCourses(mapFiltersToApiParams(filters));
            if (data) {
                setCourses(data.content);

                if (data.totalPages !== totalPages) {
                    setTotalPages(data.totalPages);
                }
            } else {
                setCourses([]);
                if (totalPages !== 0) setTotalPages(0);
            }
        } catch (err: unknown) {
            console.error('Failed to fetch courses:', err);
            let errorMessage = 'Не удалось загрузить курсы. Попробуйте позже.';
            if (isAxiosError(err)) {
                errorMessage = err.response?.data?.message || err.message || errorMessage;
            } else if (err instanceof Error) {
                errorMessage = err.message;
            }
            setError(errorMessage);
            toast.error(errorMessage);
            setCourses([]);
            if (totalPages !== 0) setTotalPages(0);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses({ categories, level, rating, videoDuration, sortBy, page, priceStatus });
    }, [categories, level, rating, videoDuration, priceStatus, sortBy, page, setTotalPages]);

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', newPage.toString());
        setPage(newPage);

        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState({ path: newUrl }, '', newUrl);
    };

    const renderCourseCardSkeletons = (count: number) => {
        return Array.from({ length: count }).map((_, i) => (
            <motion.div
                key={`skeleton-course-${i}`}
                className="flex flex-col gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeInOut', delay: i * 0.07 }}
            >
                <Skeleton className="aspect-[16/9] w-full rounded-sm md:rounded-[14px]" />
                <Skeleton className="h-[24px] w-2/3 mt-1" />
                <Skeleton className="h-[20px] w-1/4" />
                <Skeleton className="h-[20px] w-1/2" />
            </motion.div>
        ));
    };

    return (
        <PageWrapper className="md:grid md:grid-cols-4 mb-20 max-md:mt-4 gap-5">
            <CatalogFilters />
            <div className="md:col-span-3">
                <div className="md:flex hidden items-center justify-between mb-6">
                    <h2 className="font-semibold">Все курсы</h2>
                    <Select
                        value={sortBy}
                        onValueChange={(value) => {
                            const params = new URLSearchParams(searchParams.toString());
                            params.set('sortBy', value);
                            params.set('page', '1');
                            window.history.pushState(null, '', `?${params.toString()}`);
                            setSortBy(value);
                            setPage(1);
                            setSortBy(value);
                        }}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Упорядочить по" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="popular">Самые популярные</SelectItem>
                            <SelectItem value="date_desc">Сначала новые</SelectItem>
                            <SelectItem value="price_asc">Сначала дешевые</SelectItem>
                            <SelectItem value="price_desc">Сначала дорогие</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {error && !isLoading && (
                    <div className="col-span-2 md:col-span-3 text-center py-10 text-destructive bg-destructive/10 p-4 rounded-md">
                        <p>{error}</p>
                        <Button
                            onClick={() =>
                                fetchCourses({ categories, level, rating, videoDuration, sortBy, page, priceStatus })
                            }
                            variant="link"
                            className="mt-2"
                        >
                            Попробовать снова
                        </Button>
                    </div>
                )}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={
                            page +
                            sortBy +
                            categories.join(',') +
                            level.join(',') +
                            rating +
                            videoDuration.join(',') +
                            priceStatus
                        }
                        className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {isLoading ? (
                            renderCourseCardSkeletons(6)
                        ) : courses && courses.length > 0 ? (
                            courses.map((course, idx) => (
                                <motion.div
                                    key={course.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    transition={{ duration: 0.3, ease: 'easeInOut', delay: idx * 0.05 }}
                                >
                                    <CourseCard course={course} />
                                </motion.div>
                            ))
                        ) : !error ? (
                            <div className="col-span-2 md:col-span-3 text-center py-10 text-muted-foreground">
                                По вашему запросу курсы не найдены. Попробуйте изменить фильтры.
                            </div>
                        ) : null}
                    </motion.div>
                </AnimatePresence>
                {!isLoading && totalPages && totalPages > 1 ? (
                    <MyPagination
                        className="mt-10 md:mt-15"
                        currentPage={page}
                        onPageChange={handlePageChange}
                        totalPages={totalPages}
                    />
                ) : isLoading && !courses ? (
                    <div className="flex mt-10 md:mt-15 justify-center">
                        <Skeleton className="w-full max-w-[458px] h-[40px] rounded-md" />
                    </div>
                ) : null}
            </div>
        </PageWrapper>
    );
};

export default CoursesPageContent;
