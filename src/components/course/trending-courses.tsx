'use client';

import { motion } from 'framer-motion';
import { ArrowRight, FireExtinguisher, Flame } from 'lucide-react';

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
            className="space-y-4 md:space-y-6 relative"
        >
            <div className="absolute -inset-4 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background/90 rounded-xl"></div>
                <motion.div
                    className="absolute top-1/4 -left-10 w-40 h-40 rounded-full bg-primary/5 blur-3xl"
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.2, 0.3, 0.2],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: 'reverse',
                    }}
                />

                <motion.div
                    className="absolute bottom-0 right-1/4 w-32 h-32 rounded-full bg-secondary/5 blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.1, 0.2, 0.1],
                    }}
                    transition={{
                        duration: 6,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: 'reverse',
                        delay: 2,
                    }}
                />

                <div className="absolute inset-0 bg-[radial-gradient(hsl(var(--muted-foreground)/5)_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>
            </div>

            <div className="flex items-center justify-between relative">
                <motion.div
                    className="flex items-center justify-between w-full"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 9 * 0.1, duration: 0.4 }}
                >
                    <div className="flex items-center gap-2">
                        <motion.div
                            whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                            transition={{ duration: 0.5 }}
                            className="p-1.5 rounded-md bg-primary/10 text-primary"
                        >
                            <Flame className="h-5 w-5" />
                        </motion.div>
                        <h2 className="text-xl md:text-2xl font-bold">Популярные курсы</h2>
                    </div>
                    <Link href="/courses?sortBy=popular">
                        <Button variant="link" className="text-primary">
                            Смотреть все
                            <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                    </Link>
                </motion.div>

                <motion.div
                    className="absolute -bottom-2 left-0 h-0.5 bg-gradient-to-r from-primary/50 via-primary/20 to-transparent"
                    initial={{ width: 0 }}
                    animate={{ width: '40%' }}
                    transition={{ delay: 13 * 0.1, duration: 0.8 }}
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 relative">
                {initialCourses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                ))}
            </div>
        </motion.section>
    );
};

export default TrendingCourses;
