'use client';

import { motion } from 'framer-motion';

import { fadeInVariants } from '@/lib/constants';

import CategoryRowSelect from './category-row-select';
import CoursesInProgress from './courses-in-progress';
import PopularMentors from './popular-mentors';
import SuggestedAuthorCourses from './suggested-author-courses';
import TrendingCourses from './trending-courses';

const CourseCatalog = () => {
    return (
        <motion.div
            variants={fadeInVariants}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.3 }}
            className="space-y-[40px]"
        >
            <CoursesInProgress />
            <CategoryRowSelect />
            <SuggestedAuthorCourses />
            <TrendingCourses />
            <PopularMentors />
        </motion.div>
    );
};

export default CourseCatalog;

