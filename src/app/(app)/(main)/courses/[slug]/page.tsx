import { Award } from 'lucide-react';
import { Metadata } from 'next';
import Player from 'next-video/player';
import MediaThemeMinimal from 'player.style/minimal/react';
import { IoMdVolumeHigh } from 'react-icons/io';
import { MdLiveTv } from 'react-icons/md';
import { MdChromeReaderMode } from 'react-icons/md';

import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import CourseButtons from '@/components/course-buttons';
import CourseFeatureSection from '@/components/course/course-feature-section';
import CourseTimeline from '@/components/course/course-timeline';
import PageWrapper from '@/components/reusable/page-wrapper';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { createMetadata } from '@/lib/metadata';
import { formatDuration } from '@/lib/utils';
import CoursesApiClient from '@/server/courses';
import ProfileApiClient from '@/server/profile';
import ReviewsApiClient from '@/server/reviews';
import { Lesson } from '@/types';

import CoursePageClientActionsAndTimeline, {
    CoursePageClientActionsAndTimelineProps,
} from './_components/course-page-client-actions-and-timeline';

interface CoursePageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
    const coursesApiClient = new CoursesApiClient();
    const slug = (await params).slug;
    const course = await coursesApiClient.getCourseBySlug(slug).catch(() => null);

    if (!course) {
        return createMetadata({
            title: 'Курс не найден',
            description: 'Запрошенный курс не существует или был удален.',
            path: `/courses/${slug}`,
        });
    }

    const coursePath = `/courses/${slug}`;

    return createMetadata({
        title: course.title,
        description: course.description?.substring(0, 160) || `Узнайте больше о курсе ${course.title} на CodeHorizon.`,
        imageUrl: course.imagePreview || undefined,
        path: coursePath,
    });
}

