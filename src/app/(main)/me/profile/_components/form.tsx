'use client';

import { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Profile } from '@/models';
import ProfileApiClient from '@/server/profile';

const profileSchema = z.object({
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
    bio: z.string().nullable(),
    location: z.string().nullable(),
    website: z.string().nullable(),
});

const fields: Record<keyof z.infer<typeof profileSchema>, { label: string; placeholder: string }> = {
    firstName: { label: 'Имя', placeholder: 'Иван' },
    lastName: { label: 'Фамилия', placeholder: 'Кандинский' },
    bio: { label: 'Биография', placeholder: 'Расскажите о себе' },
    location: { label: 'Местоположение', placeholder: 'Москва, Россия' },
    website: { label: 'Веб-сайт', placeholder: 'https://example.com' },
};

const ProfileForm = ({}) => {
    const [profile, setProfile] = useState<Profile | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const profile = await new ProfileApiClient().getProfile().catch((e) => console.error(e));
            if (profile) {
                setProfile(profile);
            }
        };

        fetchData();
    }, []);
    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            firstName: profile?.firstName ?? '',
            lastName: profile?.lastName ?? '',
            bio: profile?.bio ?? '',
            location: profile?.location ?? '',
            website: profile?.website ?? '',
        },
    });

    const onSubmit = (values: z.infer<typeof profileSchema>) => {
        console.log(values, '✅ This will be type-safe and validated.');
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-[45px]">
                {Object.entries(fields).map(([key, { label, placeholder }]) =>
                    key === 'socialLinks' ? null : ( // Пропускаем сложные поля
                        <FormField
                            key={key}
                            control={form.control}
                            name={key as keyof typeof fields}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{label}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={placeholder} {...field} value={field.value ?? ''} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    )
                )}
            </form>
        </Form>
    );
};

export default ProfileForm;

