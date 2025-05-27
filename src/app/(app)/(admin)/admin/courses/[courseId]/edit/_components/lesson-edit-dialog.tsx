'use client';

import React, { useEffect, useState } from 'react';

import { css } from '@codemirror/lang-css';
import { html } from '@codemirror/lang-html';
import { javascript } from '@codemirror/lang-javascript';
import { zodResolver } from '@hookform/resolvers/zod';
import CodeMirror from '@uiw/react-codemirror';
import { isAxiosError } from 'axios';
import { FileCode, FileText, Loader2, Paperclip, PlusCircle, Save, Trash2, Video } from 'lucide-react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

import AttachmentLink from '@/components/course/attachment-link';
import { InteractiveHoverButton } from '@/components/magicui/interactive-hover-button';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { adminApiClient } from '@/server/admin-api-client';
import S3ApiClient from '@/server/s3';
import {
    AdminCourseDetailDTO,
    AdminCreateUpdateLessonRequestDTO,
    AdminLessonDTO,
    ProgrammingLanguage,
} from '@/types/admin';
import { TaskType } from '@/types/task';

import TaskItem from './task-item';

const testCaseSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, 'Название тест-кейса обязательно'),
    input: z.array(z.string()).min(0, 'Хотя бы один входной параметр (можно пустой массив, если нет входа)'),
    expectedOutput: z.array(z.string()).min(0, 'Хотя бы один ожидаемый вывод (можно пустой массив)'),
    isHidden: z.boolean().default(false),
    points: z.coerce.number().min(0, 'Баллы не могут быть отрицательными').default(1),
});

const attachmentSchema = z.object({
    name: z.string(),
    url: z.string(),
});

const codeExampleSchema = z.object({
    value: z.string().min(1, 'Пример кода обязателен'),
});

const taskSchema = z
    .object({
        id: z.string().optional(),
        description: z.string().min(1, 'Описание задачи обязательно для заполнения'),
        solution: z.string().nullable().optional(),
        taskType: z.nativeEnum(TaskType),
        options: z.array(z.string()).nullable().optional(),

        language: z.nativeEnum(ProgrammingLanguage).nullable().optional(),
        boilerplateCode: z.string().nullable().optional(),
        testCases: z.array(testCaseSchema).optional().default([]),

        timeoutSeconds: z.coerce.number().min(1).max(60).nullable().optional(),
        memoryLimitMb: z.coerce.number().min(32).max(512).nullable().optional(),
    })
    .refine(
        (data) => {
            if (data.taskType === TaskType.CODE_INPUT && !data.language) {
                return false;
            }
            return true;
        },
        {
            message: 'Необходимо выбрать язык программирования для кодовой задачи',
            path: ['language'],
        }
    )
    .refine(
        (data) => {
            if (data.taskType === TaskType.CODE_INPUT && (!data.testCases || data.testCases.length === 0)) {
                return false;
            }
            return true;
        },
        {
            message: 'Для кодовой задачи рекомендуется добавить хотя бы один тест-кейс',
            path: ['testCases'],
        }
    )
    .refine(
        (data) => {
            if (data.taskType === TaskType.MULTIPLE_CHOICE) {
                return Array.isArray(data.options) && data.options.length > 1;
            }
            return true;
        },
        {
            message: 'Выберите хотя бы два варианта ответа',
            path: ['options'],
        }
    )
    .refine(
        (data) => {
            if ((data.taskType === TaskType.TEXT_INPUT || data.taskType === TaskType.CODE_INPUT) && !data.solution) {
                return false;
            }

            return true;
        },
        {
            message: 'Ответ не может быть пустым',
            path: ['solution'],
        }
    );

const lessonFormSchema = z.object({
    title: z.string().min(3, 'Заголовок урока обязателен для заполнения'),
    content: z.string().optional().or(z.literal('')),
    codeExamples: z.array(codeExampleSchema).optional().default([]),
    tasks: z.array(taskSchema).optional().default([]),
    attachments: z.array(attachmentSchema).optional().default([]),
    mainAttachment: z.string().url('Неверный формат URL для основного прикрепления').nullable().optional(),
});

export type LessonFormData = z.infer<typeof lessonFormSchema>;

interface LessonEditDialogProps {
    courseId: string;
    lesson?: AdminLessonDTO | null;
    onOpenChange: (open: boolean) => void;
    onSuccess: (updatedCourseData: AdminCourseDetailDTO) => void;
}

