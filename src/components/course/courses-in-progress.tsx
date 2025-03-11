'use client';

import { motion } from 'framer-motion';

interface CoursesInProgressProps {}

const CoursesInProgress = ({}: CoursesInProgressProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3 * 0.1, duration: 0.3 }}
        >
            <h1>CoursesInProgress</h1>
        </motion.div>
    );
};

export default CoursesInProgress;

