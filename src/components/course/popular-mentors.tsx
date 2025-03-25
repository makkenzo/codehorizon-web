'use client';

import { motion } from 'framer-motion';

const PopularMentors = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 11 * 0.1, duration: 0.3 }}
        >
            <h1>PopularMentors</h1>
        </motion.div>
    );
};

export default PopularMentors;