export default function LessonEditDialog({ courseId, lesson, onOpenChange, onSuccess }: LessonEditDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const isEditing = lesson != null;
    const s3ApiClient = new S3ApiClient();
    const [uploadStates, setUploadStates] = useState<{ [key: string]: boolean }>({});
    const [activeSection, setActiveSection] = useState<'content' | 'code' | 'tasks' | 'attachments'>('content');

    const mapCodeExamplesToFormData = (examples?: string[]): { value: string }[] => {
        return examples?.map((ex) => ({ value: ex })) ?? [];
    };

    const form = useForm<LessonFormData>({
        resolver: zodResolver(lessonFormSchema),
        defaultValues: {
            title: lesson?.title ?? '',
            content: lesson?.content ?? '',
            codeExamples: mapCodeExamplesToFormData(lesson?.codeExamples),
            tasks:
                lesson?.tasks?.map((t) => ({
                    id: t.id || `temp-${Date.now()}-${Math.random()}`,
                    description: t.description,
                    solution: t.solution,
                    taskType: t.taskType,
                    options: t.options || [],
                    language: t.language || null,
                    boilerplateCode: t.boilerplateCode,
                    testCases:
                        t.testCases?.map((tc) => ({ ...tc, id: tc.id || `tc-temp-${Date.now()}-${Math.random()}` })) ||
                        [],
                    timeoutSeconds: t.timeoutSeconds || null,
                    memoryLimitMb: t.memoryLimitMb || null,
                })) ?? [],
            attachments: lesson?.attachments ?? [],
            mainAttachment: lesson?.mainAttachment ?? null,
        },
    });

    const {
        fields: codeExampleFields,
        append: appendCodeExample,
        remove: removeCodeExample,
    } = useFieldArray({
        control: form.control,
        name: 'codeExamples',
    });

    const {
        fields: taskFields,
        append: appendTask,
        remove: removeTask,
    } = useFieldArray({
        control: form.control,
        name: 'tasks',
    });

    const {
        fields: attachmentFields,
        append: appendAttachment,
        remove: removeAttachment,
    } = useFieldArray({
        control: form.control,
        name: 'attachments',
    });

    useEffect(() => {
        form.reset({
            title: lesson?.title ?? '',
            content: lesson?.content ?? '',
            codeExamples: mapCodeExamplesToFormData(lesson?.codeExamples),
            tasks: lesson?.tasks?.map((t) => ({ ...t, id: t.id || `temp-${Date.now()}-${Math.random()}` })) ?? [],
            attachments: lesson?.attachments ?? [],
            mainAttachment: lesson?.mainAttachment ?? null,
        });
    }, [lesson, form]);

    const handleFileUpload = async (
        file: File,
        directory: string,
        fileIdentifier: string,
        onSuccess: (url: string, name: string) => void,
        onError: () => void
    ) => {
        if (!file) return;

        setUploadStates((prev) => ({ ...prev, [fileIdentifier]: true }));

        try {
            const response = await s3ApiClient.uploadFile(file, directory);
            if (response?.url) {
                onSuccess(response.url, file.name);
                toast.success(`Файл "${file.name}" загружен.`);
            } else {
                throw new Error('Upload failed, URL not received.');
            }
        } catch (error) {
            console.error(`Error uploading file to ${directory}:`, error);
            toast.error(`Не удалось загрузить файл "${file.name}".`);
            onError();
        } finally {
            setUploadStates((prev) => ({ ...prev, [fileIdentifier]: false }));
        }
    };

    const handleMainAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const fileId = `main-${Date.now()}`;
            handleFileUpload(
                file,
                'lesson-main-attachments',
                fileId,
                (url) => form.setValue('mainAttachment', url),
                () => form.setValue('mainAttachment', lesson?.mainAttachment ?? null)
            );
        }
    };

    const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const fileId = `attachment-${Date.now()}`;
            handleFileUpload(
                file,
                'lesson-attachments',
                fileId,
                (url, name) => appendAttachment({ name, url }),
                () => {}
            );
        }
    };

    const {
        formState: { errors },
    } = form;

    const onSubmit = async (values: LessonFormData) => {
        setIsSubmitting(true);
        try {
            const requestData: AdminCreateUpdateLessonRequestDTO = {
                title: values.title,
                content: values.content || null,
                codeExamples: values.codeExamples?.map((ex) => ex.value),
                tasks: values.tasks?.map((taskValue) => ({
                    ...taskValue,
                    id: taskValue.id?.startsWith('temp-') ? undefined : taskValue.id,
                    language: taskValue.language,
                    testCases:
                        taskValue.testCases?.map((tc) => ({
                            ...tc,
                            id: tc.id?.startsWith('tc-temp-') ? undefined : tc.id,
                        })) || [],
                })),
                attachments: values.attachments,
                mainAttachment: values.mainAttachment,
            };

            let updatedCourse: AdminCourseDetailDTO;

            if (isEditing && lesson) {
                updatedCourse = await adminApiClient.updateLessonAdmin(courseId, lesson.id, requestData);
                toast.success(`Lesson \"${values.title}\" updated.`);
            } else {
                updatedCourse = await adminApiClient.addLessonAdmin(courseId, requestData);
                toast.success(`Lesson \"${values.title}\" added.`);
            }

            onSuccess(updatedCourse);
        } catch (error: unknown) {
            console.error(`Error ${isEditing ? 'updating' : 'adding'} lesson:`, error);

            let errorMsg = 'Unknown error';

            if (isAxiosError(error)) {
                errorMsg = error?.response?.data?.message || error.message || 'Unknown error';
            } else if (error instanceof Error) {
                errorMsg = error.message;
            }

            toast.error(`Failed to ${isEditing ? 'save' : 'add'} lesson: ${errorMsg}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col border-border/40 backdrop-blur-sm overflow-hidden">
                <DialogHeader className="relative z-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-50"></div>
                    <DialogTitle className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent relative z-10">
                        {isEditing ? `Редактирование урока: ${lesson?.title}` : 'Добавить новый урок'}
                    </DialogTitle>
                    <DialogDescription className="relative z-10">
                        {isEditing
                            ? 'Измените содержимое и подробности урока.'
                            : 'Заполните подробную информацию для нового урока.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex border-y border-border/40 relative z-10 bg-muted/20">
                    <button
                        className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                            activeSection === 'content'
                                ? 'text-primary bg-background/60'
                                : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
                        }`}
                        onClick={() => setActiveSection('content')}
                    >
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span>Основной контент</span>
                        </div>
                        {activeSection === 'content' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-secondary"></div>
                        )}
                    </button>
                    <button
                        className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                            activeSection === 'code'
                                ? 'text-primary bg-background/60'
                                : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
                        }`}
                        onClick={() => setActiveSection('code')}
                    >
                        <div className="flex items-center gap-2">
                            <FileCode className="h-4 w-4" />
                            <span>Примеры кода</span>
                        </div>
                        {activeSection === 'code' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-secondary"></div>
                        )}
                    </button>
                    <button
                        className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                            activeSection === 'tasks'
                                ? 'text-primary bg-background/60'
                                : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
                        }`}
                        onClick={() => setActiveSection('tasks')}
                    >
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span>Задания</span>
                            {taskFields.length > 0 && (
                                <span className="bg-primary/10 text-primary text-xs px-1.5 py-0.5 rounded-full">
                                    {taskFields.length}
                                </span>
                            )}
                        </div>
                        {activeSection === 'tasks' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-secondary"></div>
                        )}
                    </button>
                    <button
                        className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                            activeSection === 'attachments'
                                ? 'text-primary bg-background/60'
                                : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
                        }`}
                        onClick={() => setActiveSection('attachments')}
                    >
                        <div className="flex items-center gap-2">
                            <Paperclip className="h-4 w-4" />
                            <span>Вложения</span>
                            {(attachmentFields.length > 0 || form.getValues('mainAttachment')) && (
                                <span className="bg-primary/10 text-primary text-xs px-1.5 py-0.5 rounded-full">
                                    {attachmentFields.length + (form.getValues('mainAttachment') ? 1 : 0)}
                                </span>
                            )}
                        </div>
                        {activeSection === 'attachments' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-secondary"></div>
                        )}
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-6 pl-1 -mr-6 custom-scrollbar relative z-10">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pb-4 pt-4">
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-base font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                            Название урока
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Например, настройка среды разработки"
                                                {...field}
                                                disabled={isSubmitting}
                                                className="border-border/40 bg-background/60 focus:border-primary/40 transition-colors"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {activeSection === 'content' && (
                                <FormField
                                    control={form.control}
                                    name="content"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                                Контент
                                            </FormLabel>
                                            <FormControl>
                                                <div className="border border-border/40 rounded-md overflow-hidden bg-background/60 w-full">
                                                    <RichTextEditor
                                                        value={field.value ?? ''}
                                                        onChange={field.onChange}
                                                        disabled={isSubmitting}
                                                        className="w-full"
                                                        editorClassName="w-full"
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                            {activeSection === 'code' && (
                                <div className="space-y-4 rounded-md border border-border/40 p-4 bg-background/60">
                                    <FormLabel className="text-base font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                        Примеры кода
                                    </FormLabel>
                                    {codeExampleFields.length === 0 && (
                                        <div className="text-center text-muted-foreground py-4 border border-dashed border-border/40 rounded-md">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <div className="relative">
                                                    <div className="absolute inset-0 bg-muted-foreground/10 rounded-full blur-lg"></div>
                                                    <FileCode className="h-10 w-10 text-muted-foreground/50 relative z-10" />
                                                </div>
                                                <p>No code examples added yet.</p>
                                            </div>
                                        </div>
                                    )}
                                    {codeExampleFields.map((field, index) => (
                                        <FormField
                                            key={field.id}
                                            control={form.control}
                                            name={`codeExamples.${index}.value`}
                                            render={({ field: codeField }) => (
                                                <FormItem className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <FormLabel className="text-sm font-medium">
                                                            Example {index + 1}
                                                            {errors.codeExamples?.[index]?.value && (
                                                                <span className="ml-2 text-xs text-destructive">
                                                                    {errors.codeExamples[index]?.value?.message}
                                                                </span>
                                                            )}
                                                        </FormLabel>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon-sm"
                                                            onClick={() => removeCodeExample(index)}
                                                            disabled={isSubmitting}
                                                            className="text-destructive hover:bg-destructive/10"
                                                            aria-label="Remove code example"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <input type="hidden" {...codeField} />
                                                    <FormControl>
                                                        <div className="border border-border/40 rounded-md overflow-hidden">
                                                            <CodeMirror
                                                                value={codeField.value ?? ''}
                                                                height="150px"
                                                                onChange={(value) => codeField.onChange(value)}
                                                                className="flex-1 text-sm"
                                                                readOnly={isSubmitting}
                                                                extensions={[
                                                                    javascript({ jsx: true, typescript: true }),
                                                                    css(),
                                                                    html({ autoCloseTags: true }),
                                                                ]}
                                                                basicSetup={{
                                                                    foldGutter: false,
                                                                    dropCursor: false,
                                                                    allowMultipleSelections: false,
                                                                    indentOnInput: false,
                                                                }}
                                                            />
                                                        </div>
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    ))}

                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => appendCodeExample({ value: '' })}
                                        disabled={isSubmitting}
                                        className="mt-2 relative overflow-hidden group/btn border-border/40 bg-background/60"
                                    >
                                        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary/10 to-secondary/10 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></span>
                                        <PlusCircle className="mr-2 h-4 w-4 relative z-10" />
                                        <span className="relative z-10">Добавить пример кода</span>
                                    </Button>
                                </div>
                            )}
                            {activeSection === 'tasks' && (
                                <div className="space-y-4 rounded-md border border-border/40 p-4 bg-background/60">
                                    <FormLabel className="text-base font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                        Задания
                                    </FormLabel>
                                    <div className="space-y-4">
                                        {taskFields.length === 0 && (
                                            <div className="text-center text-muted-foreground py-4 border border-dashed border-border/40 rounded-md">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <div className="relative">
                                                        <div className="absolute inset-0 bg-muted-foreground/10 rounded-full blur-lg"></div>
                                                        <FileText className="h-10 w-10 text-muted-foreground/50 relative z-10" />
                                                    </div>
                                                    <p>Задания еще не добавлены.</p>
                                                </div>
                                            </div>
                                        )}
                                        {taskFields.map((field, index) => (
                                            <TaskItem
                                                key={field.id}
                                                control={form.control}
                                                index={index}
                                                removeTask={removeTask}
                                                isSubmitting={isSubmitting}
                                                errors={errors}
                                            />
                                        ))}
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            appendTask({
                                                id: uuidv4(),
                                                description: '',
                                                taskType: TaskType.TEXT_INPUT,
                                                solution: null,
                                                options: [],
                                                language: null,
                                                boilerplateCode: null,
                                                testCases: [],
                                                timeoutSeconds: 10,
                                                memoryLimitMb: 128,
                                            })
                                        }
                                        disabled={isSubmitting}
                                        className="mt-4 relative overflow-hidden group/btn border-border/40 bg-background/60"
                                    >
                                        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary/10 to-secondary/10 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></span>
                                        <PlusCircle className="mr-2 h-4 w-4 relative z-10" />
                                        <span className="relative z-10">Добавить задание</span>
                                    </Button>
                                </div>
                            )}
                            {activeSection === 'attachments' && (
                                <>
                                    <FormField
                                        control={form.control}
                                        name="mainAttachment"
                                        render={({ field }) => (
                                            <FormItem className="space-y-4 rounded-md border border-border/40 p-4 bg-background/60">
                                                <FormLabel className="text-base font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex items-center gap-2">
                                                    <Video className="h-4 w-4" />
                                                    Основное вложение (видео, PDF, и т.д.)
                                                </FormLabel>
                                                {field.value && (
                                                    <div className="mt-1 flex items-center gap-2 p-3 rounded-md bg-muted/30 border border-border/40">
                                                        <div className="flex-1">
                                                            <AttachmentLink
                                                                attachment={{
                                                                    name: 'Current main attachment',
                                                                    url: field.value,
                                                                }}
                                                                className="text-xs bg-background/80 hover:bg-background transition-colors"
                                                            />
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-xs text-destructive hover:bg-destructive/10 h-auto"
                                                            onClick={() => field.onChange(null)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                                <FormControl>
                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            type="file"
                                                            onChange={handleMainAttachmentChange}
                                                            disabled={
                                                                isSubmitting || !!uploadStates[`main-${lesson?.id}`]
                                                            }
                                                            className="flex-1 border-border/40 bg-background/60"
                                                        />
                                                        {uploadStates[`main-${lesson?.id}`] && (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        )}
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="space-y-4 rounded-md border border-border/40 p-4 bg-background/60">
                                        <FormLabel className="text-base font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex items-center gap-2">
                                            <Paperclip className="h-4 w-4" />
                                            Доп. вложения
                                        </FormLabel>
                                        <div className="space-y-2">
                                            {attachmentFields.length === 0 && (
                                                <p className="text-xs text-muted-foreground text-center py-4 border border-dashed border-border/40 rounded-md">
                                                    No additional attachments.
                                                </p>
                                            )}
                                            {attachmentFields.map((field, index) => (
                                                <div
                                                    key={field.id}
                                                    className="flex items-center gap-2 justify-between bg-muted/30 p-2 rounded-md border border-border/40"
                                                >
                                                    <AttachmentLink
                                                        attachment={{ name: field.name, url: field.url }}
                                                        className="text-xs bg-background/80 hover:bg-background transition-colors"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon-sm"
                                                        className="text-destructive hover:bg-destructive/10"
                                                        onClick={() => removeAttachment(index)}
                                                        disabled={isSubmitting}
                                                        aria-label={`Remove attachment ${field.name}`}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-2 pt-2 border-t border-border/40">
                                            <FormLabel className="text-xs mb-1 block">Upload new attachment</FormLabel>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="file"
                                                    id="attachment-upload"
                                                    onChange={handleAttachmentChange}
                                                    disabled={isSubmitting || uploadStates['new-attachment']}
                                                    className="flex-1 border-border/40 bg-background/60"
                                                />
                                                {uploadStates['new-attachment'] && (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </form>
                    </Form>
                </div>

                <DialogFooter className="flex-shrink-0 pt-4 border-t border-border/40 relative z-10">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSubmitting}
                        className="border-border/40 bg-background/60"
                    >
                        Отмена
                    </Button>
                    <InteractiveHoverButton
                        type="button"
                        onClick={form.handleSubmit(onSubmit)}
                        disabled={isSubmitting}
                        icon={isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="size-4" />}
                    >
                        {isEditing ? 'Сохранить изменения' : 'Добавить урок'}
                    </InteractiveHoverButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
