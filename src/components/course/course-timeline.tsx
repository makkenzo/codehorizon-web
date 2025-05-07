'use client';

import { useEffect, useMemo, useState } from 'react';

import {
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    ChevronUp,
    Clock,
    FileText,
    Lock,
    PlayCircle,
    Video,
} from 'lucide-react';
import { toast } from 'sonner';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { cn, formatDuration } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import CoursesApiClient from '@/server/courses';
import { useUserStore } from '@/stores/user/user-store-provider';
import { Course, Lesson, UserSpecificCourseProgressDetails } from '@/types';

import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Skeleton } from '../ui/skeleton';

const UNLOCKED_INITIALLY = 3;

export interface TimelineModule {
    id: string;
    title: string;
    slug?: string;
    duration: string;
    lessons: number;
    isCompleted: boolean;
    isLocked: boolean;
}

interface CourseTimelineProps {
    courseTitle?: string;
    courseSlug: string;
    courseFromServer: Omit<Course, 'lessons' | 'authorId'> & {
        lessons: Pick<Lesson, 'title' | 'slug' | 'id' | 'videoLength'>[];
        authorUsername: string;
        authorName: string;
    };
}

const CourseTimeline = ({
    courseTitle = 'Загрузка названия...',
    courseSlug,
    courseFromServer,
}: CourseTimelineProps) => {
    const router = useRouter();
    const { user } = useUserStore((state) => state);
    const { isAuthenticated, isPending: isAuthPending } = useAuth();

    const [showAllModules, setShowAllModules] = useState(false);
    const [hasAccess, setHasAccess] = useState<boolean | null>(null);
    const [isLoadingClientData, setIsLoadingClientData] = useState(true);
    const [progressData, setProgressData] = useState<UserSpecificCourseProgressDetails | null>(null);

    const modules: TimelineModule[] = useMemo(() => {
        return courseFromServer.lessons.map((lesson, index) => {
            const isLockedForPreview = !hasAccess && index >= UNLOCKED_INITIALLY;
            const isCompleted = progressData?.completedLessons?.includes(lesson.id) ?? false;

            return {
                id: lesson.id,
                title: lesson.title,
                slug: lesson.slug,
                duration: lesson.videoLength ? formatDuration(lesson.videoLength) : 'N/A',
                lessons: 1,
                isCompleted: isCompleted,
                isLocked: isLockedForPreview,
            };
        });
    }, [courseFromServer.lessons, hasAccess, progressData]);

    const unlockedModulesCount = useMemo(() => {
        return Math.min(UNLOCKED_INITIALLY, courseFromServer.lessons.length);
    }, [hasAccess, courseFromServer.lessons.length]);

    const totalLessons = modules.reduce((total, module) => total + module.lessons, 0);
    const initialDisplayLimit = useMemo(() => {
        if (hasAccess === null) {
            return Math.min(UNLOCKED_INITIALLY, courseFromServer.lessons.length);
        }
        return hasAccess ? Math.max(6, unlockedModulesCount) : unlockedModulesCount;
    }, [hasAccess, unlockedModulesCount, courseFromServer.lessons.length]);

    const canToggleExpansion = modules.length > initialDisplayLimit;
    const displayedModules = showAllModules ? modules : modules.slice(0, initialDisplayLimit);

    const coursesApiClient = new CoursesApiClient();

    useEffect(() => {
        const fetchClientSpecificData = async () => {
            if (isAuthPending) return;

            setIsLoadingClientData(true);
            if (!isAuthenticated || !user) {
                setHasAccess(false);
                setIsLoadingClientData(false);
                return;
            }

            try {
                const [accessRes, progressRes] = await Promise.all([
                    coursesApiClient.checkCourseAccess(courseFromServer.id).catch(() => false),
                    coursesApiClient.getUserCourseProgress(courseFromServer.id).catch(() => null),
                ]);
                setHasAccess(accessRes);
                setProgressData(progressRes);
            } catch (error) {
                console.error('Error fetching client-specific course data:', error);
                setHasAccess(false);
                toast.error('Не удалось загрузить данные о вашем доступе и прогрессе.');
            } finally {
                setIsLoadingClientData(false);
            }
        };

        fetchClientSpecificData();
    }, [isAuthenticated]);

    const onPurchase = () => {
        if (hasAccess) {
            const firstLessonSlug = courseFromServer.lessons?.[0]?.slug;
            if (firstLessonSlug) {
                router.push(`/courses/${courseFromServer.slug}/learn/${firstLessonSlug}`);
            } else {
                toast.error('В этом курсе пока нет уроков.');
            }
        } else {
            const buyButton = document.getElementById('course-buttons-buy-main-action');
            if (buyButton) {
                buyButton.click();
            } else {
                toast.error('Ошибка: Кнопка покупки не найдена.');
            }
        }
    };

    const getModuleIcon = (module: TimelineModule, canAccessModule: boolean) => {
        if (module.duration && module.duration !== 'N/A' && parseFloat(module.duration) > 0) {
            return (
                <Video
                    className={cn(
                        'h-4 w-4 text-muted-foreground transition-colors shrink-0',
                        canAccessModule && 'group-hover:text-primary'
                    )}
                />
            );
        }
        return (
            <FileText
                className={cn(
                    'h-4 w-4 text-muted-foreground transition-colors shrink-0',
                    canAccessModule && 'group-hover:text-primary'
                )}
            />
        );
    };

    if (isLoadingClientData && modules.length === 0) {
        return (
            <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-sm animate-pulse">
                <div className="mb-6">
                    <Skeleton className="h-7 w-3/4 mb-2" />
                    <div className="mt-2 flex items-center gap-2">
                        <Skeleton className="h-2 w-full" />
                        <Skeleton className="h-4 w-10" />
                    </div>
                </div>
                <div className="mb-4 flex items-center justify-between">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-5 w-1/4" />
                </div>
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={`skel-module-${i}`} className="relative pl-10">
                            <Skeleton className="absolute left-4 top-1.5 z-10 h-5 w-5 -translate-x-1/2 rounded-full" />
                            <Skeleton className="h-20 w-full rounded-lg" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full rounded-lg border bg-card p-4 md:p-6 shadow-sm">
            <div className="mb-4 md:mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-foreground">{courseTitle}</h2>
                {hasAccess && (progressData?.progress ?? 0) > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                        <Progress value={progressData?.progress ?? 0} className="h-2 w-full" />
                        <span className="text-xs md:text-sm font-medium text-muted-foreground">
                            {(progressData?.progress ?? 0).toFixed(0)}%
                        </span>
                    </div>
                )}
            </div>

            <div className="mb-3 md:mb-4 flex items-center justify-between">
                <h3 className="text-base md:text-lg font-semibold text-foreground">Содержание курса</h3>
                <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                    <span>
                        {totalLessons}{' '}
                        {totalLessons === 1 ? 'урок' : totalLessons > 1 && totalLessons < 5 ? 'урока' : 'уроков'}
                    </span>
                </div>
            </div>

            <div className="relative mb-4 md:mb-6">
                {displayedModules.length > 0 && <div className="absolute left-4 top-0 h-full w-0.5 bg-gray-200"></div>}

                <div className="space-y-3 md:space-y-4">
                    {displayedModules.map((module, index) => {
                        const canAccessModule = hasAccess || index < unlockedModulesCount;

                        const isLink = !module.isLocked && module.slug;
                        const modulePath = `/courses/${courseSlug}/learn/${module.slug}`;

                        const innerDivContent = (
                            <div
                                className={cn(
                                    'rounded-md border p-3 md:p-4 transition-all',
                                    !module.isLocked
                                        ? 'group-hover:border-primary/50 group-hover:bg-primary/5'
                                        : 'border-muted-foreground/20 bg-muted/50 cursor-not-allowed',
                                    module.isCompleted && !module.isLocked && 'border-primary/30 bg-primary/5'
                                )}
                            >
                                <div className="flex items-start justify-between gap-2 md:gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            {getModuleIcon(module, canAccessModule)}
                                            <h4
                                                className={cn(
                                                    'font-medium text-sm md:text-base truncate',
                                                    module.isLocked
                                                        ? 'text-muted-foreground'
                                                        : 'text-foreground group-hover:text-primary'
                                                )}
                                                title={module.title}
                                            >
                                                {module.title}
                                            </h4>
                                        </div>
                                        {!module.isLocked && (
                                            <div className="flex items-center gap-2 md:gap-3 text-xs text-muted-foreground">
                                                <div className="flex items-center group-hover:text-primary">
                                                    <Clock className="mr-1 h-3.5 w-3.5" />
                                                    {module.duration}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {module.isCompleted && !module.isLocked && (
                                        <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
                                    )}
                                    {module.isLocked && (
                                        <Lock size={16} className="text-muted-foreground flex-shrink-0" />
                                    )}
                                    {!module.isCompleted && !module.isLocked && module.slug && (
                                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 opacity-50 group-hover:opacity-100" />
                                    )}
                                </div>
                                {module.isLocked && !hasAccess && (
                                    <div className="mt-2 flex items-center justify-between border-t border-dashed pt-2">
                                        <p className="text-xs text-muted-foreground">Модуль заблокирован</p>
                                        <Button
                                            variant="link"
                                            size="sm"
                                            className="h-auto p-0 text-primary text-xs"
                                            onClick={onPurchase}
                                        >
                                            Купить для разблокировки
                                        </Button>
                                    </div>
                                )}
                            </div>
                        );

                        return (
                            <div key={module.id} className="relative pl-10 group">
                                <div
                                    className={cn(
                                        'absolute left-4 top-1.5 -translate-x-1/2 z-10 h-5 w-5 rounded-full border-2 flex items-center justify-center',
                                        module.isCompleted
                                            ? 'border-primary bg-primary'
                                            : module.isLocked
                                              ? 'border-muted-foreground/30 bg-muted'
                                              : 'border-primary bg-background'
                                    )}
                                >
                                    {module.isCompleted && (
                                        <CheckCircle2 size={14} className="text-primary-foreground" />
                                    )}
                                    {module.isLocked && <Lock size={10} className="text-muted-foreground" />}
                                    {!module.isCompleted && !module.isLocked && (
                                        <PlayCircle
                                            size={14}
                                            className="text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                                        />
                                    )}
                                </div>

                                {isLink ? (
                                    <Link href={modulePath} className={cn(!module.isLocked && 'cursor-pointer')}>
                                        {innerDivContent}
                                    </Link>
                                ) : (
                                    innerDivContent
                                )}
                            </div>
                        );
                    })}

                    {canToggleExpansion && (
                        <div className="relative pl-10 mt-3 md:mt-4">
                            <div
                                className={cn(
                                    'absolute left-4 top-1.5 -translate-x-1/2 z-10 h-5 w-5 rounded-full border-2 border-muted-foreground/30 bg-muted'
                                )}
                            />
                            <Button
                                variant="outline"
                                className="w-full border-dashed text-muted-foreground hover:bg-primary/10 hover:text-foreground hover:border-primary/50"
                                onClick={() => setShowAllModules(!showAllModules)}
                                size="sm"
                            >
                                {showAllModules ? (
                                    <>
                                        <ChevronUp className="mr-1 h-4 w-4" /> Свернуть
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="mr-1 h-4 w-4" /> Показать еще{' '}
                                        {modules.length - initialDisplayLimit}
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                    {modules.length === 0 && !isLoadingClientData && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            Содержание курса скоро появится.
                        </p>
                    )}
                </div>
            </div>

            {!hasAccess && modules.some((m) => m.isLocked) && (
                <div className="mt-6 rounded-lg bg-primary/10 p-4">
                    <div className="flex flex-col items-start justify-between gap-3 md:gap-4 sm:flex-row sm:items-center">
                        <div>
                            <h4 className="font-semibold text-foreground">Разблокируйте полный курс</h4>
                            <p className="text-sm text-muted-foreground">
                                Получите доступ ко всем {modules.length} урокам.
                            </p>
                        </div>
                        <Button
                            className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto"
                            onClick={onPurchase}
                        >
                            Купить курс
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseTimeline;
