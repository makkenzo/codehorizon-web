'use client';

import { ReactNode, useEffect, useMemo, useState, useTransition } from 'react';

import { isAxiosError } from 'axios';
import hljs from 'highlight.js';
import bash from 'highlight.js/lib/languages/bash';
import css from 'highlight.js/lib/languages/css';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import plaintext from 'highlight.js/lib/languages/plaintext';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import Player from 'next-video/player';
import 'player.style/minimal';
import MediaThemeMinimal from 'player.style/minimal/react';
import { toast } from 'sonner';
import { shallow } from 'zustand/shallow';

import { useParams, useRouter } from 'next/navigation';

import AttachmentLink from '@/components/course/attachment-link';
import TaskDisplay from '@/components/course/task-display';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCourseLearnContext } from '@/contexts/course-learn-context';
import { cn } from '@/lib/utils';
import AuthApiClient from '@/server/auth';
import CoursesApiClient from '@/server/courses';
import { useLessonTasksStore } from '@/stores/tasks/tasks-store-provider';
import { useUserStore } from '@/stores/user/user-store-provider';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('css', css);
hljs.registerLanguage('json', json);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('plaintext', plaintext);

export default function LessonPage() {
    const { course, courseProgress, updateCourseProgress } = useCourseLearnContext();
    const { user, setUser } = useUserStore((state) => state);

    const [isLessonMarkedCompletedByStudent, setIsLessonMarkedCompletedByStudent] = useState(false);
    const [isCompletePending, startCompleteTransition] = useTransition();
    const router = useRouter();
    const params = useParams();
    const courseSlug = params.slug as string;
    const lessonSlugFromParams = params.lessonSlug as string;

    const currentLesson = useMemo(() => {
        return (
            course?.lessons.find(
                (lesson) => decodeURIComponent(lesson.slug.trim()) === decodeURIComponent(lessonSlugFromParams.trim())
            ) ?? null
        );
    }, [course, lessonSlugFromParams]);

    const apiClient = new CoursesApiClient();

    const lessonKeyForStore = useMemo(() => {
        if (!user?.id || !course?.id || !currentLesson?.id) return null;
        return `lesson_${user.id}_${course.id}_${currentLesson.id}`;
    }, [user?.id, course?.id, currentLesson?.id]);

    const { initializeLesson, getAllTasksCompleted, clearLessonSubmissions, submissions } = useLessonTasksStore(
        (state) => ({
            initializeLesson: state.initializeLesson,
            getAllTasksCompleted: state.getAllTasksCompleted,
            clearLessonSubmissions: state.clearLessonSubmissions,
            submissions: state.submissions,
        })
    );

    useEffect(() => {
        if (lessonKeyForStore && currentLesson?.tasks && currentLesson.tasks.length > 0) {
            const existingSubmissions = Object.keys(submissions).some((key) =>
                key.startsWith(lessonKeyForStore + '_task_')
            );
            if (!existingSubmissions) {
                initializeLesson(lessonKeyForStore, currentLesson.tasks);
            }
        }
    }, [lessonKeyForStore, currentLesson, initializeLesson]);

    useEffect(() => {
        if (currentLesson && courseProgress) {
            setIsLessonMarkedCompletedByStudent(courseProgress.completedLessons?.includes(currentLesson.id) ?? false);
        } else {
            setIsLessonMarkedCompletedByStudent(false);
        }
    }, [currentLesson, courseProgress]);

    useEffect(() => {
        if (currentLesson?.content) {
            document.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block as HTMLElement);
            });
        }
    }, [currentLesson?.content]);

    const allTasksMarkedAsCorrectInStore = useMemo(() => {
        if (!lessonKeyForStore || !currentLesson?.tasks || currentLesson.tasks.length === 0) {
            return true;
        }
        return getAllTasksCompleted(lessonKeyForStore);
    }, [lessonKeyForStore, currentLesson?.tasks, getAllTasksCompleted]);

    const handleCompleteLesson = () => {
        if (!course || !currentLesson || isLessonMarkedCompletedByStudent || !allTasksMarkedAsCorrectInStore) return;

        startCompleteTransition(async () => {
            try {
                const updatedProgressData = await apiClient.markLessonAsComplete(course.id, currentLesson.id);
                if (updatedProgressData) {
                    setIsLessonMarkedCompletedByStudent(true);
                    updateCourseProgress(updatedProgressData);

                    const freshUserData = await new AuthApiClient().getMe();
                    if (freshUserData) {
                        setUser(freshUserData);
                    }

                    toast.success(`Урок "${currentLesson.title}" отмечен как пройденный!`);

                    if (lessonKeyForStore) {
                        clearLessonSubmissions(lessonKeyForStore);
                    }

                    const currentIndex = course.lessons.findIndex((lesson) => lesson.id === currentLesson.id);
                    const nextLesson = course.lessons[currentIndex + 1];

                    if (nextLesson?.slug) {
                        const nextLessonUrl = `/courses/${courseSlug}/learn/${nextLesson.slug}`;
                        setTimeout(() => {
                            router.push(nextLessonUrl);
                        }, 800);
                    } else {
                        toast.info('Это был последний урок в курсе!');
                    }
                } else {
                    toast.error('Не удалось обновить прогресс.');
                }
            } catch (error: unknown) {
                console.error('Ошибка при отметке урока:', error);
                let errorMsg = 'Не удалось отметить урок как пройденный.';
                if (isAxiosError(error)) {
                    errorMsg = error?.response?.data?.message || error.message || errorMsg;
                } else if (error instanceof Error) {
                    errorMsg = error.message;
                }
                toast.error(errorMsg);
            }
        });
    };

    const parseCodeBlock = (codeBlock: string): { language: string | null; code: string } => {
        const match = codeBlock.match(/^```(\w*)\n([\s\S]*?)\n```$/);
        if (match) {
            const language = match[1] || null;
            const code = match[2];
            return { language: language ? language.toLowerCase() : null, code };
        }
        return { language: null, code: codeBlock };
    };

    if (!currentLesson) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
        );
    }

    return (
        <div className="prose dark:prose-invert max-w-none relative">
            <div className="absolute top-0 right-0 not-prose">
                <Button
                    onClick={handleCompleteLesson}
                    disabled={isLessonMarkedCompletedByStudent || isCompletePending || !allTasksMarkedAsCorrectInStore}
                    size="sm"
                    variant={isLessonMarkedCompletedByStudent ? 'secondary' : 'default'}
                >
                    {isLessonMarkedCompletedByStudent ? 'Урок пройден' : 'Отметить и продолжить'}
                </Button>
            </div>

            <h1>{currentLesson.title}</h1>

            {currentLesson.content && <div dangerouslySetInnerHTML={{ __html: currentLesson.content }} />}

            {currentLesson.mainAttachment && (
                <>
                    <div className="not-prose my-4">
                        {((): ReactNode => {
                            const url = currentLesson.mainAttachment!;
                            const extension = url.split('.').pop()?.toLocaleLowerCase();

                            if (['mp4', 'webm', 'mov', 'ogg'].includes(extension || '')) {
                                return (
                                    <div className="aspect-video mx-auto rounded-lg overflow-hidden shadow-md">
                                        <Player
                                            src={url}
                                            theme={MediaThemeMinimal}
                                            style={{
                                                '--media-secondary-color': '#3eccb2',
                                                '--media-primary-color': '#faf2f0',
                                            }}
                                        />
                                    </div>
                                );
                            }

                            if (['mp3', 'wav', 'ogg'].includes(extension || '')) {
                                return (
                                    <audio controls src={url} className="w-full">
                                        Ваш браузер не поддерживает аудио элемент.
                                        <a href={url}>Скачать аудио</a>
                                    </audio>
                                );
                            }

                            if (extension === 'pdf') {
                                return (
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-2">
                                            Предпросмотр PDF (может не работать в некоторых браузерах):
                                        </p>
                                        {/* <iframe
                                            src={url}
                                            width="100%"
                                            height="500px"
                                            className="border rounded-md"
                                        ></iframe> */}
                                        <AttachmentLink attachment={{ name: `Просмотреть/Скачать PDF`, url: url }} />
                                    </div>
                                );
                            }

                            if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(extension || '')) {
                                return (
                                    <img
                                        src={url}
                                        alt="Основной материал урока"
                                        className="max-w-full h-auto rounded-md shadow-md"
                                    />
                                );
                            }

                            return <AttachmentLink attachment={{ name: `Скачать основной материал`, url: url }} />;
                        })()}
                    </div>
                </>
            )}

            {currentLesson.codeExamples && currentLesson.codeExamples.length > 0 && (
                <>
                    <h2 className="not-prose text-xl font-semibold mt-6 mb-3">Примеры кода</h2>
                    {currentLesson.codeExamples.map((codeBlock, index) => {
                        const { language, code } = parseCodeBlock(codeBlock);
                        const langClass = language ? `language-${language}` : 'language-plaintext';

                        return (
                            <pre
                                key={`code-${index}`}
                                className="not-prose bg-[#282c34] text-white rounded-md p-4 overflow-x-auto mb-4"
                            >
                                <code className={cn(langClass, 'text-sm')}>{code}</code>
                            </pre>
                        );
                    })}
                </>
            )}

            {currentLesson.tasks && course?.id && currentLesson.tasks.length > 0 && (
                <>
                    <h2 className="not-prose text-xl font-semibold mt-6 mb-3">Задачи</h2>
                    {currentLesson.tasks.map((task, index) => (
                        <TaskDisplay
                            key={`${task.id}-${index}`}
                            task={task}
                            index={index}
                            lessonKey={lessonKeyForStore}
                            courseId={course?.id}
                            lessonId={currentLesson.id}
                        />
                    ))}
                </>
            )}

            {currentLesson.attachments && currentLesson.attachments.length > 0 && (
                <>
                    <h2 className="not-prose text-xl font-semibold mt-6 mb-3">Вложения</h2>
                    <div className="not-prose flex flex-wrap gap-3">
                        {currentLesson.attachments.map((att, index) => (
                            <AttachmentLink key={`${att.url}-${Date.now()}`} attachment={att} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