const CoursePage = async ({ params }: CoursePageProps) => {
    const { slug } = await params;

    const coursesApiClient = new CoursesApiClient();
    const profileApiClient = new ProfileApiClient();
    const reviewsApiClient = new ReviewsApiClient();

    const courseData = await coursesApiClient.getCourseBySlug(slug).catch((error) => {
        console.error(`Ошибка при загрузке курса ${slug}:`, error);
        return null;
    });

    if (!courseData) {
        notFound();
    }

    const authorPromise = courseData.authorUsername
        ? profileApiClient.getUserProfile(courseData.authorUsername).catch((err) => {
              console.warn(`Не удалось загрузить автора ${courseData.authorUsername}:`, err.message);
              return null;
          })
        : Promise.resolve(null);

    const reviewsPromise = reviewsApiClient.getReviews(courseData.id, 0, 5).catch((err) => {
        console.warn(`Не удалось загрузить отзывы для курса ${courseData.id}:`, err.message);
        return null;
    });
    const ratingDistributionPromise = reviewsApiClient.getRatingDistribution(courseData.id).catch((err) => {
        console.warn(`Не удалось загрузить распределение рейтинга для курса ${courseData.id}:`, err.message);
        return null;
    });

    const [author, initialReviewsData, ratingDistribution] = await Promise.all([
        authorPromise,
        reviewsPromise,
        ratingDistributionPromise,
    ]);

    const lessonsForClient: Pick<Lesson, 'id' | 'title' | 'slug' | 'videoLength'>[] = courseData.lessons.map(
        (lesson) => ({
            id: lesson.id,
            title: lesson.title,
            slug: lesson.slug,
            videoLength: lesson.videoLength,
        })
    );

    const courseForClient: CoursePageClientActionsAndTimelineProps['courseFromServer'] = {
        id: courseData.id,
        slug: courseData.slug,
        title: courseData.title,
        price: courseData.price,
        isFree: courseData.isFree,
        discount: courseData.discount,
        rating: courseData.rating,
        lessons: lessonsForClient,
    };

    if (!author) {
        console.warn(
            `Автор ${courseData.authorUsername} не найден или не удалось загрузить. Отображение страницы без автора.`
        );
    }

    const featureSectionData = {
        badgeText: courseData.featuresBadge,
        title: courseData.featuresTitle,
        subtitle: courseData.featuresSubtitle,
        description: courseData.featuresDescription,
        features: courseData.features,
        benefitTitle: courseData.benefitTitle,
        benefitDescription: courseData.benefitDescription,
        testimonial: courseData.testimonial,
    };

    const hasCourseDescription = !!courseData.description;
    const hasFeatureContent =
        !!featureSectionData.description ||
        featureSectionData.features ||
        !!featureSectionData.benefitTitle ||
        !!featureSectionData.benefitDescription ||
        !!featureSectionData.testimonial;
    const shouldShowAboutSection = hasCourseDescription || hasFeatureContent;

    return (
        <PageWrapper className="mb-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="md:col-span-2 flex flex-col gap-6">
                    <div className="relative aspect-video shadow-lg overflow-hidden rounded-lg">
                        {courseData.videoPreview ? (
                            <Player
                                src={courseData.videoPreview}
                                theme={MediaThemeMinimal}
                                style={{
                                    '--media-secondary-color': '#3eccb2',
                                    '--media-primary-color': '#faf2f0',
                                }}
                            />
                        ) : courseData.imagePreview ? (
                            <Image src={courseData.imagePreview} alt={courseData.title} fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                                Нет превью
                            </div>
                        )}
                    </div>

                    <h1 className="md:text-3xl text-2xl font-bold tracking-tight">{courseData.title}</h1>

                    {shouldShowAboutSection ? (
                        <>
                            <div className="flex flex-col gap-4">
                                <Label htmlFor="description" className="font-bold text-lg">
                                    О курсе
                                </Label>
                                {courseData.description ? (
                                    <div
                                        className="prose"
                                        dangerouslySetInnerHTML={{ __html: courseData.description }}
                                    />
                                ) : null}
                            </div>

                            <CourseFeatureSection {...featureSectionData} />
                        </>
                    ) : null}

                    <Separator />

                    <CoursePageClientActionsAndTimeline
                        courseFromServer={courseForClient}
                        initialReviewsData={initialReviewsData}
                        ratingDistribution={ratingDistribution}
                    />
                </div>

                <div className="md:col-span-1 relative md:order-1 -order-1 w-full">
                    <div className="flex flex-col gap-6 sticky top-10">
                        <div className="shadow-[0px_6px_20px_0px_rgba(0,0,0,0.05)] p-6 rounded-[6px] bg-white h-fit">
                            <CourseButtons
                                course={{
                                    discount: courseData.discount,
                                    id: courseData.id,
                                    price: courseData.price,
                                    slug: courseData.slug,
                                    lessons: lessonsForClient,
                                    isFree: courseData.isFree,
                                }}
                            />
                            <div className="flex flex-col gap-3 text-black-60/60 mt-6">
                                <div className="flex items-center gap-4">
                                    <MdChromeReaderMode className="size-[22px]" />
                                    {courseData.lessons.length} Уроков
                                </div>
                                {courseData.videoLength && courseData.videoLength > 0 ? (
                                    <div className="flex items-center gap-4">
                                        <MdLiveTv className="size-[22px]" />
                                        {formatDuration(courseData.videoLength)}
                                    </div>
                                ) : null}
                                <div className="flex items-center gap-4">
                                    <IoMdVolumeHigh className="size-[22px]" />
                                    English
                                </div>
                                <div className="flex items-center gap-4">
                                    <Award className="size-[22px]" />
                                    <span>Сертификат по окончанию</span>
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
                                        <h3 className="text-white text-2xl">{courseData.authorName}</h3>
                                    </div>
                                </Link>
                            </div>
                        ) : null}
                        <div id="course-content-section" className="scroll-mt-20">
                            <CourseTimeline
                                courseTitle={courseData.title}
                                courseFromServer={courseData}
                                courseSlug={courseData.slug}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
};

export default CoursePage;
