'use client';

import { motion } from 'framer-motion';

const TrendingCourses = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 9 * 0.1, duration: 0.3 }}
        >
            <h1>TrendingCourses</h1>
        </motion.div>
    );
};

export default TrendingCourses;
