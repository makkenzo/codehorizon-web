'use client';

import { motion } from 'framer-motion';

import { fadeInVariants, heroFadeInVariants } from '@/lib/constants';

import CategoryRowSelect from './category-row-select';
import CoursesInProgress from './courses-in-progress';
import PopularMentors from './popular-mentors';
import SuggestedAuthorCourses from './suggested-author-courses';
import TrendingCourses from './trending-courses';

const HomeCourseCatalog = () => {
    return (
        <motion.div
            variants={heroFadeInVariants}
            animate="visible"
            initial="visible"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
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

export default HomeCourseCatalog;
