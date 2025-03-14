'use client';

import { useEffect, useState } from 'react';

import CatalogFilters from '@/components/catalog/filters';
import CourseCard from '@/components/course/card';
import PageWrapper from '@/components/reusable/page-wrapper';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CoursesApiClient from '@/server/courses';
import { Course } from '@/types';

const CoursesPage = () => {
    const [courses, setCourses] = useState<Omit<Course, 'lessons'>[] | null>(null);

    const fetchCourses = async () => {
        try {
            const data = await new CoursesApiClient().getCourses();

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
        fetchCourses();
    }, []);

    return (
        <PageWrapper className="grid grid-cols-4 mb-20 gap-5">
            <CatalogFilters />
            <div className="col-span-3">
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold">Все курсы</h2>
                    <Select>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Упорядочить по" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="most-popular">Самые популярные</SelectItem>
                            <SelectItem value="cheapest">Сначала дешевые</SelectItem>
                            <SelectItem value="most-expensive">Сначала дорогие</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-3 gap-5">
                    {courses ? (
                        courses.length > 0 ? (
                            courses.map((course, idx) => (
                                // <div key={idx} className="w-[285px] h-[318px] text-center bg-emerald-200">
                                //     Card
                                // </div>
                                <CourseCard course={course} key={course.id} />
                            ))
                        ) : (
                            <div>No courses found</div>
                        )
                    ) : (
                        <div>Loading...</div>
                    )}
                </div>
                <div className="bg-purple-200 mt-15">Pagination here</div>
            </div>
        </PageWrapper>
    );
};

export default CoursesPage;
