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

            isAdmin: user.roles.includes('ADMIN'),
            isUser: user.roles.includes('USER'),
        },
    });

    const onSubmit = async (values: FormData) => {
        setIsSubmitting(true);
        try {
            const updatedRoles: string[] = [];
            if (values.isUser) updatedRoles.push('USER');
            if (values.isAdmin) updatedRoles.push('ADMIN');

            const updateData: AdminUpdateUserRequest = {
                roles: updatedRoles,
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
                    <DialogTitle>Edit User: {user.username}</DialogTitle>
                    <DialogDescription>
                        Modify user details and roles. Click save when you&apos;re done.
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
                                        <FormLabel className="text-base">Verified</FormLabel>
                                        <FormDescription>Is the user&apos;s email verified?</FormDescription>
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
                            <FormLabel className="text-base">Roles</FormLabel>
                            <FormDescription>Assign roles to the user.</FormDescription>
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
                                        <FormLabel className="font-normal">USER</FormLabel>
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
                                        <FormLabel className="font-normal">ADMIN</FormLabel>
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
