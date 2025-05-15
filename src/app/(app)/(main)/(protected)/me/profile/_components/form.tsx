'use client';

import type React from 'react';
import { useEffect, useMemo, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { isAxiosError } from 'axios';
import { motion } from 'framer-motion';
import {
    Eye,
    FileText,
    Globe,
    Hourglass,
    Loader2,
    MapPin,
    Shield,
    ShieldAlert,
    ShieldCheck,
    FilePenLineIcon as Signature,
    Trash2,
    User,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { FaUserSecret } from 'react-icons/fa6';
import { MdAddAPhoto } from 'react-icons/md';
import { toast } from 'sonner';
import { z } from 'zod';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

import HorizontalTabNav from '@/components/horizontal-tab-nav';
import LevelProgress from '@/components/reusable/level-progress';
import SignatureCanvas from '@/components/reusable/signature-canvas';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { mentorshipApiClient } from '@/server/mentorship';
import ProfileApiClient from '@/server/profile';
import S3ApiClient from '@/server/s3';
import { useUserStore } from '@/stores/user/user-store-provider';
import { ApplicationStatus, type MentorshipApplication } from '@/types/mentorship';

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
        transition: { duration: 0.4, ease: 'easeInOut', delay: i * 0.1 },
    }),
};

const fields: Record<
    Exclude<keyof z.infer<typeof profileSchema>, 'avatarUrl' | 'signatureUrl'>,
    { label: string | null; placeholder: string | null; icon: React.ReactNode }
> = {
    firstName: { label: 'Имя', placeholder: 'Иван', icon: <User className="h-4 w-4" /> },
    lastName: { label: 'Фамилия', placeholder: 'Кандинский', icon: <User className="h-4 w-4" /> },
    bio: { label: 'Биография', placeholder: 'Расскажите о себе', icon: <FileText className="h-4 w-4" /> },
    location: { label: 'Местоположение', placeholder: 'Москва, Россия', icon: <MapPin className="h-4 w-4" /> },
    website: { label: 'Веб-сайт', placeholder: 'https://example.com', icon: <Globe className="h-4 w-4" /> },
};

