'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

import Link from 'next/link';

import { Course } from '@/types';

import { Button } from '../ui/button';
import CourseCard from './card';

interface TrendingCoursesProps {
    initialCourses: Omit<Course, 'lessons'>[];
}

const TrendingCourses = ({ initialCourses }: TrendingCoursesProps) => {
    if (!initialCourses || initialCourses.length === 0) {
        return null;
    }

    return (
        <motion.section
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 9 * 0.1, duration: 0.3 }}
            className="space-y-2 md:space-y-4"
        >
            <div className="flex items-center justify-between">
                <h2 className="text-xl md:text-2xl font-bold">Популярные курсы</h2>
                <Link href="/courses?sortBy=popular">
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
};

export default TrendingCourses;
