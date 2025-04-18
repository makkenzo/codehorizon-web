import Player from 'next-video/player';
import MediaThemeMinimal from 'player.style/minimal/react';
import { FaBook } from 'react-icons/fa';
import { IoMdVolumeHigh } from 'react-icons/io';
import { MdLiveTv } from 'react-icons/md';
import { MdChromeReaderMode } from 'react-icons/md';

import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import CourseBuyButton from '@/components/course-buy-button';
import PageWrapper from '@/components/reusable/page-wrapper';
import Price from '@/components/reusable/price';
import WishlistButton from '@/components/reusable/wishlist-button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { formatDuration, getPercentDifference } from '@/lib/utils';
import CoursesApiClient from '@/server/courses';
import ProfileApiClient from '@/server/profile';

interface CoursePageProps {
    params: Promise<{ slug: string }>;
}

const CoursePage = async (props: CoursePageProps) => {
    const params = await props.params;
    const { slug } = params;

    const coursesApiClient = new CoursesApiClient();
    const profileApiClient = new ProfileApiClient();

    const course = await coursesApiClient.getCourseBySlug(slug).catch((error) => {
        console.error(`Ошибка при загрузке курса ${slug}:`, error);
        return null;
    });

    if (!course) {
        console.warn(`Курс с slug ${slug} не найден`);
        notFound();
    }

    const authorPromise = profileApiClient.getUserProfile(course.authorUsername).catch((err) => {
        console.error(`Ошибка загрузки автора ${course.authorUsername}:`, err);
        return null;
    });

    const author = await authorPromise;

    if (!author) {
        console.warn(
            `Автор ${course.authorUsername} не найден или не удалось загрузить. Отображение страницы без автора.`
        );
    }

    return (
        <PageWrapper className="mb-16">
            <div className="grid grid-cols-3 gap-5">
                <div className="col-span-2 flex flex-col gap-4">
                    {course.videoPreview ? (
                        <Player
                            src={course.videoPreview}
                            theme={MediaThemeMinimal}
                            style={{
                                '--media-secondary-color': '#3eccb2',
                                '--media-primary-color': '#faf2f0',
                            }}
                        />
                    ) : course.imagePreview ? (
                        <div>image</div>
                    ) : null}

                    <h1 className="text-[24px] font-semibold">{course.title}</h1>

                    <div className="flex flex-col gap-4">
                        <Label htmlFor="description" className="font-bold text-lg">
                            О курсе
                        </Label>
                        <p className="text-black-60/60">{course.description}</p>
                    </div>

                    <Separator />

                    <div className="flex flex-col gap-4">
                        <Label htmlFor="modules" className="font-bold text-lg">
                            Модули
                        </Label>
                        <div className="border-l-8 border-double border-black-60/60 px-4 flex flex-col gap-4">
                            {course.lessons.map((lesson, idx) => (
                                <div key={lesson.slug} className="flex gap-4 items-center">
                                    <FaBook className="size-6 text-primary" />
                                    <div className="flex flex-col">
                                        <h3 className="text-lg">{lesson.title}</h3>
                                        <h4 className="text-sm text-black-60/60">Module {idx}</h4>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    <div className="flex flex-col gap-4">
                        <Label htmlFor="reviews" className="font-bold text-lg">
                            Отзывы
                        </Label>
                        <p className="text-black-60/60">Coming soon..</p>
                    </div>
                </div>

                <div className="col-span-1 flex flex-col gap-6">
                    <div className="shadow-[0px_6px_20px_0px_rgba(0,0,0,0.05)] p-6 rounded-[6px] bg-white h-fit">
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
                            <CourseBuyButton key={course.id} courseId={course.id} courseSlug={course.slug} />
                            <WishlistButton courseId={course.id} />
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
                    {author ? (
                        <div className="relative w-full">
                            <Link href={`/u/${author.username}`}>
                                {author.profile.avatarUrl ? (
                                    <Image
                                        src={author.profile.avatarUrl}
                                        alt={author.username}
                                        width={389}
                                        height={438}
                                        className="rounded-[18px] w-full"
                                    />
                                ) : (
                                    <div className="rounded-[18px] w-full h-[438px] bg-primary"></div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t gap-2 from-black/88 to-black/0 rounded-[18px] px-5 pb-10 flex flex-col justify-end">
                                    <h2 className="bg-primary text-white p-1 font-semibold rounded-[4px] w-fit">
                                        {author.username}
                                    </h2>
                                    <h3 className="text-white text-2xl">{course.authorName}</h3>
                                </div>
                            </Link>
                        </div>
                    ) : null}
                </div>
            </div>
        </PageWrapper>
    );
};

export default CoursePage;
