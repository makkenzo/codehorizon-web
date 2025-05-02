'use client';

import { useEffect, useMemo, useState } from 'react';

import { isAxiosError } from 'axios';
import { CheckCircle2, ChevronLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { CourseLearnProvider } from '@/contexts/course-learn-context';
import { cn } from '@/lib/utils';
import { ProtectedRoute } from '@/providers/protected-route';
import CoursesApiClient from '@/server/courses';
import { Course, CourseProgress } from '@/types';

interface LessonSidebarProps {
    course: Course;
    currentLessonSlug: string;
    completedLessons: string[];
}

const LessonSidebar = ({ course, currentLessonSlug, completedLessons }: LessonSidebarProps) => {
    return (
        <aside className="w-64 h-full border-r border-border p-4 overflow-y-auto shrink-0 md:block hidden bg-card">
            <Link href={`/courses/${course.slug}`} className="mb-4 block">
                <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                    <ChevronLeft className="mr-1 h-3 w-3" />К обзору курса
                </Button>
            </Link>

            <h2 className="text-base font-semibold mb-3 px-2 truncate" title={course.title}>
                {course.title}
            </h2>

            <nav className="flex flex-col gap-1">
                {course.lessons.map((lesson) => {
                    const isCompleted = completedLessons.includes(lesson.id);
                    const isActive = currentLessonSlug === lesson.slug;

                    return (
                        <Link
                            key={lesson.slug}
                            href={`/courses/${course.slug}/learn/${lesson.slug}`}
                            className={cn(
                                'text-sm p-2 rounded-md hover:bg-muted flex items-center justify-between gap-2 group',
                                isActive
                                    ? 'bg-muted/40 font-medium text-primary'
                                    : 'text-muted-foreground hover:text-foreground',
                                isCompleted && !isActive && 'text-foreground/60'
                            )}
                            title={lesson.title}
                        >
                            <span className="truncate flex-1">{lesson.title}</span>
                            {isCompleted && (
                                <CheckCircle2
                                    className={cn(
                                        'h-4 w-4 text-success shrink-0 opacity-70',
                                        isActive && 'text-primary opacity-100'
                                    )}
                                />
                            )}
                        </Link>
                    );
                })}
                {course.lessons.length === 0 && (
                    <p className="text-xs text-muted-foreground px-2 py-4 text-center">В этом курсе пока нет уроков.</p>
                )}
            </nav>
        </aside>
    );
};

export default function CourseLearnLayout({ children }: { children: React.ReactNode }) {
    const params = useParams();
    const router = useRouter();
    const courseSlug = params.slug as string;
    const lessonSlug = params.lessonSlug as string;

    const [courseData, setCourseData] = useState<Course | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasAccess, setHasAccess] = useState<boolean | null>(null);
    const [progressData, setProgressData] = useState<CourseProgress | null>(null);
    const [isFetchingProgress, setIsFetchingProgress] = useState(true);

    const apiClient = new CoursesApiClient();

    const currentLesson = useMemo(() => {
        return courseData?.lessons.find((lesson) => lesson.slug === lessonSlug) ?? null;
    }, [courseData, lessonSlug]);

    const updateCourseProgressState = (newProgress: CourseProgress) => {
        setProgressData(newProgress);
    };

    useEffect(() => {
        const checkAccessAndFetchData = async () => {
            setIsLoading(true);
            setIsFetchingProgress(true);
            setHasAccess(null);

            if (!courseSlug) {
                console.error('Course slug is missing');
                toast.error('Не удалось загрузить курс: отсутствует идентификатор.');
                setIsLoading(false);
                return;
            }

            let courseId = '';
            let accessGranted = false;

            try {
                const courseInfo = await apiClient.getCourseBySlug(courseSlug);
                if (!courseInfo) {
                    toast.error('Курс не найден.');
                    router.push('/courses');
                    setIsLoading(false);
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
                    console.error('Access check failed:', accessResult.reason);
                    setHasAccess(false);
                    toast.error('Ошибка проверки доступа.');
                    router.push(`/sign-in?from=/courses/${courseSlug}/learn/${lessonSlug}`);
                    setIsLoading(false);
                    setIsFetchingProgress(false);
                    return;
                }

                if (progressResult.status === 'fulfilled') {
                    setProgressData(progressResult.value);
                } else {
                    console.error('Failed to fetch progress:', progressResult.reason);

                    toast.warning('Не удалось загрузить ваш прогресс по курсу.');
                    setProgressData(null);
                }
                setIsFetchingProgress(false);

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
                        toast.error('Необходимо войти или приобрести курс для доступа.');

                        router.push(`/sign-in?from=/courses/${courseSlug}/learn/${lessonSlug}`);
                    } else {
                        toast.error('Произошла ошибка при загрузке данных.');
                    }
                } else if (error instanceof Error) {
                    errorMsg = error.message;
                }

                setHasAccess(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAccessAndFetchData();
    }, [courseSlug]);

    const completedLessonCount = useMemo(() => progressData?.completedLessons?.length ?? 0, [progressData]);
    const totalLessons = useMemo(() => courseData?.lessons?.length ?? 0, [courseData]);
    const courseProgressPercentage = useMemo(() => {
        if (isFetchingProgress || totalLessons === 0) return 0;
        return progressData?.progress ?? 0;
    }, [progressData, totalLessons, isFetchingProgress]);

    const showLoader = isLoading;

    if (showLoader) {
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
            <CourseLearnProvider course={courseData} currentLesson={currentLesson} initialProgress={progressData}>
                <div className="flex flex-col h-screen">
                    <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-card sticky top-[var(--header-height)] z-40">
                        <div className="flex items-center gap-4 overflow-hidden">
                            <Link
                                href={`/courses/${courseSlug}`}
                                className="text-sm font-medium hover:underline text-primary shrink-0"
                            >
                                <ChevronLeft className="inline-block h-4 w-4 mr-1 align-middle" />
                                {courseData.title}
                            </Link>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                            {isFetchingProgress ? (
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
                        <LessonSidebar
                            course={courseData}
                            currentLessonSlug={lessonSlug}
                            completedLessons={progressData?.completedLessons ?? []}
                        />
                        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-background">{children}</main>
                    </div>
                </div>
            </CourseLearnProvider>
        </ProtectedRoute>
    );
}
