import Player from 'next-video/player';
import { FaRegHeart } from 'react-icons/fa6';
import { IoMdVolumeHigh } from 'react-icons/io';
import { MdLiveTv } from 'react-icons/md';
import { MdChromeReaderMode } from 'react-icons/md';

import PageWrapper from '@/components/reusable/page-wrapper';
import Price from '@/components/reusable/price';
import { Button } from '@/components/ui/button';
import { formatDuration, getPercentDifference } from '@/lib/utils';
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
                    {course.videoPreview ? (
                        <div>
                            <Player src={course.videoPreview} />
                        </div>
                    ) : course.imagePreview ? (
                        <div>image</div>
                    ) : null}
                </div>

                <div className="col-span-1 shadow-[0px_6px_20px_0px_rgba(0,0,0,0.05)] p-6 rounded-[6px] bg-white h-fit">
                    <Price
                        discount={course.discount}
                        price={course.price}
                        priceClassName="text-2xl"
                        discountPriceClassName="text-xl ml-4"
                    />
                    {course.discount ? (
                        <div className="bg-warning text-white font-bold w-fit p-1 rounded-[2px]">
                            СКИДКА {getPercentDifference(course.price, course.price - course.discount)}
                        </div>
                    ) : null}
                    <div className="w-full flex flex-col gap-4 mt-8">
                        <Button size="lg">Купить</Button>
                        <Button variant="outline" size="lg">
                            <FaRegHeart className="size-5" />В желаемое
                        </Button>
                    </div>
                    <div className="flex flex-col gap-3 text-black-60/60 mt-6">
                        <div className="flex items-center gap-4">
                            <MdChromeReaderMode className="size-[22px]" />
                            {course.lessons.length} Уроков
                        </div>
                        {course.videoLength && course.videoLength > 0 ? (
                            <div className="flex items-center gap-4">
                                <MdLiveTv className="size-[22px]" />
                                {formatDuration(course.videoLength)}
                            </div>
                        ) : null}
                        <div className="flex items-center gap-4">
                            <IoMdVolumeHigh className="size-[22px]" />
                            English
                        </div>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
};

export default CoursePage;
