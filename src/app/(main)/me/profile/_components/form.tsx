'use client';

import { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { FaUserSecret } from 'react-icons/fa6';
import { MdAddAPhoto } from 'react-icons/md';
import { toast } from 'sonner';
import { z } from 'zod';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Profile } from '@/models';
import ProfileApiClient from '@/server/profile';
import S3ApiClient from '@/server/s3';

const profileSchema = z.object({
    avatarUrl: z.string().nullable(),
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
    bio: z.string().nullable(),
    location: z.string().nullable(),
    website: z.string().nullable(),
});

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const fields: Record<
    Exclude<keyof z.infer<typeof profileSchema>, 'avatarUrl'>,
    { label: string | null; placeholder: string | null }
> = {
    firstName: { label: 'Имя', placeholder: 'Иван' },
    lastName: { label: 'Фамилия', placeholder: 'Кандинский' },
    bio: { label: 'Биография', placeholder: 'Расскажите о себе' },
    location: { label: 'Местоположение', placeholder: 'Москва, Россия' },
    website: { label: 'Веб-сайт', placeholder: 'https://example.com' },
};

const ProfileForm = ({}) => {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [pending, setPending] = useState(true);

    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            firstName: profile?.firstName,
            lastName: profile?.lastName,
            bio: profile?.bio,
            location: profile?.location,
            website: profile?.website,
            avatarUrl: profile?.avatarUrl,
        },
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const profileData = await new ProfileApiClient().getProfile();
                if (!profileData) {
                    return;
                }
                setProfile(profileData);
                form.reset(profileData);
            } catch (e) {
                console.error(e);
            } finally {
                setPending(false);
            }
        };

        fetchData();
    }, [form]);

    const onSubmit = async (values: z.infer<typeof profileSchema>) => {
        try {
            setPending(true);
            await new ProfileApiClient().updateProfile(values);
            toast.success('Профиль успешно обновлён!');
        } catch (error) {
            console.error('Ошибка при обновлении профиля:', error);
            alert('Ошибка при обновлении профиля');
        } finally {
            setPending(false);
        }
    };

    const uploadAvatar = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await new S3ApiClient().uploadFile(
                file,
                'avatars'
            );

            if (!response) throw new Error('Ошибка загрузки файла');

            form.setValue('avatarUrl', response.url); // Обновляем ссылку на фото в форме
        } catch (error) {
            console.error(error);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!ALLOWED_TYPES.includes(file.type)) {
            alert('Разрешены только изображения (JPEG, PNG, WEBP)');
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            alert('Файл слишком большой. Максимальный размер: 5MB');
            return;
        }

        uploadAvatar(file);
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 px-[45px] mt-10"
            >
                <FormField
                    key="avatarUrl"
                    control={form.control}
                    name="avatarUrl"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <div className="relative mx-auto">
                                    <Avatar className="size-[60px]">
                                        <AvatarImage
                                            src={form.watch('avatarUrl') ?? ''}
                                        />
                                        <AvatarFallback>
                                            <FaUserSecret className="size-8" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <label className="size-[28px] absolute flex items-center justify-center bg-[#050505] rounded-full -bottom-1 -right-2 opacity-75 z-50 hover:bg-[#050505]/80 cursor-pointer">
                                        <MdAddAPhoto className="text-gray-200 size-[14px]" />
                                        <input
                                            type="file"
                                            className="hidden"
                                            onChange={handleFileChange}
                                            accept={ALLOWED_TYPES.join(', ')}
                                            disabled={pending}
                                        />
                                    </label>
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {Object.entries(fields).map(
                    (
                        [key, { label, placeholder }] // Пропускаем сложные поля
                    ) => (
                        <FormField
                            key={key}
                            control={form.control}
                            name={key as keyof typeof fields}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{label}</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder={placeholder!}
                                            {...field}
                                            value={field.value ?? ''}
                                            disabled={pending}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )
                )}
                <Button
                    type="submit"
                    className="max-w-[179px] w-full mx-auto mt-10"
                    isLoading={pending}
                >
                    {pending ? 'Загрузка...' : 'Сохранить'}
                </Button>
            </form>
        </Form>
    );
};

export default ProfileForm;

