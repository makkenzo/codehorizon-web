'use client';

import React, { useCallback, useEffect, useState } from 'react';

import { isAxiosError } from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowLeft,
    BookAIcon,
    BookOpen,
    Edit3,
    Eye,
    GraduationCap,
    Loader2,
    Save,
    Sparkles,
    TrendingUp,
    Users,
    X,
} from 'lucide-react';
import { toast } from 'sonner';

import { useParams, useRouter } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { adminApiClient } from '@/server/admin-api-client';
import { useUserStore } from '@/stores/user/user-store-provider';
import { AdminCourseDetailDTO, AdminLessonDTO } from '@/types/admin';

import CourseDetailsForm from './_components/course-details-form';
import LessonEditDialog from './_components/lesson-edit-dialog';
import LessonList from './_components/lesson-list';
import StudentProgressTab from './_components/student-progress-tab';

export default function EditCoursePage() {
    const { user } = useUserStore((state) => state);
    const router = useRouter();
    const params = useParams();
    const courseId = Array.isArray(params.courseId) ? params.courseId[0] : params.courseId;

    const [courseData, setCourseData] = useState<AdminCourseDetailDTO | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('details');
    const [editingLesson, setEditingLesson] = useState<AdminLessonDTO | null>(null);
    const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);

    const fetchCourse = useCallback(async (): Promise<AdminCourseDetailDTO | null> => {
        if (!courseId) {
            toast.error('Course ID is missing.');
            setIsLoading(false);
            setCourseData(null);
            return null;
        }

        try {
            const data = await adminApiClient.getCourseAdmin(courseId);
            setCourseData(data);
            return data;
        } catch (error: unknown) {
            console.error('Failed to fetch course details:', error);

            let errorMsg = 'Unknown error';

            if (isAxiosError(error)) {
                errorMsg = error?.response?.data?.message || error.message || 'Unknown error';
            } else if (error instanceof Error) {
                errorMsg = error.message;
            }

            toast.error(`Failed to load course: ${errorMsg}`);
            setCourseData(null);
            return null;
        }
    }, [courseId]);

    useEffect(() => {
        if (courseId) {
            setIsLoading(true);
            fetchCourse()
                .then((loadedCourseData) => {
                    if (loadedCourseData && user) {
                        const isAdmin = user.roles?.includes('ADMIN') || user.roles?.includes('ROLE_ADMIN');
                        const isAuthor = loadedCourseData.authorId === user.id;

                        if (!isAdmin && !isAuthor) {
                            toast.error('У вас нет прав для редактирования этого курса.');
                            router.replace('/admin/courses');
                        }
                    } else if (!loadedCourseData) {
                        router.replace('/admin/courses');
                    }
                })
                .finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
            console.error('EditCoursePage: courseId is missing in params.');
        }
    }, [courseId, fetchCourse, user, router]);

    const handleDetailsUpdateSuccess = (updatedCourse: AdminCourseDetailDTO) => {
        setCourseData(updatedCourse);
        toast.success('Course details updated successfully.');
    };

    const handleOpenLessonDialog = (lesson: AdminLessonDTO | null = null) => {
        setEditingLesson(lesson);
        setIsLessonDialogOpen(true);
    };

    const handleLessonDialogSuccess = (updatedCourseData: AdminCourseDetailDTO) => {
        setCourseData(updatedCourseData);
        setIsLessonDialogOpen(false);
        setEditingLesson(null);
    };

    const handleDeleteLesson = async (lessonId: string, lessonTitle: string) => {
        if (!courseId) return;
        if (confirm(`Are you sure you want to delete lesson "${lessonTitle}"?`)) {
            try {
                await adminApiClient.deleteLessonAdmin(courseId, lessonId);
                toast.success(`Lesson "${lessonTitle}" deleted.`);
                fetchCourse();
            } catch (error: unknown) {
                console.error(`Failed to delete lesson ${lessonId}:`, error);

                let errorMsg = 'Unknown error';

                if (isAxiosError(error)) {
                    errorMsg = error?.response?.data?.message || error.message || 'Unknown error';
                } else if (error instanceof Error) {
                    errorMsg = error.message;
                }

                toast.error(`Failed to delete lesson: ${errorMsg}`);
            }
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'BEGINNER':
                return 'from-emerald-500 to-teal-500';
            case 'INTERMEDIATE':
                return 'from-amber-500 to-orange-500';
            case 'ADVANCED':
                return 'from-rose-500 to-pink-500';
            default:
                return 'from-slate-500 to-gray-500';
        }
    };

    const getDifficultyLabel = (difficulty: string) => {
        switch (difficulty) {
            case 'BEGINNER':
                return 'Начинающий';
            case 'INTERMEDIATE':
                return 'Средний';
            case 'ADVANCED':
                return 'Продвинутый';
            default:
                return difficulty;
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center relative">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100"></div>
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-3xl opacity-60 animate-pulse"></div>
                    <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-bl from-violet-500/20 to-fuchsia-500/20 rounded-full blur-3xl opacity-60 animate-pulse delay-700"></div>
                </div>
                <motion.div
                    className="relative z-10 flex flex-col items-center gap-4"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur-lg opacity-50"></div>
                        <div className="relative bg-white/80 backdrop-blur-sm rounded-full p-4 shadow-xl">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    </div>
                    <p className="text-slate-600 font-medium">Загрузка курса...</p>
                </motion.div>
            </div>
        );
    }

    if (!courseData && !isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center relative">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100"></div>
                <motion.div
                    className="relative z-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="bg-white/80 backdrop-blur-lg shadow-xl border border-white/50">
                        <CardHeader>
                            <CardTitle className="text-destructive">Ошибка</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p>Не удалось загрузить данные курса.</p>
                            <Button onClick={() => router.push('/admin/courses')} variant="outline">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Назад к курсам
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    if (!courseData) return null;

    return (
        <div className="min-h-screen relative">
            <div className="container mx-auto px-4 py-8 relative z-10">
                <motion.div
                    className="mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center gap-4 mb-6">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push('/admin/courses')}
                            className="bg-white/80 backdrop-blur-sm border-white/50 hover:bg-white/90"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Назад
                        </Button>
                        <div className="h-6 w-px bg-slate-300"></div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg blur opacity-75"></div>
                                <div className="relative bg-white/80 backdrop-blur-sm rounded-lg p-2">
                                    <GraduationCap className="h-5 w-5 text-primary" />
                                </div>
                            </div>
                            <span className="text-slate-600 font-medium">Редактирование курса</span>
                        </div>
                    </div>

                    <Card className="bg-white/70 backdrop-blur-lg shadow-xl border border-white/50 overflow-hidden py-0">
                        <div
                            className={`h-32 bg-gradient-to-r ${getDifficultyColor(courseData.difficulty || 'BEGINNER')} relative`}
                        >
                            <div className="absolute inset-0 bg-black/10"></div>
                            <div className="absolute top-4 right-4">
                                <Badge variant="secondary" className="bg-white/20 text-white border-0 backdrop-blur-sm">
                                    <Sparkles className="h-3 w-3 mr-1" />
                                    {getDifficultyLabel(courseData.difficulty || 'BEGINNER')}
                                </Badge>
                            </div>
                            <div className="absolute bottom-4 left-6 right-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 text-white">
                                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                                            <BookOpen className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm opacity-90">Уроков</p>
                                            <p className="text-xl font-bold">{courseData.lessons.length}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 text-white">
                                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                                            <TrendingUp className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm opacity-90">Цена</p>
                                            <p className="text-xl font-bold">${courseData.price}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <AnimatePresence mode="wait">
                                        {isEditingTitle ? (
                                            <motion.div
                                                key="editing"
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className="flex items-center gap-2"
                                            >
                                                <input
                                                    type="text"
                                                    defaultValue={courseData.title}
                                                    className="text-2xl font-bold bg-transparent border-b-2 border-primary focus:outline-none flex-1"
                                                    autoFocus
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            setIsEditingTitle(false);
                                                        }
                                                        if (e.key === 'Escape') {
                                                            setIsEditingTitle(false);
                                                        }
                                                    }}
                                                />
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => setIsEditingTitle(false)}
                                                >
                                                    <Save className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => setIsEditingTitle(false)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="display"
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                className="flex items-center gap-2 group cursor-pointer"
                                                onClick={() => setIsEditingTitle(true)}
                                            >
                                                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                                                    {courseData.title}
                                                </h1>
                                                <Edit3 className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    {courseData.description && (
                                        <div
                                            className="text-slate-600 mt-2 prose max-w-none"
                                            dangerouslySetInnerHTML={{ __html: courseData.description }}
                                        ></div>
                                    )}
                                    <div className="flex items-center gap-4 mt-4">
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                            Автор: {courseData.authorUsername}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-500">
                                            <Eye className="h-4 w-4" />
                                            ID: {courseData.id}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <div className="flex items-center justify-center mb-8">
                            <TabsList className="bg-white/80 backdrop-blur-lg border border-white/50 shadow-lg p-1 rounded-2xl">
                                <TabsTrigger
                                    value="details"
                                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white rounded-xl px-6 py-2 transition-all duration-300"
                                >
                                    <BookAIcon className="h-4 w-4 mr-2" />
                                    Детали
                                </TabsTrigger>
                                <TabsTrigger
                                    value="lessons"
                                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white rounded-xl px-6 py-2 transition-all duration-300"
                                >
                                    <BookOpen className="h-4 w-4 mr-2" />
                                    Уроки ({courseData.lessons.length})
                                </TabsTrigger>
                                <TabsTrigger
                                    value="students"
                                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white rounded-xl px-6 py-2 transition-all duration-300"
                                >
                                    <Users className="h-4 w-4 mr-2" />
                                    Студенты
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <AnimatePresence mode="wait">
                            <TabsContent value="details" className="mt-0">
                                <motion.div
                                    key="details"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Card className="bg-white/70 backdrop-blur-lg shadow-xl border border-white/50 overflow-hidden py-0">
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-50"></div>
                                        <CardHeader className="relative z-10 bg-gradient-to-r from-primary/10 to-secondary/10 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg blur opacity-75"></div>
                                                    <div className="relative bg-white/80 backdrop-blur-sm rounded-lg p-2">
                                                        <BookAIcon className="h-5 w-5 text-primary" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <CardTitle className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                                        Детали курса
                                                    </CardTitle>
                                                    <CardDescription>
                                                        Обновите основную информацию для этого курса.
                                                    </CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="relative z-10 p-6">
                                            <CourseDetailsForm
                                                course={courseData}
                                                onSuccess={handleDetailsUpdateSuccess}
                                            />
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </TabsContent>
                            <TabsContent value="lessons" className="mt-0">
                                <motion.div
                                    key="lessons"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Card className="bg-white/70 backdrop-blur-lg shadow-xl border border-white/50 overflow-hidden relative group py-0">
                                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5 opacity-50"></div>
                                        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-emerald-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                        <div className="absolute -top-32 -left-32 w-64 h-64 bg-teal-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                        <CardHeader className="relative z-10 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                    <div className="relative bg-white/80 backdrop-blur-sm rounded-lg p-2">
                                                        <BookOpen className="h-5 w-5 text-emerald-600" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <CardTitle className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                                        Управление уроками
                                                    </CardTitle>
                                                    <CardDescription>
                                                        Создавайте, редактируйте и организуйте уроки курса.
                                                    </CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="relative z-10 p-6">
                                            <div className="bg-white/50 backdrop-blur-sm rounded-xl border border-white/50 overflow-hidden">
                                                <LessonList
                                                    lessons={courseData.lessons}
                                                    onEditLesson={handleOpenLessonDialog}
                                                    onDeleteLesson={handleDeleteLesson}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </TabsContent>
                            <TabsContent value="students" className="mt-0">
                                <motion.div
                                    key="students"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Card className="bg-white/70 backdrop-blur-lg shadow-xl border border-white/50 overflow-hidden relative group py-0">
                                        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-fuchsia-500/5 opacity-50"></div>
                                        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-violet-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                        <CardHeader className="relative z-10 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                    <div className="relative bg-white/80 backdrop-blur-sm rounded-lg p-2">
                                                        <Users className="h-5 w-5 text-violet-600" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <CardTitle className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                                                        Прогресс студентов
                                                    </CardTitle>
                                                    <CardDescription>
                                                        Отслеживайте успехи и прогресс ваших студентов.
                                                    </CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="relative z-10 p-6">
                                            {courseId && <StudentProgressTab courseId={courseId} />}
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </TabsContent>
                        </AnimatePresence>
                    </Tabs>
                </motion.div>
            </div>

            {isLessonDialogOpen && courseId && (
                <LessonEditDialog
                    courseId={courseId}
                    lesson={editingLesson}
                    onOpenChange={(open) => {
                        if (!open) {
                            setIsLessonDialogOpen(false);
                            setEditingLesson(null);
                        }
                    }}
                    onSuccess={handleLessonDialogSuccess}
                />
            )}
        </div>
    );
}
