'use client';

import { useEffect, useReducer } from 'react';

import axios from 'axios';
import { Loader2 } from 'lucide-react';

import { useSearchParams } from 'next/navigation';

import { initialMyCoursesState, myCoursesReducer, tabMeta } from '@/lib/reducers/my-courses-reducer';
import CoursesApiClient from '@/server/courses';
import { Course } from '@/types';

import CourseCard from '../course/card';

type CourseDisplayData = { course: Omit<Course, 'lessons'>; progress?: number };

const MyCoursesContent = () => {
    const [state, dispatch] = useReducer(myCoursesReducer, initialMyCoursesState);

    const searchParams = useSearchParams();
    const currentTab = searchParams.get('tab') ?? 'default';

    const apiClient = new CoursesApiClient();

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;
        const fetchCourses = async () => {
            dispatch({ type: 'START_LOADING' });
            const meta = tabMeta[currentTab as keyof typeof tabMeta] ?? tabMeta.default;
            dispatch({ type: 'SET_META', payload: meta });

            try {
                let response;
                let normalizedData: CourseDisplayData[] = [];

                if (currentTab === 'wishlist') {
                    response = await apiClient.getMyWishlist({}, signal);
                    normalizedData = response?.content?.map((c) => ({ course: c })) ?? [];
                } else if (currentTab === 'completed') {
                    response = await apiClient.getMyCompletedCourses({}, signal);
                    normalizedData = response?.content ?? [];
                } else {
                    response = await apiClient.getMyCourses({}, signal);
                    normalizedData = response?.content ?? [];
                }

                if (!signal.aborted) {
                    dispatch({ type: 'SET_COURSES', payload: normalizedData });
                }
            } catch (err) {
                if (!axios.isCancel(err)) {
                    console.error('Ошибка при загрузке курсов', err);
                    dispatch({ type: 'SET_ERROR', payload: 'Не удалось загрузить курсы. Попробуйте позже.' });
                }
            }
        };

        fetchCourses();

        return () => {
            controller.abort();
        };
    }, [currentTab]);

    const { isLoading, error, courses, title, description } = state;

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col">
                <h1 className="text-xl font-bold">{title}</h1>
                <p className="text-black-60/60">{description}</p>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center p-10">
                    <Loader2 className="animate-spin" />
                </div>
            ) : null}

            {error ? <p className="text-destructive">{error}</p> : null}

            {!isLoading && !error && courses.length === 0 ? (
                <p className="text-black-60/60">Здесь пока ничего нет.</p>
            ) : null}

            {!isLoading && !error && courses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {courses.map((course) => (
                        <CourseCard key={course.course.slug} course={course.course} progress={course.progress} />
                    ))}
                </div>
            ) : null}
        </div>
    );
};
export default MyCoursesContent;
