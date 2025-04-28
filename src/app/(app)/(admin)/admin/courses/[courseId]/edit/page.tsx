'use client';

import React, { useCallback, useEffect, useState } from 'react';

import { Loader2, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';

import { useParams, useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { adminApiClient } from '@/server/admin-api-client';
import { AdminCourseDetailDTO, AdminLessonDTO } from '@/types/admin';

import CourseDetailsForm from './_components/course-details-form';
import LessonEditDialog from './_components/lesson-edit-dialog';
import LessonList from './_components/lesson-list';

export default function EditCoursePage() {
    const router = useRouter();
    const params = useParams();
    const courseId = Array.isArray(params.courseId) ? params.courseId[0] : params.courseId;

    const [courseData, setCourseData] = useState<AdminCourseDetailDTO | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('details');
    const [editingLesson, setEditingLesson] = useState<AdminLessonDTO | null>(null);
    const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);

    const fetchCourse = useCallback(async () => {
        if (!courseId) {
            toast.error('Course ID is missing.');
            setIsLoading(false);
            setCourseData(null);
            return;
        }

        try {
            const data = await adminApiClient.getCourseAdmin(courseId);
            setCourseData(data);
        } catch (error: any) {
            console.error('Failed to fetch course details:', error);
            toast.error(`Failed to load course: ${error.message || 'Unknown error'}`);
            setCourseData(null);
        }
    }, [courseId]);

    useEffect(() => {
        if (courseId) {
            setIsLoading(true);
            fetchCourse().finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
            console.error('EditCoursePage: courseId is missing in params.');
        }
    }, [courseId, fetchCourse]);

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
            } catch (error: any) {
                console.error(`Failed to delete lesson ${lessonId}:`, error);
                toast.error(`Failed to delete lesson: ${error.message || 'Unknown error'}`);
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!courseData && !isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Error</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Could not load course data.</p>
                    <Button onClick={() => router.push('/admin/courses')} variant="link">
                        Back to Courses
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (!courseData) return null;

    return (
        <>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
                    <h1 className="text-2xl font-bold truncate">
                        Edit Course: <span className="text-muted-foreground">{courseData.title}</span>
                    </h1>
                    <TabsList>
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="lessons">Lessons ({courseData.lessons.length})</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="details">
                    <Card>
                        <CardHeader>
                            <CardTitle>Course Details</CardTitle>
                            <CardDescription>Update the main information for this course.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CourseDetailsForm course={courseData} onSuccess={handleDetailsUpdateSuccess} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="lessons">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Lessons</CardTitle>
                                <CardDescription>Manage the lessons for this course.</CardDescription>
                            </div>
                            <Button size="sm" onClick={() => handleOpenLessonDialog()}>
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Add Lesson
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <LessonList
                                lessons={courseData.lessons}
                                onEditLesson={handleOpenLessonDialog}
                                onDeleteLesson={handleDeleteLesson}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

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
        </>
    );
}
