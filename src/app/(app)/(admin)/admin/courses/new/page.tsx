'use client';

import React from 'react';

import { toast } from 'sonner';

import { useRouter } from 'next/navigation';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserStore } from '@/stores/user/user-store-provider';
import { AdminCourseDetailDTO } from '@/types/admin';

import CourseDetailsForm from '../[courseId]/edit/_components/course-details-form';

export default function CreateCoursePage() {
    const router = useRouter();
    const { user } = useUserStore((state) => state);

    const isAdmin = user?.roles?.includes('ADMIN') || user?.roles?.includes('ROLE_ADMIN');
    const isMentorOnly = (user?.roles?.includes('MENTOR') || user?.roles?.includes('ROLE_MENTOR')) && !isAdmin;

    const handleCreateSuccess = (newCourse: AdminCourseDetailDTO) => {
        toast.success(`Курс \"${newCourse.title}\" успешно создан!`);
        router.push(`/admin/courses/${newCourse.id}/edit`);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Создать курс</CardTitle>
                <CardDescription>Создайте новый курс для вашего проекта.</CardDescription>
            </CardHeader>
            <CardContent>
                <CourseDetailsForm
                    onSuccess={handleCreateSuccess}
                    forcedAuthorId={isMentorOnly ? user?.id : undefined}
                />
            </CardContent>
        </Card>
    );
}