const ProfileForm = ({}) => {
    const [pending, setPending] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploadingSignatureFile, setIsUploadingSignatureFile] = useState(false);
    const [signatureSource, setSignatureSource] = useState<'draw' | 'upload'>('draw');

    const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus | null>(null);
    const [applicationDetails, setApplicationDetails] = useState<MentorshipApplication | null>(null);
    const [isCheckingApplication, setIsCheckingApplication] = useState(true);

    const [applicationReason, setApplicationReason] = useState('');
    const [isSubmittingApplication, setIsSubmittingApplication] = useState(false);

    const router = useRouter();
    const { user } = useUserStore((state) => state);

    const isMentor = useMemo(() => user?.roles?.includes('ROLE_MENTOR') || user?.roles?.includes('MENTOR'), [user]);

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

        const checkApplication = async () => {
            if (user && !isMentor) {
                setIsCheckingApplication(true);
                try {
                    const app = await mentorshipApiClient.getMyApplication();
                    setApplicationDetails(app);
                    setApplicationStatus(app ? app.status : null);
                } catch {
                    setApplicationStatus(null);
                    setApplicationDetails(null);
                } finally {
                    setIsCheckingApplication(false);
                }
            } else {
                setApplicationStatus(null);
                setApplicationDetails(null);
                setIsCheckingApplication(false);
            }
        };
        if (user) {
            checkApplication();
        }

        fetchData();
    }, [user, isMentor]);

    const handleApplyForMentorship = async () => {
        setIsSubmittingApplication(true);
        try {
            const newApplication = await mentorshipApiClient.applyForMentorship({ reason: applicationReason });
            if (newApplication) {
                toast.success('Заявка на менторство успешно подана!');
                setApplicationDetails(newApplication);
                setApplicationStatus(newApplication.status);
            }
        } catch (error: unknown) {
            if (isAxiosError(error) && error.response?.data?.message) {
                toast.error(`Ошибка: ${error.response.data.message}`);
            } else {
                toast.error('Не удалось подать заявку. Попробуйте позже.');
            }
            console.error('Mentorship application error:', error);
        } finally {
            setIsSubmittingApplication(false);
        }
    };

    const onSubmit = async (values: z.infer<typeof profileSchema>) => {
        setPending(true);
        const submissionValues = { ...values };

        try {
            await new ProfileApiClient().updateProfile(submissionValues);
            toast.success('Профиль успешно обновлён!');
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
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-6">
                <div className="md:col-span-4 lg:col-span-3">
                    <Skeleton className="h-[120px] w-[120px] rounded-full mx-auto" />
                    <Skeleton className="h-8 w-3/4 mx-auto mt-4" />
                    <Skeleton className="h-20 w-full mt-6" />
                </div>
                <div className="md:col-span-8 lg:col-span-9">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div key={index} className="space-y-2">
                                <Skeleton className="h-5 w-24" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        ))}
                        <div className="md:col-span-2 space-y-2">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-32 w-full" />
                        </div>
                    </div>
                </div>
            </div>
        );

    return (
        <div className="relative min-h-screen">
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#3eccb2]/5 via-transparent to-transparent"></div>
                <div className="absolute top-1/4 right-0 w-[40vw] h-[40vw] bg-gradient-to-bl from-[hsl(58,83%,62%)]/5 via-[hsl(68,27%,74%)]/5 to-transparent rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-1/3 w-[30vw] h-[30vw] bg-gradient-to-tr from-[hsl(173,58%,39%)]/5 via-[hsl(197,37%,24%)]/5 to-transparent rounded-full blur-3xl"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-6">
                <motion.div
                    className="md:col-span-4 lg:col-span-3 space-y-6"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Form {...form}>
                        <FormField
                            key="avatarUrl"
                            control={form.control}
                            name="avatarUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <div className="flex flex-col items-center">
                                            <div className="relative group">
                                                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#3eccb2]/80 via-[hsl(58,83%,62%)]/80 to-[hsl(173,58%,39%)]/80 blur-[2px] scale-[1.02] opacity-70 group-hover:opacity-100 transition-all duration-300"></div>
                                                <div className="relative size-[120px] rounded-full p-1 bg-gradient-to-r from-[#3eccb2] via-[hsl(58,83%,62%)] to-[hsl(173,58%,39%)]">
                                                    <Avatar className="size-full">
                                                        <AvatarImage src={field.value ?? ''} />
                                                        <AvatarFallback className="bg-white dark:bg-gray-900">
                                                            <FaUserSecret className="size-12" />
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <label
                                                        htmlFor="avatar-upload"
                                                        className="size-[36px] absolute flex items-center justify-center bg-gradient-to-r from-[#3eccb2] to-[hsl(173,58%,39%)] rounded-full -bottom-1 -right-1 opacity-90 z-50 hover:opacity-100 cursor-pointer shadow-lg transition-all duration-300 hover:scale-105"
                                                    >
                                                        <MdAddAPhoto className="text-white size-[18px]" />
                                                        <input
                                                            id="avatar-upload"
                                                            type="file"
                                                            className="hidden"
                                                            onChange={(e) =>
                                                                handleFileChange(e, 'avatarUrl', 'avatars')
                                                            }
                                                            accept={ALLOWED_TYPES.join(', ')}
                                                            disabled={pending}
                                                        />
                                                    </label>
                                                </div>
                                            </div>
                                            <h2 className="mt-4 text-xl font-semibold">
                                                {form.watch('firstName') || form.watch('lastName')
                                                    ? `${form.watch('firstName') || ''} ${form.watch('lastName') || ''}`
                                                    : 'Ваш профиль'}
                                            </h2>
                                            {user?.username && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => router.push(`/u/${user.username}`)}
                                                    title="Посмотреть как профиль видят другие"
                                                    className="mt-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-[#3eccb2]/30 dark:border-[#3eccb2]/20 hover:bg-white/90 dark:hover:bg-gray-900/90 hover:border-[#3eccb2]/50 transition-all"
                                                >
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    <span>Просмотр профиля</span>
                                                </Button>
                                            )}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </Form>

                    {user && (
                        <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-950/90 border border-gray-200/50 dark:border-gray-800/50 shadow-md overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-[#3eccb2]/5 via-[hsl(58,83%,62%)]/5 to-[hsl(173,58%,39%)]/5 opacity-50"></div>
                            <CardHeader className="relative z-10 pb-2">
                                <CardTitle className="text-lg font-bold text-[#3eccb2]">Ваш прогресс</CardTitle>
                            </CardHeader>
                            <CardContent className="relative z-10">
                                <LevelProgress
                                    level={user.level}
                                    currentXp={user.xp}
                                    xpForNextLevel={user.xpForNextLevel}
                                    dailyStreak={user.dailyStreak}
                                    className="text-base"
                                    showTooltip={true}
                                />
                                <p className="text-xs text-muted-foreground mt-2">
                                    Продолжайте учиться, чтобы открывать новые уровни и достижения!
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </motion.div>

                {/* Main content area */}
                <motion.div
                    className="md:col-span-8 lg:col-span-9"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Card className="backdrop-blur-sm bg-white/90 dark:bg-gray-950/90 border border-gray-200/50 dark:border-gray-800/50 shadow-md">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold text-[#3eccb2]">Личная информация</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {Object.entries(fields)
                                            .slice(0, 2)
                                            .map(([key, { label, placeholder, icon }], index) => (
                                                <FormField
                                                    key={key}
                                                    control={form.control}
                                                    name={key as keyof typeof fields}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="flex items-center gap-2 text-sm font-medium">
                                                                {icon}
                                                                {label}
                                                            </FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    placeholder={placeholder!}
                                                                    {...field}
                                                                    value={field.value ?? ''}
                                                                    disabled={pending}
                                                                    className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b-2 border-b-gray-200/50 dark:border-gray-800/50 focus-visible:border-b-[#3eccb2]/50 transition-all"
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            ))}
                                    </div>

                                    {Object.entries(fields)
                                        .slice(2, 4)
                                        .map(([key, { label, placeholder, icon }], index) => (
                                            <FormField
                                                key={key}
                                                control={form.control}
                                                name={key as keyof typeof fields}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="flex items-center gap-2 text-sm font-medium">
                                                            {icon}
                                                            {label}
                                                        </FormLabel>
                                                        <FormControl>
                                                            {key === 'bio' ? (
                                                                <Textarea
                                                                    placeholder={placeholder!}
                                                                    {...field}
                                                                    value={field.value ?? ''}
                                                                    disabled={pending}
                                                                    className="min-h-[120px] bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-800/50 focus-visible:ring-2 focus-visible:ring-[#3eccb2]/50 transition-all resize-none"
                                                                />
                                                            ) : (
                                                                <Input
                                                                    placeholder={placeholder!}
                                                                    {...field}
                                                                    value={field.value ?? ''}
                                                                    disabled={pending}
                                                                    className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b-2 border-b-gray-200/50 dark:border-gray-800/50 focus-visible:border-b-[#3eccb2]/50 transition-all"
                                                                />
                                                            )}
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        ))}

                                    {Object.entries(fields)
                                        .slice(4)
                                        .map(([key, { label, placeholder, icon }], index) => (
                                            <FormField
                                                key={key}
                                                control={form.control}
                                                name={key as keyof typeof fields}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="flex items-center gap-2 text-sm font-medium">
                                                            {icon}
                                                            {label}
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder={placeholder!}
                                                                {...field}
                                                                value={field.value ?? ''}
                                                                disabled={pending}
                                                                className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b-2 border-b-gray-200/50 dark:border-gray-800/50 focus-visible:border-b-[#3eccb2]/50 transition-all"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        ))}

                                    <div className="pt-4 border-t border-gray-200/50 dark:border-gray-800/50">
                                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[#3eccb2]">
                                            <Shield className="size-5" />
                                            Статус ментора
                                        </h3>

                                        {isCheckingApplication && !isMentor && (
                                            <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground p-4 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-200/30 dark:border-gray-800/30 shadow-sm">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Проверяем статус вашей заявки...
                                            </div>
                                        )}

                                        {!isCheckingApplication && isMentor && (
                                            <div className="flex items-center gap-2 text-sm mb-4 text-green-600 dark:text-green-400 p-4 bg-gradient-to-r from-green-500/5 to-emerald-500/5 backdrop-blur-sm rounded-xl border border-green-200/30 dark:border-green-800/30 shadow-sm">
                                                <ShieldCheck className="h-5 w-5" />
                                                Вы являетесь ментором.
                                            </div>
                                        )}

                                        {!isCheckingApplication &&
                                            !isMentor &&
                                            applicationStatus === ApplicationStatus.PENDING && (
                                                <div className="flex items-center gap-2 text-sm mb-4 text-[hsl(173,58%,39%)] dark:text-[#3eccb2] p-4 bg-gradient-to-r from-[#3eccb2]/5 to-[hsl(173,58%,39%)]/5 backdrop-blur-sm rounded-xl border border-[#3eccb2]/30 dark:border-[#3eccb2]/20 shadow-sm">
                                                    <Hourglass className="h-5 w-5" />
                                                    Ваша заявка на менторство находится на рассмотрении.
                                                </div>
                                            )}

                                        {!isCheckingApplication &&
                                            !isMentor &&
                                            applicationStatus === ApplicationStatus.REJECTED && (
                                                <div className="flex flex-col gap-2 text-sm text-red-600 mb-4 dark:text-red-400 p-4 bg-gradient-to-r from-red-500/5 to-rose-500/5 backdrop-blur-sm rounded-xl border border-red-200/30 dark:border-red-800/30 shadow-sm">
                                                    <div className="flex items-center gap-2">
                                                        <ShieldAlert className="h-5 w-5" />
                                                        Ваша заявка на менторство была отклонена.
                                                    </div>
                                                    {applicationDetails?.rejectionReason && (
                                                        <p className="text-xs pl-7">
                                                            Причина: {applicationDetails.rejectionReason}
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                        {!isCheckingApplication && !isMentor && !applicationStatus && (
                                            <>
                                                <p className="text-sm text-muted-foreground mb-4">
                                                    Хотите делиться своими знаниями и создавать курсы? Подайте заявку!
                                                </p>

                                                <Textarea
                                                    placeholder="Расскажите, почему вы хотите стать ментором (необязательно)"
                                                    value={applicationReason}
                                                    onChange={(e) => setApplicationReason(e.target.value)}
                                                    className="mb-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-800/50 focus-visible:ring-2 focus-visible:ring-[#3eccb2]/50 transition-all resize-none"
                                                    rows={3}
                                                    disabled={isSubmittingApplication}
                                                />
                                                <Button
                                                    onClick={handleApplyForMentorship}
                                                    isLoading={isSubmittingApplication}
                                                    disabled={isSubmittingApplication}
                                                    className="bg-gradient-to-r from-[#3eccb2] to-[hsl(173,58%,39%)] hover:from-[hsl(173,58%,39%)] hover:to-[#3eccb2] text-white shadow-md hover:shadow-[#3eccb2]/20 transition-all duration-300"
                                                >
                                                    Подать заявку на менторство
                                                </Button>
                                            </>
                                        )}

                                        {isMentor && (
                                            <div className="space-y-3 mt-6">
                                                <h4 className="flex items-center gap-2 text-base font-medium text-[#3eccb2]">
                                                    <Signature className="size-5" />
                                                    Ваша подпись (для сертификатов)
                                                </h4>
                                                <Tabs
                                                    value={signatureSource}
                                                    onValueChange={(value) =>
                                                        setSignatureSource(value as 'draw' | 'upload')
                                                    }
                                                    className="w-full"
                                                >
                                                    <TabsList className="grid w-full grid-cols-2 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm p-1 rounded-xl">
                                                        <TabsTrigger
                                                            value="draw"
                                                            className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#3eccb2] data-[state=active]:to-[hsl(173,58%,39%)] data-[state=active]:text-white"
                                                        >
                                                            Нарисовать
                                                        </TabsTrigger>
                                                        <TabsTrigger
                                                            value="upload"
                                                            className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#3eccb2] data-[state=active]:to-[hsl(173,58%,39%)] data-[state=active]:text-white"
                                                        >
                                                            Загрузить файл
                                                        </TabsTrigger>
                                                    </TabsList>
                                                    <TabsContent value="draw" className="mt-4">
                                                        <div className="p-[1px] bg-gradient-to-r from-[#3eccb2] via-[hsl(58,83%,62%)] to-[hsl(173,58%,39%)]">
                                                            <div className="bg-white dark:bg-gray-900 overflow-hidden py-4">
                                                                <SignatureCanvas
                                                                    onSave={handleSaveSignatureFromCanvas}
                                                                    initialDataUrl={
                                                                        currentSignatureUrl?.startsWith('data:image/')
                                                                            ? currentSignatureUrl
                                                                            : null
                                                                    }
                                                                    disabled={pending}
                                                                    width={450}
                                                                    height={180}
                                                                />
                                                            </div>
                                                        </div>
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
                                                                                        handleFileChange(
                                                                                            e,
                                                                                            'signatureUrl',
                                                                                            'signatures'
                                                                                        );
                                                                                    }}
                                                                                    disabled={
                                                                                        pending ||
                                                                                        isUploadingSignatureFile
                                                                                    }
                                                                                    className="flex-1 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-800/50 focus-visible:ring-2 focus-visible:ring-[#3eccb2]/50 transition-all"
                                                                                />
                                                                                {isUploadingSignatureFile && (
                                                                                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                                                                )}
                                                                            </div>
                                                                            {field.value &&
                                                                                !isUploadingSignatureFile && (
                                                                                    <div className="mt-2 p-3 border rounded-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-gray-200/30 dark:border-gray-800/30 shadow-sm">
                                                                                        <p className="text-xs text-muted-foreground mb-1">
                                                                                            Текущая подпись (файл):
                                                                                        </p>
                                                                                        <div className="p-[1px] bg-gradient-to-r from-[#3eccb2] via-[hsl(58,83%,62%)] to-[hsl(173,58%,39%)] rounded-lg inline-block">
                                                                                            <Image
                                                                                                src={
                                                                                                    field.value ||
                                                                                                    '/placeholder.svg'
                                                                                                }
                                                                                                alt="Предпросмотр подписи"
                                                                                                width={150}
                                                                                                height={50}
                                                                                                className="rounded border bg-white object-contain"
                                                                                            />
                                                                                        </div>
                                                                                        <Button
                                                                                            type="button"
                                                                                            variant="link"
                                                                                            size="sm"
                                                                                            className="text-xs text-destructive p-0 h-auto mt-1"
                                                                                            onClick={() =>
                                                                                                field.onChange(null)
                                                                                            }
                                                                                            disabled={
                                                                                                pending ||
                                                                                                isUploadingSignatureFile
                                                                                            }
                                                                                        >
                                                                                            <Trash2 className="mr-1 h-3 w-3" />
                                                                                            Удалить подпись
                                                                                        </Button>
                                                                                    </div>
                                                                                )}
                                                                        </>
                                                                    </FormControl>
                                                                    <FormDescription>
                                                                        Загрузите изображение вашей подписи (прозрачный
                                                                        фон рекомендуется, .png). Макс. размер 1MB.
                                                                    </FormDescription>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </TabsContent>
                                                </Tabs>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <Button
                                            type="submit"
                                            className="px-8 bg-gradient-to-r from-[#3eccb2] to-[hsl(173,58%,39%)] hover:from-[hsl(173,58%,39%)] hover:to-[#3eccb2] text-white shadow-md hover:shadow-[#3eccb2]/20 transition-all duration-300 ease-in-out font-semibold hover:text-white"
                                            isLoading={pending}
                                        >
                                            {pending ? 'Сохранение...' : 'Сохранить изменения'}
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
};

export default ProfileForm;
