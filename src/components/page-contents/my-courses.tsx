'use client';

import { useEffect, useReducer } from 'react';

import { motion } from 'framer-motion';
import { SearchX, ShieldAlert } from 'lucide-react';

import { useSearchParams } from 'next/navigation';

import CourseCard from '@/components/course/card';
import { Skeleton } from '@/components/ui/skeleton';
import { initialMyCoursesState, myCoursesReducer, tabMeta } from '@/lib/reducers/my-courses-reducer';
import CoursesApiClient from '@/server/courses';
import { Course } from '@/types';

type CourseDisplayData = { course: Omit<Course, 'lessons'>; progress?: number };

const MyCoursesContent = () => {
    const [state, dispatch] = useReducer(myCoursesReducer, initialMyCoursesState);

    const searchParams = useSearchParams();
    const currentTab = searchParams.get('tab') ?? 'default';
    const currentPageParam = searchParams.get('page');

    const apiClient = new CoursesApiClient();

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;
        const fetchCourses = async () => {
            dispatch({ type: 'START_LOADING' });
            const meta = tabMeta[currentTab as keyof typeof tabMeta] ?? tabMeta.default;

            dispatch({ type: 'SET_META', payload: meta });

            const page = currentPageParam ? parseInt(currentPageParam, 10) : 1;
            const size = 12;

            try {
                let response;
                let normalizedData: CourseDisplayData[] = [];
                if (currentTab === 'wishlist') {
                    response = await apiClient.getMyWishlist({ page, size }, signal);
                    normalizedData = response?.content?.map((c) => ({ course: c })) ?? [];
                } else if (currentTab === 'completed') {
                    response = await apiClient.getMyCompletedCourses({ page, size }, signal);
                    normalizedData =
                        response?.content?.map((item) => ({ course: item.course, progress: item.progress })) ?? [];
                } else {
                    response = await apiClient.getMyCourses({ page, size }, signal);
                    normalizedData =
                        response?.content?.map((item) => ({ course: item.course, progress: item.progress })) ?? [];
                }

                if (!signal.aborted) {
                    dispatch({ type: 'SET_COURSES', payload: normalizedData });
                }
            } catch (err: any) {
                if (!signal.aborted) {
                    console.error('Ошибка при загрузке курсов', err);
                    dispatch({
                        type: 'SET_ERROR',
                        payload: err.message || 'Не удалось загрузить курсы. Попробуйте позже.',
                    });
                }
            }
        };

        fetchCourses();

        return () => {
            controller.abort();
        };
    }, [currentTab, currentPageParam]);

    const { isLoading, error, courses } = state;

    const renderSkeletons = (count = 8) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-8">
            {[...Array(count)].map((_, i) => (
                <motion.div
                    key={`skeleton-my-course-${i}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    className="flex flex-col gap-2"
                >
                    <Skeleton className="aspect-[16/9] w-full rounded-lg bg-muted/70 dark:bg-muted/20" />
                    <Skeleton className="h-6 w-3/4 rounded bg-muted/70 dark:bg-muted/20" />
                    <Skeleton className="h-4 w-1/2 rounded bg-muted/70 dark:bg-muted/20" />
                    <Skeleton className="h-4 w-1/3 rounded bg-muted/70 dark:bg-muted/20" />
                </motion.div>
            ))}
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
        >
            {isLoading && renderSkeletons()}

            {!isLoading && error && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 backdrop-blur-sm p-6 text-center">
                    <ShieldAlert className="h-12 w-12 mx-auto text-destructive/60 mb-3" />
                    <h3 className="text-lg font-semibold text-destructive mb-1">Ошибка загрузки</h3>
                    <p className="text-sm text-destructive/80">{error}</p>
                </div>
            )}

            {!isLoading && !error && courses.length === 0 && (
                <div className="text-center py-16 px-4 rounded-xl bg-card/50 dark:bg-background/50 backdrop-blur-sm border border-border/20 shadow-sm">
                    <SearchX className="h-16 w-16 mx-auto text-[#3eccb2]/40 mb-4" />
                    <h3 className="text-xl font-semibold mb-1 text-foreground">
                        {currentTab === 'wishlist'
                            ? 'Ваш список желаемого пока пуст'
                            : currentTab === 'completed'
                              ? 'Вы еще не завершили ни одного курса'
                              : 'У вас пока нет активных курсов'}
                    </h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        {currentTab === 'wishlist'
                            ? 'Добавляйте курсы, которые вас заинтересовали, чтобы не потерять их!'
                            : currentTab === 'completed'
                              ? 'Начните обучение и получайте сертификаты за пройденные курсы.'
                              : 'Начните свое обучение, выбрав курс из нашего каталога.'}
                    </p>
                </div>
            )}

            {!isLoading && !error && courses.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-8">
                    {courses.map((courseData, index) => (
                        <motion.div
                            key={courseData.course.id || `course-${index}`}
                            initial={{ opacity: 0, y: 20, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.3, delay: index * 0.07 }}
                        >
                            <CourseCard course={courseData.course} progress={courseData.progress} />
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};
export default MyCoursesContent;
