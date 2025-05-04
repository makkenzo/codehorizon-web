'use client';

import React, { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { adminApiClient } from '@/server/admin-api-client';
import { AdminUpdateUserRequest, AdminUser } from '@/types/admin';

const formSchema = z.object({
    isVerified: z.boolean(),
    isAdmin: z.boolean(),
    isUser: z.boolean(),
    isMentor: z.boolean(),
});

type FormData = z.infer<typeof formSchema>;

interface AdminUserEditDialogProps {
    user: AdminUser;
    onOpenChange: (open: boolean) => void;
    onUserUpdate: (updatedUser: AdminUser) => void;
}

export default function AdminUserEditDialog({ user, onOpenChange, onUserUpdate }: AdminUserEditDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            isVerified: user.isVerified,

            isAdmin: user.roles.includes('ADMIN') || user.roles.includes('ROLE_ADMIN'),
            isUser: user.roles.includes('USER') || user.roles.includes('ROLE_USER'),
            isMentor: user.roles.includes('MENTOR') || user.roles.includes('ROLE_MENTOR'),
        },
    });

    const onSubmit = async (values: FormData) => {
        setIsSubmitting(true);
        try {
            const updatedRoles: string[] = [];
            if (values.isUser) updatedRoles.push('USER');
            if (values.isAdmin) updatedRoles.push('ADMIN');
            if (values.isMentor) updatedRoles.push('ROLE_MENTOR');

            const updateData: AdminUpdateUserRequest = {
                roles: updatedRoles.length > 0 ? updatedRoles : ['ROLE_USER'],
                isVerified: values.isVerified,
            };

            const updatedUser = await adminApiClient.updateUser(user.id, updateData);

            if (updatedUser) {
                toast.success(`User ${user.username} updated successfully!`);
                onUserUpdate(updatedUser);
            } else {
                toast.error(`Failed to update user ${user.username}.`);
            }
        } catch (error) {
            console.error('Error updating user:', error);
            toast.error('An error occurred while updating the user.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Редактировать пользователя: {user.username}</DialogTitle>
                    <DialogDescription>
                        Измените данные пользователя и роли. Нажмите «Сохранить», когда закончите.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                        <FormField
                            control={form.control}
                            name="isVerified"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Верификация</FormLabel>
                                        <FormDescription>Пользователь подтвержден эл. почтой?</FormDescription>
                                    </div>
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={isSubmitting}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <div className="space-y-2 rounded-lg border p-4">
                            <FormLabel className="text-base">Роли</FormLabel>
                            <FormDescription>Назначьте роли пользователю.</FormDescription>
                            <FormField
                                control={form.control}
                                name="isUser"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                disabled={isSubmitting}
                                            />
                                        </FormControl>
                                        <FormLabel className="font-normal">Пользователь</FormLabel>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="isAdmin"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                disabled={isSubmitting}
                                            />
                                        </FormControl>
                                        <FormLabel className="font-normal">Администратор</FormLabel>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="isMentor"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                disabled={isSubmitting}
                                                id={`mentor-role-${user.id}`}
                                            />
                                        </FormControl>
                                        <FormLabel htmlFor={`mentor-role-${user.id}`} className="font-normal">
                                            Ментор
                                        </FormLabel>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save changes
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
