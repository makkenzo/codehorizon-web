'use client';

import { Suspense, useEffect, useState } from 'react';

import { Loader2 } from 'lucide-react';

import { useSearchParams } from 'next/navigation';

import CourseCard from '@/components/course/card';
import CoursesApiClient from '@/server/courses';
import { Course } from '@/types';

type CourseDisplayData = { course: Omit<Course, 'lessons'>; progress?: number };

const CoursesContent = () => {
    const searchParams = useSearchParams();
    const currentTab = searchParams.get('tab');

    const [data, setData] = useState<CourseDisplayData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [pageTitle, setPageTitle] = useState<string>('Мои курсы');
    const [pageDescription, setPageDescription] = useState<string>('Список ваших курсов');

    useEffect(() => {
        const fetchCourses = async () => {
            setIsLoading(true);
            setError(null);
            setData([]);

            const apiClient = new CoursesApiClient();
            let normalizedData: CourseDisplayData[] = [];
            let response;

            try {
                switch (currentTab) {
                    case 'wishlist':
                        setPageTitle('Желаемое');
                        setPageDescription('Список ваших курсов с уроками, которые вы хотите пройти');
                        response = await apiClient.getMyWishlist();

                        if (response?.content) {
                            normalizedData = response.content.map((courseItem) => ({
                                course: courseItem,
                                progress: undefined,
                            }));
                        }

                        break;
                    case 'completed':
                        setPageTitle('Пройденные курсы');
                        setPageDescription('Курсы, которые вы успешно завершили');
                        response = await apiClient.getMyCompletedCourses();

                        if (response?.content) {
                            normalizedData = response.content;
                        }

                        break;
                    default:
                        setPageTitle('Мои курсы');
                        setPageDescription('Список ваших курсов');

                        response = await apiClient.getMyCourses();

                        if (response?.content) {
                            normalizedData = response.content;
                        }

                        break;
                }

                setData(normalizedData);
            } catch (err) {
                console.error('Ошибка при загрузке курсов', err);
                setError('Не удалось загрузить курсы. Попробуйте позже.');
                setData([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCourses();
    }, [currentTab]);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col">
                <h1 className="text-xl font-bold">{pageTitle}</h1>
                <p className="text-black-60/60">{pageDescription}</p>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center p-10">
                    <Loader2 className="animate-spin" />
                </div>
            ) : null}

            {error ? <p className="text-destructive">{error}</p> : null}

            {!isLoading && !error && data.length === 0 ? (
                <p className="text-black-60/60">Здесь пока ничего нет.</p>
            ) : null}

            {!isLoading && !error && data.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {data.map((course) => (
                        <CourseCard key={course.course.slug} course={course.course} progress={course.progress} />
                    ))}
                </div>
            ) : null}
        </div>
    );
};

const MyCoursesPage = () => {
    return (
        <Suspense fallback={<Loader2 className="animate-spin" />}>
            <CoursesContent />
        </Suspense>
    );
};

export default MyCoursesPage;
