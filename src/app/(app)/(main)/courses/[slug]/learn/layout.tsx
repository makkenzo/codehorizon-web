'use client';

import { useEffect, useMemo, useState } from 'react';

import { isAxiosError } from 'axios';
import { CheckCircle2, ChevronLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { shallow } from 'zustand/shallow';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

import CourseCompletionActions from '@/components/course/completion-actions';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CourseLearnProvider } from '@/contexts/course-learn-context';
import { ProtectedRoute } from '@/providers/protected-route';
import CoursesApiClient from '@/server/courses';
import { useLessonTasksStore } from '@/stores/tasks/tasks-store-provider';
import { Course, UserSpecificCourseProgressDetails } from '@/types';

import LessonSidebar from './_components/lesson-sidebar';

export default function CourseLearnLayout({ children }: { children: React.ReactNode }) {
    const params = useParams();
    const router = useRouter();
    const courseSlug = params.slug as string;
    const lessonSlug = params.lessonSlug as string | undefined;

    const [courseData, setCourseData] = useState<Course | null>(null);
    const [layoutIsLoading, setLayoutIsLoading] = useState(true);
    const [hasAccess, setHasAccess] = useState<boolean | null>(null);
    const [progressData, setProgressData] = useState<UserSpecificCourseProgressDetails | null>(null);
    const [isCourseCompleted, setIsCourseCompleted] = useState(false);

    const { congratsShownForCourses, markCongratsAsShown } = useLessonTasksStore(
        (state) => ({
            congratsShownForCourses: state.congratsShownForCourses,
            markCongratsAsShown: state.markCongratsAsShown,
        }),
        shallow
    );

    const apiClient = new CoursesApiClient();

    const updateCourseProgressState = (newProgress: UserSpecificCourseProgressDetails) => {
        setProgressData(newProgress);
    };

    useEffect(() => {
        const fetchCourseAndProgress = async () => {
            setLayoutIsLoading(true);
            setProgressData(null);
            setHasAccess(null);

            if (!courseSlug) {
                console.error('Course slug is missing');
                toast.error('Не удалось загрузить курс: отсутствует идентификатор.');
                setLayoutIsLoading(false);
                return;
            }

            let courseId = '';
            let accessGranted = false;

            try {
                const courseInfo = await apiClient.getCourseBySlug(courseSlug);
                if (!courseInfo) {
                    toast.error('Курс не найден.');
                    router.push('/courses');
                    setLayoutIsLoading(false);
                    return;
                }
                courseId = courseInfo.id;

                const [accessResult, progressResult] = await Promise.allSettled([
                    apiClient.checkCourseAccess(courseId),
                    apiClient.getUserCourseProgress(courseId),
                ]);

                if (accessResult.status === 'fulfilled') {
                    accessGranted = accessResult.value;
                    setHasAccess(accessGranted);
                } else {
                    setHasAccess(false);
                    const errorMsg =
                        accessResult.status === 'rejected'
                            ? (accessResult.reason as Error).message
                            : 'Доступ запрещен.';
                    toast.error(`Не удалось получить доступ к курсу: ${errorMsg}`);

                    router.push(`/sign-in?from=/courses/${courseSlug}/learn/${lessonSlug}`);
                    setLayoutIsLoading(false);
                    return;
                }

                if (progressResult.status === 'fulfilled') {
                    setProgressData(progressResult.value);
                } else {
                    console.error('Failed to fetch progress:', progressResult.reason);

                    toast.warning('Не удалось загрузить ваш прогресс по курсу.');
                    setProgressData(null);
                }

                if (accessGranted) {
                    const fullCourse = await apiClient.getCourseLearnContent(courseId);
                    if (fullCourse) {
                        const lessonExists = fullCourse.lessons.some((lesson) => lesson.slug === lessonSlug);
                        if (!lessonExists && fullCourse.lessons.length > 0) {
                            const firstLessonSlug = fullCourse.lessons[0].slug;
                            toast.info('Запрошенный урок не найден, открываем первый урок курса.');
                            router.replace(`/courses/${courseSlug}/learn/${firstLessonSlug}`);

                            return;
                        } else if (!lessonExists && fullCourse.lessons.length === 0) {
                            toast.warning('В этом курсе пока нет уроков.');
                        }
                        setCourseData(fullCourse);
                    } else {
                        toast.error('Не удалось загрузить данные курса.');
                        setHasAccess(false);
                    }
                } else {
                    toast.error('У вас нет доступа к этому курсу.');
                    router.push(`/courses/${courseSlug}`);
                }
            } catch (error: unknown) {
                console.error('Error checking access or fetching course data:', error);

                let errorMsg = 'Не удалось загрузить данные курса.';

                if (isAxiosError(error)) {
                    errorMsg = error?.response?.data?.message || error.message || 'Не удалось загрузить данные курса.';

                    if (error.response?.status === 401 || error.response?.status === 403) {
                        toast.error(errorMsg);

                        router.push(`/sign-in?from=/courses/${courseSlug}/learn/${lessonSlug}`);
                    } else {
                        toast.error('Произошла ошибка при загрузке данных.');
                    }
                } else if (error instanceof Error) {
                    errorMsg = error.message;
                }

                setHasAccess(false);
            } finally {
                setLayoutIsLoading(false);
            }
        };

        fetchCourseAndProgress();
    }, [courseSlug]);

    const completedLessonCount = useMemo(() => progressData?.completedLessons?.length ?? 0, [progressData]);
    const totalLessons = useMemo(() => courseData?.lessons?.length ?? 0, [courseData]);
    const courseProgressPercentage = useMemo(() => {
        if (!progressData || totalLessons === 0) return 0;
        return progressData.progress ?? 0;
    }, [progressData, totalLessons]);

    useEffect(() => {
        if (!layoutIsLoading && courseData && progressData && !isCourseCompleted) {
            const allLessonsExist = totalLessons > 0;
            const allLessonsCompleted = allLessonsExist && completedLessonCount >= totalLessons;

            const progressIs100 = typeof progressData.progress === 'number' && progressData.progress >= 100;

            if (progressIs100 || allLessonsCompleted) {
                console.log('КУРС ЗАВЕРШЕН!');
                setIsCourseCompleted(true);
            }
        } else if (
            isCourseCompleted &&
            progressData &&
            typeof progressData.progress === 'number' &&
            progressData.progress < 100
        ) {
            const courseId = courseData?.id;
            if (courseId) {
                markCongratsAsShown(courseId);
            }
            setIsCourseCompleted(false);
        }
    }, [progressData, courseData, totalLessons, completedLessonCount, layoutIsLoading, isCourseCompleted]);

    useEffect(() => {
        const courseId = courseData?.id;
        if (courseId && isCourseCompleted && !congratsShownForCourses.includes(courseId)) {
            toast.success('🎉 Поздравляем! Вы успешно завершили курс!', {
                duration: 10000,
                action: {
                    label: 'К моим курсам',
                    onClick: () => router.push('/me/courses'),
                },
            });

            markCongratsAsShown(courseId);
        }
    }, [isCourseCompleted, congratsShownForCourses, courseData?.id, markCongratsAsShown, router]);

    if (layoutIsLoading) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center gap-4 p-4 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!hasAccess || !courseData) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center gap-4 p-4 text-center">
                <p className="text-lg font-semibold text-destructive">
                    {hasAccess === false ? 'Доступ запрещен' : 'Не удалось загрузить курс'}
                </p>
                <p className="text-muted-foreground">
                    {hasAccess === false
                        ? 'У вас нет разрешения на просмотр этого курса.'
                        : 'Попробуйте обновить страницу или вернуться позже.'}
                </p>
                <Button onClick={() => router.push('/courses')}>Вернуться к курсам</Button>
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <CourseLearnProvider
                course={courseData}
                initialProgress={progressData}
                updateCourseProgress={updateCourseProgressState}
            >
                <div className="flex flex-col h-screen">
                    <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-card sticky top-[var(--header-height)] z-40">
                        <div className="flex items-center gap-4 overflow-hidden">
                            <Link
                                href={`/courses/${courseSlug}`}
                                className="text-sm font-medium hover:underline text-primary shrink-0"
                            >
                                <ChevronLeft className="inline-block h-4 w-4 mr-1 align-middle" />
                                <span className="truncate hidden sm:inline">{courseData.title}</span>
                                <span className="truncate sm:hidden">Назад</span>
                            </Link>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                            {isCourseCompleted && !layoutIsLoading && (
                                <TooltipProvider delayDuration={150}>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <CheckCircle2 className="h-5 w-5 text-success animate-pulse" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Курс пройден!</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            )}
                            {progressData === null && !layoutIsLoading ? (
                                <Skeleton className="h-4 w-24 rounded" />
                            ) : totalLessons > 0 ? (
                                <>
                                    <Progress value={courseProgressPercentage} className="w-32 h-2" />
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                                        {completedLessonCount} из {totalLessons} пройдено
                                    </span>
                                </>
                            ) : (
                                <span className="text-xs text-muted-foreground">Нет уроков</span>
                            )}
                        </div>
                    </header>

                    <div className="flex flex-1 overflow-hidden">
                        <LessonSidebar course={courseData} isCourseCompleted={isCourseCompleted} />
                        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-background">
                            {isCourseCompleted && <CourseCompletionActions courseSlug={courseSlug} />}
                            {children}
                        </main>
                    </div>
                </div>
            </CourseLearnProvider>
        </ProtectedRoute>
    );
}
