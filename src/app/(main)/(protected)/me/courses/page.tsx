'use client';

import { useEffect, useState } from 'react';

import CourseCard from '@/components/course/card';
import CoursesApiClient from '@/server/courses';
import { Course } from '@/types';

const MyCoursesPage = () => {
    const [data, setData] = useState<{ course: Omit<Course, 'lessons'>; progress: number }[]>([]);

    const fetchCourses = async () => {
        const response = await new CoursesApiClient().getMyCourses();

        if (response) {
            console.log(response.content);

            setData(response.content);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col">
                <h1 className="text-xl font-bold">Мои курсы</h1>
                <p className="text-black-60/60">Список ваших курсов</p>
            </div>
            <div className="grid grid-cols-4 gap-5">
                {data.map((course) => (
                    <CourseCard key={course.course.slug} course={course.course} progress={course.progress} />
                ))}
            </div>
        </div>
    );
};

export default MyCoursesPage;
