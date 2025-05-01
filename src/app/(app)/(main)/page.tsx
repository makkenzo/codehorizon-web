import CategoryRowSelect from '@/components/course/category-row-select';
import CoursesInProgress from '@/components/course/courses-in-progress';
import LatestCourses from '@/components/course/latest-courses';
import TrendingCourses from '@/components/course/trending-courses';
import Hero from '@/components/hero';
import PageWrapper from '@/components/reusable/page-wrapper';
import CoursesApiClient from '@/server/courses';

export default async function Home() {
    const apiClient = new CoursesApiClient();

    const [trendingCoursesData, categoriesData, latestCoursesData] = await Promise.all([
        apiClient.getCourses({ sortBy: 'popular', size: 4 }),
        apiClient.getCategories(),
        apiClient.getCourses({ sortBy: 'createdAt_desc', size: 4 }),
    ]);

    const trendingCourses = trendingCoursesData?.content ?? [];
    const categories = categoriesData ?? [];
    const latestCourses = latestCoursesData?.content ?? [];

    return (
        <>
            <Hero />
            <PageWrapper className="space-y-[20px] ">
                <CoursesInProgress />
                <CategoryRowSelect categories={categories} />
                <LatestCourses initialCourses={latestCourses} />
                <TrendingCourses initialCourses={trendingCourses} />
            </PageWrapper>
        </>
    );
}
