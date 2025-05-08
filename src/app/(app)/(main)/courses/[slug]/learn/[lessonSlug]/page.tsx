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

    const { user } = useUserStore((state) => state);
    const [isLessonMarkedCompleted, setIsLessonMarkedCompleted] = useState(false);
    const [isCompletePending, startCompleteTransition] = useTransition();
    const router = useRouter();
    const params = useParams();
    const courseSlug = params.slug as string;
    const lessonSlug = params.lessonSlug as string;

    const currentLesson = useMemo(() => {
        return course?.lessons.find((lesson) => lesson.slug === lessonSlug) ?? null;
    }, [course, lessonSlug]);

    const apiClient = new CoursesApiClient();

    const lessonKey = useMemo(() => {
        if (!user?.id || !course?.id || !currentLesson?.id) return null;
        return `lesson_${user.id}_${course.id}_${currentLesson.id}`;
    }, [user?.id, course?.id, currentLesson?.id]);

    const { currentLessonTasks, initializeLesson, clearLessonState } = useLessonTasksStore((state) => {
        const tasks = lessonKey ? state.lessons[lessonKey]?.tasks : undefined;
        return {
            currentLessonTasks: tasks,
            initializeLesson: state.initializeLesson,
            clearLessonState: state.clearLessonState,
        };
    }, shallow);

    useEffect(() => {
        if (lessonKey && currentLesson?.tasks && !currentLessonTasks) {
            initializeLesson(lessonKey, currentLesson.tasks);
        }

        if (currentLesson && courseProgress) {
            setIsLessonMarkedCompleted(courseProgress.completedLessons?.includes(currentLesson.id) ?? false);
        } else {
            setIsLessonMarkedCompleted(false);
        }
    }, [lessonKey, currentLesson, courseProgress, initializeLesson, currentLessonTasks]);

    useEffect(() => {
        if (currentLesson && courseProgress) {
            setIsLessonMarkedCompleted(courseProgress.completedLessons?.includes(currentLesson.id) ?? false);
        } else {
            setIsLessonMarkedCompleted(false);
        }
    }, [currentLesson, courseProgress]);

    useEffect(() => {
        if (currentLesson) {
            document.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block as HTMLElement);
            });
        }
    }, [currentLesson]);

    const allTasksCompleted = useMemo(() => {
        if (!currentLessonTasks || Object.keys(currentLessonTasks).length === 0) {
            return !currentLesson?.tasks || currentLesson.tasks.length === 0;
        }

        return Object.values(currentLessonTasks).every((task) => task.checkStatus === true);
    }, [currentLessonTasks, currentLesson?.tasks]);

    const parseCodeBlock = (codeBlock: string): { language: string | null; code: string } => {
        const match = codeBlock.match(/^```(\w*)\n([\s\S]*?)\n```$/);
        if (match) {
            const language = match[1] || null;
            const code = match[2];
            return { language: language ? language.toLowerCase() : null, code };
        }

        return { language: null, code: codeBlock };
    };

    const handleCompleteLesson = () => {
        if (!course || !currentLesson || isLessonMarkedCompleted || !allTasksCompleted) return;

        startCompleteTransition(async () => {
            try {
                const updatedProgressData = await apiClient.markLessonAsComplete(course.id, currentLesson.id);
                if (updatedProgressData) {
                    setIsLessonMarkedCompleted(true);
                    updateCourseProgress(updatedProgressData);
                    toast.success(`Урок "${currentLesson.title}" отмечен как пройденный!`);

                    if (lessonKey) {
                        clearLessonState(lessonKey);
                    } else {
                        console.warn('Could not clear lesson state: lessonKey is null');
                    }

                    const currentIndex = course.lessons.findIndex((lesson) => lesson.id === currentLesson.id);
                    const nextLesson = course.lessons[currentIndex + 1];

                    if (nextLesson) {
                        const nextLessonUrl = `/courses/${courseSlug}/learn/${nextLesson.slug}`;

                        setTimeout(() => {
                            router.push(nextLessonUrl);
                        }, 800);
                    }
                } else {
                    toast.error('Не удалось обновить прогресс.');
                }
            } catch (error: unknown) {
                console.error('Ошибка при отметке урока:', error);

                let errorMsg = 'Не удалось отметить урок как пройденный.';

                if (isAxiosError(error)) {
                    errorMsg =
                        error?.response?.data?.message || error.message || 'Не удалось отметить урок как пройденный.';
                } else if (error instanceof Error) {
                    errorMsg = error.message;
                }

                toast.error(errorMsg);
            }
        });
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
                    disabled={isLessonMarkedCompleted || isCompletePending || !allTasksCompleted}
                    size="sm"
                    variant={isLessonMarkedCompleted ? 'secondary' : 'default'}
                >
                    {isLessonMarkedCompleted ? 'Урок пройден' : 'Отметить и продолжить'}
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
                                className="not-prose bg-[#282c34] rounded-md p-4 overflow-x-auto mb-4"
                            >
                                <code className={cn(langClass, 'text-sm')}>{code}</code>
                            </pre>
                        );
                    })}
                </>
            )}

            {currentLesson.tasks && currentLesson.tasks.length > 0 && (
                <>
                    <h2 className="not-prose text-xl font-semibold mt-6 mb-3">Задачи</h2>
                    {currentLesson.tasks.map((task, index) => (
                        <TaskDisplay key={task.id || index} task={task} index={index} lessonKey={lessonKey} />
                    ))}
                </>
            )}

            {currentLesson.attachments && currentLesson.attachments.length > 0 && (
                <>
                    <h2 className="not-prose text-xl font-semibold mt-6 mb-3">Вложения</h2>
                    <div className="not-prose flex flex-wrap gap-3">
                        {currentLesson.attachments.map((att, index) => (
                            <AttachmentLink key={att.url || index} attachment={att} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
