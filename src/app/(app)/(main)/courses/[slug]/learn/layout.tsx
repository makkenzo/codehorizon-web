'use client';

import { useEffect, useState } from 'react';

import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { CourseLearnProvider } from '@/contexts/course-learn-context';
import { cn } from '@/lib/utils';
import { ProtectedRoute } from '@/providers/protected-route';
import CoursesApiClient from '@/server/courses';
import { Course, CourseProgress } from '@/types';

const LessonSidebar = ({ course, currentLessonSlug }: { course: Course; currentLessonSlug: string }) => {
    return (
        <aside className="w-64 h-full border-r border-border p-4 overflow-y-auto shrink-0 md:block hidden">
            <h2 className="text-lg font-semibold mb-4">{course.title}</h2>
            <nav className="flex flex-col gap-2">
                {course.lessons.map((lesson) => (
                    <Link
                        key={lesson.slug}
                        href={`/courses/${course.slug}/learn/${lesson.slug}`}
                        className={cn(
                            'text-sm p-2 rounded-md hover:bg-muted',
                            currentLessonSlug === lesson.slug
                                ? 'bg-muted font-medium text-primary'
                                : 'text-muted-foreground'
                        )}
                    >
                        {lesson.title}
                    </Link>
                ))}
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
            } catch (error: any) {
                console.error('Error checking access or fetching course data:', error);
                if (error.response?.status === 401 || error.response?.status === 403) {
                    toast.error('Необходимо войти или приобрести курс для доступа.');

                    router.push(`/sign-in?from=/courses/${courseSlug}/learn/${lessonSlug}`);
                } else {
                    toast.error('Произошла ошибка при загрузке данных.');
                }
                setHasAccess(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAccessAndFetchData();
    }, [courseSlug, lessonSlug]);

    const showLoader = isLoading || isFetchingProgress || hasAccess === null;

    if (showLoader) {
        return (
            <div className="flex h-[calc(100vh-var(--header-height))] w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!hasAccess || !courseData) {
        return (
            <div className="flex flex-col h-[calc(100vh-var(--header-height))] w-full items-center justify-center gap-4 p-4 text-center">
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

    const currentLesson = courseData?.lessons.find((lesson) => lesson.slug === lessonSlug) ?? null;

    return (
        <ProtectedRoute>
            <div className="flex h-[calc(100vh-var(--header-height))]">
                <LessonSidebar course={courseData} currentLessonSlug={lessonSlug} />
                <CourseLearnProvider course={courseData} currentLesson={currentLesson} initialProgress={progressData}>
                    <main className="flex-1 overflow-y-auto p-6 bg-background">{children}</main>
                </CourseLearnProvider>
            </div>
        </ProtectedRoute>
    );
}
