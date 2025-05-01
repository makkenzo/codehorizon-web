'use client';

import { useCallback, useEffect, useState } from 'react';

import CourseButtons from '@/components/course-buttons';
import ReviewForm from '@/components/course/review-form';
import ReviewList from '@/components/course/review-list';
import MyPagination from '@/components/reusable/my-pagination';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/providers/auth-provider';
import CoursesApiClient from '@/server/courses';
import ReviewsApiClient from '@/server/reviews';
import { useUserStore } from '@/stores/user/user-store-provider';
import { PagedResponse } from '@/types';
import { ReviewDTO } from '@/types/review';

interface CourseClientPageProps {
    courseId: string;
    courseSlug: string;
    initialReviewsData: PagedResponse<ReviewDTO> | null;
    coursePrice: number;
    courseDiscount: number;
}

export default function CourseClientPage({
    courseId,
    courseSlug,
    initialReviewsData,
    coursePrice,
    courseDiscount,
}: CourseClientPageProps) {
    const { isAuthenticated } = useAuth();

    const [reviewsData, setReviewsData] = useState(initialReviewsData);
    const [reviewsLoading, setReviewsLoading] = useState(!initialReviewsData);
    const [reviewsError, setReviewsError] = useState<string | null>(null);
    const [reviewsPage, setReviewsPage] = useState(1);
    const [currentUserReview, setCurrentUserReview] = useState<ReviewDTO | null | undefined>(undefined);
    const [hasCourseAccess, setHasCourseAccess] = useState<boolean | null>(null);
    const [isCheckingPrerequisites, setIsCheckingPrerequisites] = useState(true);
    const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);

    const apiClient = new ReviewsApiClient();
    const coursesApiClient = new CoursesApiClient();

    const fetchReviews = useCallback(
        async (page: number) => {
            console.log(courseId);

            if (!courseId) return;
            setReviewsLoading(true);
            setReviewsError(null);
            try {
                const data = await apiClient.getReviews(courseId, page - 1, 5);
                console.log(data);

                setReviewsData(data);
            } catch (error) {
                console.error('Failed to fetch reviews', error);
                setReviewsError('Не удалось загрузить отзывы.');
                setReviewsData(null);
            } finally {
                setReviewsLoading(false);
            }
        },
        [courseId, apiClient]
    );

    const checkPrerequisites = useCallback(async () => {
        if (!isAuthenticated || !courseId) {
            setHasCourseAccess(false);
            setCurrentUserReview(null);
            setIsCheckingPrerequisites(false);

            return;
        }
        setIsCheckingPrerequisites(true);
        try {
            const [access, myReview] = await Promise.all([
                coursesApiClient.checkCourseAccess(courseId).catch(() => false),
                apiClient.getMyReview(courseId),
            ]);

            setHasCourseAccess(!!access);
            setCurrentUserReview(myReview);
        } catch (error) {
            console.error('Error checking prerequisites', error);
            setHasCourseAccess(false);
            setCurrentUserReview(null);
        } finally {
            setIsCheckingPrerequisites(false);
        }
    }, [isAuthenticated, courseId, apiClient, coursesApiClient]);

    useEffect(() => {
        checkPrerequisites();
    }, [isAuthenticated]);

    useEffect(() => {
        if (reviewsPage !== 1 || !initialReviewsData) {
            fetchReviews(reviewsPage);
        } else if (reviewsPage === 1 && initialReviewsData) {
            setReviewsData(initialReviewsData);
            setReviewsLoading(false);
        }
    }, [reviewsPage, fetchReviews, initialReviewsData, courseId]);

    const handlePageChange = (newPage: number) => {
        setReviewsPage(newPage);
    };

    const refreshReviewsAndUserReview = useCallback(
        (pageToFetch: number = reviewsPage) => {
            fetchReviews(pageToFetch);
            checkPrerequisites();
        },
        [reviewsPage, fetchReviews, checkPrerequisites]
    );

    return (
        <>
            <div className="md:hidden mb-6">
                <div className="shadow border rounded-lg bg-card p-4">
                    <CourseButtons
                        course={{ id: courseId, slug: courseSlug, price: coursePrice, discount: courseDiscount }}
                    />
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <Label htmlFor="reviews" className="font-semibold text-lg">
                    Отзывы ({reviewsData?.totalElements ?? '-'})
                </Label>

                {isCheckingPrerequisites ? (
                    <Skeleton className="h-10 w-48 mb-4" />
                ) : isAuthenticated && hasCourseAccess ? (
                    <div className="mb-4">
                        {currentUserReview === undefined ? (
                            <Skeleton className="h-10 w-48" />
                        ) : currentUserReview ? (
                            <Button variant="outline" onClick={() => setIsReviewFormOpen(true)}>
                                Редактировать мой отзыв
                            </Button>
                        ) : (
                            <Button onClick={() => setIsReviewFormOpen(true)}>Написать отзыв</Button>
                        )}
                    </div>
                ) : null}

                {reviewsLoading && (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex items-start gap-4">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-1/4" />
                                    <Skeleton className="h-4 w-1/6" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-3/4" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!reviewsLoading && reviewsError && <p className="text-destructive text-center py-4">{reviewsError}</p>}

                {!reviewsLoading && !reviewsError && reviewsData?.content && reviewsData.totalElements > 0 && (
                    <ReviewList reviews={reviewsData.content} />
                )}

                {!reviewsLoading && !reviewsError && (!reviewsData || reviewsData.totalElements === 0) && (
                    <p className="text-muted-foreground text-center py-4">Отзывов пока нет. Будьте первым!</p>
                )}

                {!reviewsLoading && reviewsData && reviewsData.totalPages > 1 && (
                    <MyPagination
                        currentPage={reviewsPage}
                        totalPages={reviewsData.totalPages}
                        onPageChange={handlePageChange}
                        className="mt-6"
                    />
                )}

                <Dialog open={isReviewFormOpen} onOpenChange={setIsReviewFormOpen}>
                    {isReviewFormOpen && (
                        <ReviewForm
                            courseId={courseId}
                            existingReview={currentUserReview ?? undefined}
                            onClose={() => setIsReviewFormOpen(false)}
                            onSuccess={(updatedReview) => {
                                refreshReviewsAndUserReview(1);
                                setIsReviewFormOpen(false);
                            }}
                            onDeleteSuccess={() => {
                                refreshReviewsAndUserReview(reviewsPage);
                                setIsReviewFormOpen(false);
                            }}
                        />
                    )}
                </Dialog>
            </div>
        </>
    );
}
