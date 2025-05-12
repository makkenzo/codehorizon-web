'use client';

import { useCallback, useEffect, useState } from 'react';

import { Star } from 'lucide-react';

import ReviewForm from '@/components/course/review-form';
import ReviewList from '@/components/course/review-list';
import MyPagination from '@/components/reusable/my-pagination';
import RatingStars from '@/components/reusable/rating-stars';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { usePermissions } from '@/hooks/use-permissions';
import { useAuth } from '@/providers/auth-provider';
import ReviewsApiClient from '@/server/reviews';
import { PagedResponse } from '@/types';
import { RatingDistributionDTO, ReviewDTO } from '@/types/review';

interface CourseClientPageReviewsProps {
    courseId: string;
    initialReviewsData: PagedResponse<ReviewDTO> | null;
    courseRating: number;
    ratingDistribution: RatingDistributionDTO[] | null;
    hasCourseAccess: boolean | null;
    isLoadingAccess: boolean;
}

export default function CourseClientPageReviews({
    courseId,
    initialReviewsData,
    courseRating,
    ratingDistribution: initialRatingDistribution,
    hasCourseAccess,
    isLoadingAccess,
}: CourseClientPageReviewsProps) {
    const { isAuthenticated, isPending: isAuthPending } = useAuth();
    const { hasPermission } = usePermissions();

    const [reviewsData, setReviewsData] = useState(initialReviewsData);
    const [currentRatingDistribution, setCurrentRatingDistribution] = useState(initialRatingDistribution);
    const [currentCourseRating, setCurrentCourseRating] = useState(courseRating);

    const [isPaginatingReviews, setIsPaginatingReviews] = useState(false);
    const [reviewsError, setReviewsError] = useState<string | null>(null);
    const [reviewsPage, setReviewsPage] = useState(1);

    const [currentUserReview, setCurrentUserReview] = useState<ReviewDTO | null | undefined>(undefined);
    const [isCheckingUserReview, setIsCheckingUserReview] = useState(true);
    const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);

    const apiClient = new ReviewsApiClient();

    const fetchReviewsAndDistribution = useCallback(
        async (page: number, isInitialLoad = false) => {
            if (!courseId) return;

            if (isInitialLoad && initialReviewsData && initialRatingDistribution) {
                setReviewsData(initialReviewsData);
                setCurrentRatingDistribution(initialRatingDistribution);
                setCurrentCourseRating(courseRating);
                setIsPaginatingReviews(false);
                return;
            }

            setIsPaginatingReviews(true);
            setReviewsError(null);

            try {
                const [reviewsResponse, distributionResponse] = await Promise.all([
                    apiClient.getReviews(courseId, page - 1, 5),
                    apiClient.getRatingDistribution(courseId),
                ]);

                setReviewsData(reviewsResponse);
                setCurrentRatingDistribution(distributionResponse);

                if (distributionResponse && distributionResponse.length > 0) {
                    const totalReviews = distributionResponse.reduce((sum, item) => sum + item.count, 0);
                    const totalRatingSum = distributionResponse.reduce(
                        (sum, item) => sum + item.rating * item.count,
                        0
                    );
                    if (totalReviews > 0) {
                        setCurrentCourseRating(parseFloat((totalRatingSum / totalReviews).toFixed(1)));
                    } else {
                        setCurrentCourseRating(0);
                    }
                } else if (reviewsResponse && reviewsResponse.totalElements === 0) {
                    setCurrentCourseRating(0);
                }
            } catch (error) {
                console.error('Failed to fetch reviews or distribution', error);
                setReviewsError('Не удалось загрузить отзывы.');
                setReviewsData(initialReviewsData);
                setCurrentRatingDistribution(initialRatingDistribution);
                setCurrentCourseRating(courseRating);
            } finally {
                setIsPaginatingReviews(false);
            }
        },
        [courseId, apiClient, initialReviewsData, initialRatingDistribution, courseRating]
    );

    const fetchCurrentUserReview = useCallback(async () => {
        if (!isAuthenticated || !courseId || isAuthPending) {
            setCurrentUserReview(null);
            setIsCheckingUserReview(false);
            return;
        }
        setIsCheckingUserReview(true);
        try {
            const myReview = await apiClient.getMyReview(courseId);
            setCurrentUserReview(myReview);
        } catch (error) {
            console.error('Error fetching current user review', error);
            setCurrentUserReview(null);
        } finally {
            setIsCheckingUserReview(false);
        }
    }, [isAuthenticated, isAuthPending, courseId, apiClient]);

    useEffect(() => {
        if (reviewsPage === 1) {
            fetchReviewsAndDistribution(reviewsPage);
        } else if (reviewsPage === 1 && (!initialReviewsData || !initialRatingDistribution)) {
            fetchReviewsAndDistribution(1, true);
        }
    }, [reviewsPage, initialReviewsData, initialRatingDistribution]);

    useEffect(() => {
        fetchCurrentUserReview();
    }, []);

    const handlePageChange = (newPage: number) => {
        setReviewsPage(newPage);
    };

    const handleReviewFormSuccess = () => {
        setIsReviewFormOpen(false);
        fetchCurrentUserReview();
        fetchReviewsAndDistribution(1);
        setReviewsPage(1);
    };

    const handleReviewDeleteSuccess = () => {
        setIsReviewFormOpen(false);
        fetchCurrentUserReview();
        fetchReviewsAndDistribution(reviewsPage);
    };

    const canWriteReview = isAuthenticated && hasCourseAccess && !isLoadingAccess && hasPermission('review:create');
    const isLoadingPrerequisitesForButton = isLoadingAccess || isCheckingUserReview || isAuthPending;

    const ReviewSectionSkeleton = () => (
        <section id="reviews" className="py-2 scroll-mt-20">
            <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <Skeleton className="h-9 w-2/5" />
                <Skeleton className="h-6 w-40" />
            </div>
            <div className="grid gap-8 md:grid-cols-12 mb-8">
                <div className="md:col-span-4 lg:col-span-3 space-y-2">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-10 w-full max-w-[200px]" />
                </div>
                <div className="space-y-2 md:col-span-8 lg:col-span-9">
                    {[...Array(5)].map((_, i) => (
                        <div key={`dist-skel-${i}`} className="flex items-center gap-2">
                            <Skeleton className="h-4 w-8" />
                            <Skeleton className="h-4 w-4 rounded-full" />
                            <Skeleton className="h-2 flex-1 max-w-[200px]" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                    ))}
                </div>
            </div>
            <div className="space-y-6">
                {[...Array(2)].map((_, i) => (
                    <div key={`review-skel-${i}`} className="flex items-start gap-4 p-4 border rounded-lg bg-card">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-1/4" />
                            <Skeleton className="h-3 w-1/6" />
                            <Skeleton className="h-4 w-full mt-1" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );

    if ((initialReviewsData === null && reviewsPage === 1) || isLoadingAccess || isAuthPending) {
        return <ReviewSectionSkeleton />;
    }

    return (
        <section id="reviews" className="py-2 scroll-mt-20">
            <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h2 className="text-3xl font-bold text-foreground">Отзывы о курсе</h2>
                <div className="flex items-center space-x-2 flex-shrink-0">
                    {isPaginatingReviews && !currentRatingDistribution ? (
                        <Skeleton className="h-6 w-40" />
                    ) : (
                        <>
                            <RatingStars count={currentCourseRating} />
                            <span className="text-sm font-medium text-muted-foreground">
                                ({currentCourseRating.toFixed(1)})
                            </span>
                            <span className="text-sm font-medium text-primary hover:text-primary/80">
                                {reviewsData?.totalElements ?? 0} отзывов
                            </span>
                        </>
                    )}
                </div>
            </div>
            <div className="grid gap-8 md:grid-cols-12 mb-8">
                <div className="md:col-span-4 lg:col-span-3">
                    <p className="mb-1 text-3xl font-bold text-foreground">{currentCourseRating.toFixed(1)} из 5</p>
                    <div className="mb-4">
                        <RatingStars count={currentCourseRating} showEmpty maxStars={5} />
                    </div>
                    {isLoadingPrerequisitesForButton ? (
                        <Skeleton className="h-10 w-full max-w-[200px]" />
                    ) : canWriteReview ? (
                        <Dialog open={isReviewFormOpen} onOpenChange={setIsReviewFormOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    variant={currentUserReview ? 'outline' : 'default'}
                                    className="w-full max-w-[200px]"
                                >
                                    {currentUserReview ? 'Редактировать мой отзыв' : 'Написать отзыв'}
                                </Button>
                            </DialogTrigger>
                            {isReviewFormOpen && (
                                <ReviewForm
                                    courseId={courseId}
                                    existingReview={currentUserReview ?? undefined}
                                    onSuccess={handleReviewFormSuccess}
                                    onDeleteSuccess={handleReviewDeleteSuccess}
                                />
                            )}
                        </Dialog>
                    ) : isAuthenticated && !hasCourseAccess && !isLoadingAccess ? (
                        <p className="text-sm text-muted-foreground max-w-[200px]">
                            Вы сможете оставить отзыв после покупки или получения доступа к курсу.
                        </p>
                    ) : null}
                </div>
                <div className="space-y-2 md:col-span-8 lg:col-span-9">
                    {!currentRatingDistribution && !reviewsError
                        ? [...Array(5)].map((_, i) => (
                              <div key={i} className="flex items-center gap-2">
                                  <Skeleton className="h-4 w-8" />
                                  <Skeleton className="h-4 w-4" />
                                  <Skeleton className="h-2 w-full max-w-[200px]" />
                                  <Skeleton className="h-4 w-20" />
                              </div>
                          ))
                        : currentRatingDistribution && currentRatingDistribution.length > 0
                          ? currentRatingDistribution.map((distItem) => (
                                <div key={distItem.rating} className="flex items-center gap-2">
                                    <span className="w-8 text-sm font-medium text-foreground text-right">
                                        {distItem.rating}
                                    </span>
                                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                    <Progress
                                        value={distItem.percentage}
                                        className="h-2 w-full max-w-[200px] sm:max-w-[250px] bg-muted"
                                    />
                                    <span className="text-sm font-medium text-muted-foreground w-24 text-left">
                                        {distItem.count} ({distItem.percentage.toFixed(0)}%)
                                    </span>
                                </div>
                            ))
                          : !reviewsError && (
                                <p className="text-sm text-muted-foreground">Нет данных о распределении оценок.</p>
                            )}
                </div>
            </div>
            {isPaginatingReviews && (!reviewsData || reviewsData.content.length === 0) && (
                <div className="space-y-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={`review-skel-${i}`} className="flex items-start gap-4 p-4 border rounded-lg bg-card">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-1/4" />
                                <Skeleton className="h-3 w-1/6" />
                                <Skeleton className="h-4 w-full mt-1" />
                                <Skeleton className="h-4 w-3/4" />
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {!isPaginatingReviews && reviewsError && (
                <p className="text-destructive text-center py-4 bg-destructive/10 rounded-md">{reviewsError}</p>
            )}
            {!isPaginatingReviews && !reviewsError && reviewsData?.content && reviewsData.totalElements > 0 && (
                <ReviewList reviews={reviewsData.content} />
            )}
            {!isPaginatingReviews && !reviewsError && (!reviewsData || reviewsData.totalElements === 0) && (
                <p className="text-muted-foreground text-center py-10 border rounded-lg bg-card">
                    Отзывов пока нет. Будьте первым!
                </p>
            )}
            {!isPaginatingReviews && reviewsData && reviewsData.totalPages > 1 && (
                <MyPagination
                    currentPage={reviewsPage}
                    totalPages={reviewsData.totalPages}
                    onPageChange={handlePageChange}
                    className="mt-8"
                />
            )}
            {isPaginatingReviews && <Skeleton className="h-10 w-1/2 mx-auto mt-8" />}
        </section>
    );
}
