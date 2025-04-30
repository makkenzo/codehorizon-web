'use client';

import { ReactNode, useEffect, useState, useTransition } from 'react';

import hljs from 'highlight.js';
import bash from 'highlight.js/lib/languages/bash';
import css from 'highlight.js/lib/languages/css';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import plaintext from 'highlight.js/lib/languages/plaintext';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import { CheckCircle2, Loader2 } from 'lucide-react';
import Player from 'next-video/player';
import 'player.style/minimal';
import MediaThemeMinimal from 'player.style/minimal/react';
import { toast } from 'sonner';

import { useParams, useRouter } from 'next/navigation';

import AttachmentLink from '@/components/course/attachment-link';
import TaskDisplay from '@/components/course/task-display';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCourseLearnContext } from '@/contexts/course-learn-context';
import { cn } from '@/lib/utils';
import CoursesApiClient from '@/server/courses';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('css', css);
hljs.registerLanguage('json', json);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('plaintext', plaintext);

export default function LessonPage() {
    const { currentLesson, course, courseProgress, updateCourseProgress } = useCourseLearnContext();
    const [isCompleted, setIsCompleted] = useState(false);
    const [isCompletePending, startCompleteTransition] = useTransition();
    const router = useRouter();
    const params = useParams();
    const courseSlug = params.slug as string;

    const apiClient = new CoursesApiClient();

    useEffect(() => {
        if (currentLesson && courseProgress) {
            setIsCompleted(courseProgress.completedLessons?.includes(currentLesson.id) ?? false);
        } else {
            setIsCompleted(false);
        }
    }, [currentLesson, courseProgress]);

    useEffect(() => {
        if (currentLesson) {
            document.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block as HTMLElement);
            });
        }
    }, [currentLesson]);

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
        if (!course || !currentLesson || isCompleted) return;

        startCompleteTransition(async () => {
            try {
                const updatedProgressData = await apiClient.markLessonAsComplete(course.id, currentLesson.id);
                if (updatedProgressData) {
                    setIsCompleted(true);
                    updateCourseProgress(updatedProgressData);
                    toast.success(`Урок "${currentLesson.title}" отмечен как пройденный!`);

                    const currentIndex = course.lessons.findIndex((lesson) => lesson.id === currentLesson.id);
                    const nextLesson = course.lessons[currentIndex + 1];

                    if (nextLesson) {
                        const nextLessonUrl = `/courses/${courseSlug}/learn/${nextLesson.slug}`;

                        setTimeout(() => {
                            router.push(nextLessonUrl);
                        }, 800);
                    } else {
                        toast.info('🎉 Поздравляем! Вы завершили курс!');
                    }
                } else {
                    toast.error('Не удалось обновить прогресс.');
                }
            } catch (error: any) {
                console.error('Ошибка при отметке урока:', error);
                const errorMsg = error?.response?.data?.message || 'Не удалось отметить урок как пройденный.';
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

    const currentProgressPercent = courseProgress?.progress ?? 0;

    const attachmentUrl = currentLesson?.mainAttachment?.trim();
    const videoMatchResult = attachmentUrl ? attachmentUrl.match(/\.(mp4|webm|ogg)$/i) : null;
    const isVideo = !!videoMatchResult;

    return (
        <div className="prose dark:prose-invert max-w-none relative">
            <div className="absolute top-0 right-0 not-prose">
                <Button
                    onClick={handleCompleteLesson}
                    disabled={isCompleted || isCompletePending}
                    size="sm"
                    variant={isCompleted ? 'secondary' : 'default'}
                >
                    {isCompletePending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : isCompleted ? (
                        <CheckCircle2 className="mr-2 h-4 w-4 text-success" />
                    ) : null}
                    {isCompleted ? 'Урок пройден' : 'Отметить и продолжить'}
                </Button>
            </div>

            <h1>{currentLesson.title}</h1>

            {currentLesson.content && <div dangerouslySetInnerHTML={{ __html: currentLesson.content }} />}

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
                        <TaskDisplay key={task.id || index} task={task} index={index} />
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

            {currentLesson.mainAttachment && (
                <>
                    <h2 className="not-prose text-xl font-semibold mt-6 mb-3">Основной материал урока</h2>
                    <div className="not-prose my-4">
                        {((): ReactNode => {
                            const url = currentLesson.mainAttachment!;
                            const extension = url.split('.').pop()?.toLocaleLowerCase();

                            if (['mp4', 'webm', 'mov', 'ogg'].includes(extension || '')) {
                                return (
                                    <div className="aspect-video max-w-3xl mx-auto rounded-lg overflow-hidden shadow-md">
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
                                        {/* <iframe src={url} width="100%" height="500px" className="border rounded-md"></iframe> */}
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
        </div>
    );
}
