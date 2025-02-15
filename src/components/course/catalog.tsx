'use client';

import SubscribeNewsletterBanner from '../subscribe-newsletter-banner';
import CategoryRowSelect from './category-row-select';
import PopularMentors from './popular-mentors';
import SuggestedAuthorCourses from './suggested-author-courses';
import TrendingCourses from './trending-courses';

const CourseCatalog = () => {
    return (
        <div className="space-y-[40px]">
            <CategoryRowSelect />
            <SuggestedAuthorCourses />
            <TrendingCourses />
            <PopularMentors />
            <SubscribeNewsletterBanner />
        </div>
    );
};

export default CourseCatalog;

