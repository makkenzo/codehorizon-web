'use client';

import { Button } from '../ui/button';

interface CategoryRowSelectProps {}

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

const CategoryRowSelect = ({}: CategoryRowSelectProps) => {
    return (
        <div className="flex gap-2 items-center">
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
        </div>
    );
};

export default CategoryRowSelect;

