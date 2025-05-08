'use client';

import { CheckCircle2, ChevronLeft } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { useCourseLearnContext } from '@/contexts/course-learn-context';
import { cn } from '@/lib/utils';
import { Course } from '@/types';

interface LessonSidebarProps {
    course: Course;
    isCourseCompleted: boolean;
}

const LessonSidebar = ({ course, isCourseCompleted }: LessonSidebarProps) => {
    const pathname = usePathname();
    const { courseProgress } = useCourseLearnContext();
    const completedLessons = courseProgress?.completedLessons ?? [];

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

            {isCourseCompleted && (
                <div className="px-2 py-1 mb-2 text-xs font-medium text-success bg-success/10 rounded flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Курс пройден
                </div>
            )}

            <nav className="flex flex-col gap-1">
                {course.lessons.length > 0 &&
                    course.lessons.map((lesson) => {
                        const isCompleted = completedLessons.includes(lesson.id);

                        const lessonPath = `/courses/${course.slug}/learn/${lesson.slug}`;

                        let isActive = false;
                        try {
                            isActive = decodeURIComponent(pathname) === lessonPath;
                        } catch (e) {
                            console.error('Failed to decode pathname:', pathname, e);

                            isActive = pathname === lessonPath;
                        }

                        return (
                            <Link
                                key={`${lesson.slug}-${uuidv4()}`}
                                href={lessonPath}
                                className={cn(
                                    'text-sm p-2 rounded-md hover:bg-muted flex items-center justify-between gap-2 group',
                                    isActive
                                        ? 'bg-muted/40 text-primary font-semibold'
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

export default LessonSidebar;
