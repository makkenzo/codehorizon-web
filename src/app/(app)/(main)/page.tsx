import CategoryRowSelect from '@/components/course/category-row-select';
import CoursesInProgress from '@/components/course/courses-in-progress';
import LatestCourses from '@/components/course/latest-courses';
import PopularMentors from '@/components/course/popular-mentors';
import TrendingCourses from '@/components/course/trending-courses';
import Hero from '@/components/hero';
import PageWrapper from '@/components/reusable/page-wrapper';
import CoursesApiClient from '@/server/courses';
import ProfileApiClient from '@/server/profile';

export const dynamic = 'force-dynamic';

export default async function Home() {
    const coursesApiClient = new CoursesApiClient();
    const profileApiClient = new ProfileApiClient();

    const [trendingCoursesData, categoriesData, latestCoursesData, popularAuthorsData] = await Promise.all([
        coursesApiClient.getCourses({ sortBy: 'popular', size: 4 }),
        coursesApiClient.getCategories(),
        coursesApiClient.getCourses({ sortBy: 'date_desc', size: 4 }),
        profileApiClient.getPopularAuthors(4),
    ]);

    const trendingCourses = trendingCoursesData?.content ?? [];
    const categories = categoriesData ?? [];
    const latestCourses = latestCoursesData?.content ?? [];
    const popularAuthors = popularAuthorsData ?? [];

    return (
        <>
            <Hero />
            <PageWrapper className="space-y-[20px] mb-[60px]">
                <CoursesInProgress />
                <CategoryRowSelect categories={categories} />
                <LatestCourses initialCourses={latestCourses} />
                <TrendingCourses initialCourses={trendingCourses} />
                <PopularMentors initialAuthors={popularAuthors} />
            </PageWrapper>
        </>
    );
}
