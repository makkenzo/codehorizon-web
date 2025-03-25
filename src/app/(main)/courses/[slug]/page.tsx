import PageWrapper from '@/components/reusable/page-wrapper';
import Price from '@/components/reusable/price';
import { getPercentDifference } from '@/lib/utils';
import CoursesApiClient from '@/server/courses';

interface CoursePageProps {
    params: Promise<{ slug: string }>;
}

const CoursePage = async (props: CoursePageProps) => {
    const params = await props.params;
    const { slug } = params;

    const course = await new CoursesApiClient().getCourseBySlug(slug);

    if (!course) {
        throw new Error('Course not found');
    }

    return (
        <PageWrapper>
            <div className="grid grid-cols-3 gap-5">
                <div className="col-span-2">
                    {course.videoPreview ? <div>video</div> : course.imagePreview ? <div>image</div> : null}
                </div>

                <div className="col-span-1 shadow-[0px_6px_20px_0px_rgba(0,0,0,0.05)] p-6 rounded-[6px] bg-white h-fit">
                    <Price discount={course.discount} price={course.price} />
                    {course.discount && (
                        <div className="bg-warning text-white font-bold w-fit p-1 rounded-[2px]">
                            {getPercentDifference(course.price, course.price - course.discount)} OFF
                        </div>
                    )}
                </div>
            </div>
        </PageWrapper>
    );
};

export default CoursePage;
