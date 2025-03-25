'use client';

import { motion } from 'framer-motion';

import { Button } from '../ui/button';

const mockCategories = [
    'All Recommendation',
    'Adobe Illustrator',
    'Adobe Photoshop',
    'UI Design',
    'Web Programming',
    'Mobile Programming',
    'Backend Programming',
    'Vue JS',
];

const CategoryRowSelect = () => {
    return (
        <motion.div
            className="flex gap-2 items-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 5 * 0.1, duration: 0.3 }}
        >
            {mockCategories.map((category, index) => (
                <Button
                    variant="outline"
                    key={index}
                    className="border-black/10 hover:border-primary hover:text-primary hover:bg-transparent text-black/60 font-medium px-4 data-[active=true]:border-primary data-[active=true]:text-primary"
                    size="sm"
                    data-active={index === 0}
                >
                    {category}
                </Button>
            ))}
        </motion.div>
    );
};

export default CategoryRowSelect;
