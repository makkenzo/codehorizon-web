'use client';

import { useEffect, useMemo, useState } from 'react';

import { toast } from 'sonner';

import { useRouter } from 'next/navigation';

import CourseButtons from '@/components/course-buttons';
import CourseTimeline, { TimelineModule } from '@/components/course/course-timeline';
import { Separator } from '@/components/ui/separator';
import { formatDuration } from '@/lib/utils';
import { UserProfile } from '@/models';
import { useAuth } from '@/providers/auth-provider';
import CoursesApiClient from '@/server/courses';
import { useUserStore } from '@/stores/user/user-store-provider';
import { Course, Lesson, PagedResponse, UserSpecificCourseProgressDetails } from '@/types';
import { RatingDistributionDTO, ReviewDTO } from '@/types/review';

import CourseClientPageReviews from './course-client-page';

export interface CoursePageClientActionsAndTimelineProps {
    courseFromServer: Omit<
        Pick<Course, 'id' | 'slug' | 'title' | 'price' | 'discount' | 'rating' | 'lessons'>,
        'lessons'
    > & {
        lessons: Array<Pick<Lesson, 'id' | 'title' | 'slug' | 'videoLength'>>;
    };
    initialReviewsData: PagedResponse<ReviewDTO> | null;
    ratingDistribution: RatingDistributionDTO[] | null;
}

const CoursePageClientActionsAndTimeline: React.FC<CoursePageClientActionsAndTimelineProps> = ({
    courseFromServer,
    initialReviewsData,
    ratingDistribution,
}) => {
    const { user } = useUserStore((state) => state);
    const { isAuthenticated, isPending: isAuthPending } = useAuth();

    const [userCourseProgressDetails, setUserCourseProgressDetails] =
        useState<UserSpecificCourseProgressDetails | null>(null);
    const [hasAccess, setHasAccess] = useState<boolean | null>(null);
    const [isLoadingClientData, setIsLoadingClientData] = useState(true);

    const coursesApiClient = new CoursesApiClient();

    useEffect(() => {
        const fetchClientSpecificData = async () => {
            if (isAuthPending) return;

            setIsLoadingClientData(true);
            if (!isAuthenticated || !user) {
                setHasAccess(false);
                setUserCourseProgressDetails(null);
                setIsLoadingClientData(false);
                return;
            }

            try {
                const [accessRes, progressRes] = await Promise.all([
                    coursesApiClient.checkCourseAccess(courseFromServer.id).catch(() => false),
                    coursesApiClient.getUserCourseProgress(courseFromServer.id).catch(() => null),
                ]);
                setHasAccess(accessRes);
                setUserCourseProgressDetails(progressRes);
            } catch (error) {
                console.error('Error fetching client-specific course data:', error);
                setHasAccess(false);
                setUserCourseProgressDetails(null);
                toast.error('Не удалось загрузить данные о вашем доступе и прогрессе.');
            } finally {
                setIsLoadingClientData(false);
            }
        };

        fetchClientSpecificData();
    }, [isAuthenticated, isAuthPending, user, courseFromServer.id, coursesApiClient]);

    return (
        <>
            <div className="md:hidden mb-6">
                <CourseButtons
                    course={{
                        id: courseFromServer.id,
                        slug: courseFromServer.slug,
                        price: courseFromServer.price,
                        discount: courseFromServer.discount,
                        lessons: courseFromServer.lessons,
                    }}
                    currentCourseProgressDetails={userCourseProgressDetails}
                />
            </div>

            <CourseClientPageReviews
                courseId={courseFromServer.id}
                initialReviewsData={initialReviewsData}
                courseRating={courseFromServer.rating}
                ratingDistribution={ratingDistribution}
                hasCourseAccess={hasAccess}
                isLoadingAccess={isLoadingClientData}
            />
        </>
    );
};

export default CoursePageClientActionsAndTimeline;
