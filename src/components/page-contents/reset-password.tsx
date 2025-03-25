'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { PiHandWavingDuotone } from 'react-icons/pi';
import { z } from 'zod';

import { useSearchParams } from 'next/navigation';

import Logo from '@/components/reusable/logo';
import { BlurFade } from '@/components/ui/blur-fade';
import { BoxReveal } from '@/components/ui/box-reveal';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import AuthApiClient from '@/server/auth';

const formSchema = z
    .object({
        password: z
            .string({ message: 'Обязательно для заполнения' })
            .min(8, { message: 'Пароль должен быть не менее 8 символов' })
            .max(50, { message: 'Пароль должен быть не более 50 символов' })
            .trim(),
        confirmPassword: z.string({ message: 'Обязательно для заполнения' }).trim(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Пароли не совпадают',
        path: ['confirmPassword'],
    });

const ANIMATION_DELAYS = {
    WELCOME: 0,
    SIGNUP_TEXT: 0.1,
    USERNAME: 0.2,
    PASSWORD: 0.3,
    SUBMIT: 0.4,
    FORGOT_PASSWORD: 0.5,
};

const ResetPasswordPageContent = () => {
    const searchParams = useSearchParams();

    const token = searchParams.get('token');
    // if (!token) {
    //     window.location.href = '/sign-in';
    // }
    const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setStatus('loading');
        setErrorMessage(null);

        try {
            const isPasswordChanged = await new AuthApiClient().resetPassword(
                token!,
                values.password,
                values.confirmPassword
            );
            if (isPasswordChanged) {
                window.location.href = '/sign-in';
                setStatus('success');
                return;
            } else {
                setErrorMessage('Пароль не изменен. Пожалуйста, попробуйте еще раз.');
                setStatus('error');
            }
        } catch {
            setErrorMessage('Аккаунт не найден. Пожалуйста, попробуйте еще раз.');
            setStatus('error');
        }
    };
    return (
        <AnimatePresence>
            <motion.div
                key="sign-in-page"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-5 h-screen"
            >
                <motion.div
                    layout
                    layoutId="panel-left"
                    className="bg-primary lg:block hidden col-span-3 m-4 rounded-md"
                >
                    <div className="flex flex-col h-full justify-between pt-60 px-30 pb-10">
                        <div className="flex flex-col gap-10">
                            <BoxReveal duration={0.5} boxColor="#fff">
                                <Logo showText={false} size={120} />
                            </BoxReveal>
                            <BoxReveal duration={0.5} boxColor="#fff">
                                <h1 className="text-5xl leading-18 font-bold text-white">
                                    Привет от
                                    <br />
                                    CodeHorizon!{' '}
                                    <span className="inline-block translate-y-1">
                                        <PiHandWavingDuotone />
                                    </span>
                                </h1>
                            </BoxReveal>
                            <div className="max-w-2/3">
                                <BoxReveal duration={0.5} boxColor="#fff">
                                    <p className="text-xl text-white/90 font-semibold ">
                                        Войдите в свой аккаунт, чтобы получить доступ к курсам и тестам. Если у вас нет
                                        аккаунта, зарегистрируйтесь и начните учёбу уже сегодня!
                                    </p>
                                </BoxReveal>
                            </div>
                        </div>
                        <div>
                            <BoxReveal duration={0.5} boxColor="#fff">
                                <p className="text-white">
                                    © {new Date().getFullYear()} CodeHorizon. Все права защищены.
                                </p>
                            </BoxReveal>
                        </div>
                    </div>
                </motion.div>
                <motion.div
                    layout
                    layoutId="panel-right"
                    className="col-span-1 lg:col-span-2 justify-center flex flex-col gap-6 3xl:pl-36 3xl:pr-40 2xl:pl-20 2xl:pr-24 px-8"
                >
                    <div className="flex flex-col gap-2">
                        <BlurFade delay={ANIMATION_DELAYS.WELCOME} className="mb-8 lg:hidden">
                            <Logo />
                        </BlurFade>
                        <BlurFade delay={ANIMATION_DELAYS.WELCOME}>
                            <h2 className="text-3xl font-bold">Восстановление пароля</h2>
                        </BlurFade>
                        <BlurFade delay={ANIMATION_DELAYS.SIGNUP_TEXT}>
                            <p className="text-border">Заполните форму для создания нового пароля</p>
                        </BlurFade>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <BlurFade delay={ANIMATION_DELAYS.PASSWORD}>
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xl">Пароль</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="my$super@password"
                                                    type="password"
                                                    className="!text-lg"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </BlurFade>
                            <BlurFade delay={ANIMATION_DELAYS.PASSWORD}>
                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xl">Подтвердите пароль</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="my$super@password"
                                                    type="password"
                                                    className="!text-lg"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </BlurFade>
                            <BlurFade delay={ANIMATION_DELAYS.SUBMIT}>
                                <Button type="submit" size="lg" className="w-full" isLoading={status === 'loading'}>
                                    Завершить
                                </Button>
                            </BlurFade>
                            {status === 'error' && errorMessage && (
                                <p className="text-destructive text-sm">{errorMessage}</p>
                            )}
                        </form>
                    </Form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ResetPasswordPageContent;
