'use client';

import { useState } from 'react';

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
import type { AdminUpdateUserRequest, AdminUser } from '@/types/admin';

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

    const getInitials = (username: string) => {
        return username.substring(0, 2).toUpperCase();
    };

    const getRandomGradient = (userId: string) => {
        // Generate a deterministic gradient based on user ID
        const hash = userId.split('').reduce((acc, char) => {
            return char.charCodeAt(0) + ((acc << 5) - acc);
        }, 0);

        const gradients = [
            'from-violet-500 to-fuchsia-500',
            'from-cyan-500 to-blue-500',
            'from-emerald-500 to-teal-500',
            'from-amber-500 to-orange-500',
            'from-rose-500 to-pink-500',
            'from-indigo-500 to-purple-500',
            'from-blue-500 to-indigo-500',
            'from-green-500 to-emerald-500',
            'from-orange-500 to-red-500',
            'from-pink-500 to-rose-500',
        ];

        return gradients[Math.abs(hash) % gradients.length];
    };

    return (
        <Dialog open={true} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] bg-white/90 backdrop-blur-lg border border-white/50 shadow-xl rounded-xl">
                <DialogHeader className="space-y-3">
                    <div className="mx-auto">
                        <div
                            className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-lg font-bold bg-gradient-to-br ${getRandomGradient(user.id)} shadow-lg border-4 border-white`}
                        >
                            {getInitials(user.username)}
                        </div>
                    </div>
                    <DialogTitle className="text-center text-xl">Редактировать пользователя</DialogTitle>
                    <DialogDescription className="text-center">
                        {user.username} • {user.email}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
                        <FormField
                            control={form.control}
                            name="isVerified"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-white/50 bg-white/50 p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Верификация</FormLabel>
                                        <FormDescription>Пользователь подтвержден эл. почтой?</FormDescription>
                                    </div>
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={isSubmitting}
                                            className="data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <div className="space-y-4 rounded-lg border border-white/50 bg-white/50 p-4">
                            <FormLabel className="text-base">Роли</FormLabel>
                            <FormDescription>Назначьте роли пользователю.</FormDescription>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField
                                    control={form.control}
                                    name="isUser"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col items-center space-y-2 rounded-lg border border-white/50 bg-white/70 p-3 transition-colors hover:bg-white/90">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                    disabled={isSubmitting}
                                                    className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                                                />
                                            </FormControl>
                                            <FormLabel className="font-medium text-emerald-700">Пользователь</FormLabel>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="isAdmin"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col items-center space-y-2 rounded-lg border border-white/50 bg-white/70 p-3 transition-colors hover:bg-white/90">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                    disabled={isSubmitting}
                                                    className="data-[state=checked]:bg-rose-600 data-[state=checked]:border-rose-600"
                                                />
                                            </FormControl>
                                            <FormLabel className="font-medium text-rose-700">Администратор</FormLabel>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="isMentor"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col items-center space-y-2 rounded-lg border border-white/50 bg-white/70 p-3 transition-colors hover:bg-white/90">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={field.onChange}
                                                    disabled={isSubmitting}
                                                    id={`mentor-role-${user.id}`}
                                                    className="data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                                                />
                                            </FormControl>
                                            <FormLabel
                                                htmlFor={`mentor-role-${user.id}`}
                                                className="font-medium text-amber-700"
                                            >
                                                Ментор
                                            </FormLabel>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <DialogFooter className="gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isSubmitting}
                                className="border-white/50 bg-white/80"
                            >
                                Отмена
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                            >
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Сохранить
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
