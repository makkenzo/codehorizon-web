'use client';

import { useEffect, useRef, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Eye, Loader2, Signature, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { FaUserSecret } from 'react-icons/fa6';
import { MdAddAPhoto } from 'react-icons/md';
import { toast } from 'sonner';
import { z } from 'zod';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import SignatureCanvas from '@/components/reusable/signature-canvas';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Profile } from '@/models';
import ProfileApiClient from '@/server/profile';
import S3ApiClient from '@/server/s3';
import { useUserStore } from '@/stores/user/user-store-provider';

const profileSchema = z.object({
    avatarUrl: z.string().nullable(),
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
    bio: z.string().nullable(),
    location: z.string().nullable(),
    website: z.string().nullable(),
    signatureUrl: z.string().nullable().optional(),
});

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const formVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: 'easeInOut', delay: (i + 3) * 0.1 },
    }),
};

const fields: Record<
    Exclude<keyof z.infer<typeof profileSchema>, 'avatarUrl' | 'signatureUrl'>,
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
    const [isLoading, setIsLoading] = useState(true);
    const [isUploadingSignatureFile, setIsUploadingSignatureFile] = useState(false);
    const [signatureSource, setSignatureSource] = useState<'draw' | 'upload'>('draw');
    const signatureCanvasRef = useRef<{ clear: () => void; getDataURL: () => string }>(null);

    const router = useRouter();
    const { user } = useUserStore((state) => state);
    const isMentor = user?.roles?.includes('ROLE_MENTOR') || user?.roles?.includes('MENTOR');

    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            bio: '',
            location: '',
            website: '',
            avatarUrl: null,
            signatureUrl: null,
        },
    });

    const currentSignatureUrl = form.watch('signatureUrl');

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const profileData = await new ProfileApiClient().getProfile();
                if (!profileData) {
                    return;
                }
                setProfile(profileData);
                form.reset({
                    ...profileData,
                    signatureUrl: profileData.signatureUrl ?? null,
                });
                if (profileData.signatureUrl && !profileData.signatureUrl.startsWith('data:image/')) {
                    setSignatureSource('upload');
                }
            } catch (e) {
                console.error(e);
                toast.error('Не удалось загрузить профиль.');
            } finally {
                setPending(false);
                setIsLoading(false);
            }
        };

        fetchData();
    }, [form]);

    const onSubmit = async (values: z.infer<typeof profileSchema>) => {
        setPending(true);
        let submissionValues = { ...values };

        try {
            await new ProfileApiClient().updateProfile(submissionValues);
            toast.success('Профиль успешно обновлён!');
            setProfile((prev) => ({ ...prev, ...submissionValues }) as Profile);
        } catch (error) {
            console.error('Ошибка при обновлении профиля:', error);
            toast.error('Ошибка при обновлении профиля');
        } finally {
            setPending(false);
        }
    };

    const handleSaveSignatureFromCanvas = (dataUrl: string) => {
        const isEmptyCanvas =
            dataUrl ===
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

        if (!isEmptyCanvas && dataUrl.length > 100) {
            form.setValue('signatureUrl', dataUrl, { shouldValidate: true, shouldDirty: true });
            toast.success(
                'Нарисованная подпись временно сохранена. Нажмите "Сохранить" для окончательного сохранения профиля.'
            );
        } else {
            toast.info('Пожалуйста, нарисуйте подпись перед сохранением.');
        }
    };

    const uploadFile = async (file: File, directory: string, fieldName: 'avatarUrl' | 'signatureUrl') => {
        if (fieldName === 'signatureUrl') setIsUploadingSignatureFile(true);
        else setPending(true);

        try {
            const response = await new S3ApiClient().uploadFile(file, directory);
            if (!response?.url) throw new Error('Ошибка загрузки файла');
            form.setValue(fieldName, response.url);
            toast.success(`${fieldName === 'avatarUrl' ? 'Аватар' : 'Подпись'} успешно загружен(а).`);
        } catch (error) {
            console.error(error);
            toast.error(`Ошибка загрузки ${fieldName === 'avatarUrl' ? 'аватара' : 'подписи'}.`);
        } finally {
            if (fieldName === 'signatureUrl') setIsUploadingSignatureFile(false);
            else setPending(false);
        }
    };

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        fieldName: 'avatarUrl' | 'signatureUrl',
        directory: string
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!ALLOWED_TYPES.includes(file.type)) {
            toast.error('Разрешены только изображения (JPEG, PNG, WEBP)');
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            toast.error('Файл слишком большой. Максимальный размер: 5MB');
            return;
        }
        uploadFile(file, directory, fieldName);
    };

    if (isLoading)
        return (
            <div className="space-y-4 px-[45px] mt-10">
                <div className="relative mx-auto w-fit">
                    <Skeleton className="size-[60px] rounded-full" />
                </div>
                {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex flex-col gap-2">
                        <Skeleton className="h-[14px] w-[60px]" />
                        <Skeleton className="h-[36px]" />
                    </div>
                ))}
                <Skeleton className="w-[179px] h-[41px] mx-auto mt-10" />
            </div>
        );

    return (
        <div className="mb-20">
            <Form {...form}>
                {user?.username && (
                    <div className="flex justify-end mb-6 md:px-[45px]">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/u/${user.username}`)}
                            title="Посмотреть как профиль видят другие"
                        >
                            <Eye className="mr-2 h-4 w-4" />
                            Просмотр
                        </Button>
                    </div>
                )}
                <motion.form
                    initial="hidden"
                    animate="visible"
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4 md:px-[45px] mt-10"
                >
                    <FormField
                        key="avatarUrl"
                        control={form.control}
                        name="avatarUrl"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <motion.div className="relative mx-auto" variants={formVariants} custom={0}>
                                        <Avatar className="size-[60px]">
                                            <AvatarImage src={field.value ?? ''} />
                                            <AvatarFallback>
                                                <FaUserSecret className="size-8" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <label
                                            htmlFor="avatar-upload"
                                            className="size-[28px] absolute flex items-center justify-center bg-[#050505] rounded-full -bottom-1 -right-2 opacity-75 z-50 hover:bg-[#050505]/80 cursor-pointer"
                                        >
                                            <MdAddAPhoto className="text-gray-200 size-[14px]" />
                                            <input
                                                id="avatar-upload"
                                                type="file"
                                                className="hidden"
                                                onChange={(e) => handleFileChange(e, 'avatarUrl', 'avatars')}
                                                accept={ALLOWED_TYPES.join(', ')}
                                                disabled={pending}
                                            />
                                        </label>
                                    </motion.div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {Object.entries(fields).map(([key, { label, placeholder }], index) => (
                        <FormField
                            key={key}
                            control={form.control}
                            name={key as keyof typeof fields}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        <motion.label variants={formVariants} custom={index + 1}>
                                            {label}
                                        </motion.label>
                                    </FormLabel>
                                    <FormControl>
                                        <motion.div variants={formVariants} custom={index + 1}>
                                            <Input
                                                placeholder={placeholder!}
                                                {...field}
                                                value={field.value ?? ''}
                                                disabled={pending}
                                            />
                                        </motion.div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    ))}
                    {isMentor && (
                        <motion.div
                            variants={formVariants}
                            custom={Object.keys(fields).length + 1}
                            className="space-y-3"
                        >
                            <FormLabel className="flex items-center gap-2 text-base">
                                <Signature className="size-5" />
                                Ваша подпись (для сертификатов)
                            </FormLabel>
                            <Tabs
                                value={signatureSource}
                                onValueChange={(value) => setSignatureSource(value as 'draw' | 'upload')}
                                className="w-full"
                            >
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="draw">Нарисовать</TabsTrigger>
                                    <TabsTrigger value="upload">Загрузить файл</TabsTrigger>
                                </TabsList>
                                <TabsContent value="draw" className="mt-4">
                                    <SignatureCanvas
                                        onSave={handleSaveSignatureFromCanvas}
                                        initialDataUrl={
                                            currentSignatureUrl?.startsWith('data:image/') ? currentSignatureUrl : null
                                        }
                                        disabled={pending}
                                        width={450}
                                        height={180}
                                    />
                                </TabsContent>
                                <TabsContent value="upload" className="mt-4 space-y-2">
                                    <FormField
                                        control={form.control}
                                        name="signatureUrl"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <>
                                                        <div className="flex items-center gap-2">
                                                            <Input
                                                                id="signature-file-upload"
                                                                type="file"
                                                                accept={ALLOWED_TYPES.join(', ')}
                                                                onChange={(e) => {
                                                                    handleFileChange(e, 'signatureUrl', 'signatures');
                                                                }}
                                                                disabled={pending || isUploadingSignatureFile}
                                                                className="flex-1"
                                                            />
                                                            {isUploadingSignatureFile && (
                                                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                                            )}
                                                        </div>
                                                        {field.value && !isUploadingSignatureFile && (
                                                            <div className="mt-2 p-2 border rounded-md bg-muted/50">
                                                                <p className="text-xs text-muted-foreground mb-1">
                                                                    Текущая подпись (файл):
                                                                </p>
                                                                <Image
                                                                    src={field.value}
                                                                    alt="Предпросмотр подписи"
                                                                    width={150}
                                                                    height={50}
                                                                    className="rounded border bg-white object-contain"
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    variant="link"
                                                                    size="sm"
                                                                    className="text-xs text-destructive p-0 h-auto mt-1"
                                                                    onClick={() => field.onChange(null)}
                                                                    disabled={pending || isUploadingSignatureFile}
                                                                >
                                                                    <Trash2 className="mr-1 h-3 w-3" />
                                                                    Удалить подпись
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </>
                                                </FormControl>
                                                <FormDescription>
                                                    Загрузите изображение вашей подписи (прозрачный фон рекомендуется,
                                                    .png). Макс. размер 1MB.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </TabsContent>
                            </Tabs>
                        </motion.div>
                    )}
                    <motion.div variants={formVariants} custom={Object.keys(fields).length + 1}>
                        <Button type="submit" className="max-w-[179px] w-full mx-auto mt-10" isLoading={pending}>
                            {pending ? 'Загрузка...' : 'Сохранить'}
                        </Button>
                    </motion.div>
                </motion.form>
            </Form>
        </div>
    );
};

export default ProfileForm;
