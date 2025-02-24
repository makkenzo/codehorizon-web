'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { FaArrowRightLong } from 'react-icons/fa6';
import { PiHandWavingDuotone } from 'react-icons/pi';
import { z } from 'zod';

import Link from 'next/link';

import Logo from '@/components/reusable/logo';
import { BlurFade } from '@/components/ui/blur-fade';
import { BoxReveal } from '@/components/ui/box-reveal';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import usePreservePreviousRoute from '@/hooks/use-prev-route';
import AuthApiClient from '@/server/auth';

const formSchema = z.object({
    login: z
        .string({ message: 'Обязательно для заполнения' })
        .min(1, { message: 'Обязательно для заполнения' })
        .max(50, { message: 'Имя пользователя должно быть не более 50 символов' })
        .trim(),
});

const ANIMATION_DELAYS = {
    WELCOME: 0,
    SIGNUP_TEXT: 0.1,
    USERNAME: 0.2,
    SUBMIT: 0.3,
    FORGOT_PASSWORD: 0.4,
};

const ForgotPasswordPageContent = () => {
    const previousRoute = usePreservePreviousRoute();

    const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            login: '',
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setStatus('loading');
        setErrorMessage(null);

        try {
            const isMailSent = await new AuthApiClient().isLoginExists(values.login);
            if (isMailSent) {
                setStatus('success');
            } else {
                throw new Error('Аккаунт не найден. Пожалуйста, попробуйте еще раз.');
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
                initial={{ opacity: previousRoute?.includes('sign-in') ? 1 : 0 }}
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
                            {previousRoute?.includes('sign-in') ? (
                                <Logo showText={false} size={120} />
                            ) : (
                                <BoxReveal duration={0.5} boxColor="#fff">
                                    <Logo showText={false} size={120} />
                                </BoxReveal>
                            )}
                            {previousRoute?.includes('sign-in') ? (
                                <h1 className="text-5xl leading-18 font-bold text-white">
                                    Привет от
                                    <br />
                                    CodeHorizon!{' '}
                                    <span className="inline-block translate-y-1">
                                        <PiHandWavingDuotone />
                                    </span>
                                </h1>
                            ) : (
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
                            )}

                            <div className="max-w-2/3">
                                {previousRoute?.includes('sign-in') ? (
                                    <p className="text-xl text-white/90 font-semibold ">
                                        Войдите в свой аккаунт, чтобы получить доступ к курсам и тестам. Если у вас нет
                                        аккаунта, зарегистрируйтесь и начните учёбу уже сегодня!
                                    </p>
                                ) : (
                                    <BoxReveal duration={0.5} boxColor="#fff">
                                        <p className="text-xl text-white/90 font-semibold ">
                                            Войдите в свой аккаунт, чтобы получить доступ к курсам и тестам. Если у вас
                                            нет аккаунта, зарегистрируйтесь и начните учёбу уже сегодня!
                                        </p>
                                    </BoxReveal>
                                )}
                            </div>
                        </div>
                        <div>
                            {previousRoute?.includes('sign-in') ? (
                                <p className="text-white">
                                    © {new Date().getFullYear()} CodeHorizon. Все права защищены.
                                </p>
                            ) : (
                                <BoxReveal duration={0.5} boxColor="#fff">
                                    <p className="text-white">
                                        © {new Date().getFullYear()} CodeHorizon. Все права защищены.
                                    </p>
                                </BoxReveal>
                            )}
                        </div>
                    </div>
                </motion.div>
                <motion.div
                    layout
                    layoutId="panel-right"
                    className="col-span-1 lg:col-span-2 justify-center flex flex-col gap-6 3xl:pl-36 3xl:pr-40 2xl:pl-20 2xl:pr-24 px-8"
                >
                    {status !== 'success' && (
                        <div className="flex flex-col gap-2">
                            <BlurFade delay={ANIMATION_DELAYS.WELCOME} className="mb-8 lg:hidden">
                                <Logo />
                            </BlurFade>
                            <BlurFade delay={ANIMATION_DELAYS.WELCOME}>
                                <h2 className="text-3xl font-bold">Забыли пароль?</h2>
                            </BlurFade>
                            <BlurFade delay={ANIMATION_DELAYS.SIGNUP_TEXT}>
                                <p className="text-border">Не проблема!</p>
                            </BlurFade>
                        </div>
                    )}
                    {status === 'success' ? (
                        <motion.div
                            key="success-message"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 50 }}
                            transition={{ duration: 0.3 }}
                            className="flex flex-col gap-2"
                        >
                            <h2 className="text-3xl font-bold">Подтверждение действия</h2>
                            <p className="text-lg mt-4">
                                На ваш e-mail отправлена ссылка для сброса пароля. Пожалуйста, проверьте вашу почту.
                            </p>
                        </motion.div>
                    ) : (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                <BlurFade delay={ANIMATION_DELAYS.USERNAME}>
                                    <FormField
                                        control={form.control}
                                        name="login"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xl">Имя пользователя / E-mail</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="just_student"
                                                        type="text"
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
                                        Далее <FaArrowRightLong />
                                    </Button>
                                </BlurFade>
                                {status === 'error' && errorMessage && (
                                    <p className="text-destructive text-sm">{errorMessage}</p>
                                )}
                                <BlurFade delay={ANIMATION_DELAYS.FORGOT_PASSWORD}>
                                    <p className="text-center">
                                        Уже вспомнили пароль?{' '}
                                        <Link href={'/sign-in'}>
                                            <Button
                                                variant="link"
                                                size="link"
                                                className="inline-block text-border font-semibold underline hover:text-border/80"
                                            >
                                                Попробуйте войти
                                            </Button>
                                        </Link>
                                    </p>
                                </BlurFade>
                            </form>
                        </Form>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ForgotPasswordPageContent;

