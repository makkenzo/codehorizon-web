import PageWrapper from '@/components/reusable/page-wrapper';
import CoursesApiClient from '@/server/courses';

interface CoursePageProps {
    params: Promise<{ slug: string }>;
}

const CoursePage = async (props: CoursePageProps) => {
    const params = await props.params;
    const { slug } = params;

    const user = await new CoursesApiClient().getCourseBySlug(slug);

    if (!user) {
        throw new Error('User not found');
    }

    return (
        <PageWrapper>
            <h1>{slug}</h1>
        </PageWrapper>
    );
};

export default CoursePage;

