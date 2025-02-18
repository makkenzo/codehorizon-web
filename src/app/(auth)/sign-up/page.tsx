'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { FaWandMagicSparkles } from 'react-icons/fa6';
import { z } from 'zod';

import Link from 'next/link';

import Logo from '@/components/reusable/logo';
import { BlurFade } from '@/components/ui/blur-fade';
import { BoxReveal } from '@/components/ui/box-reveal';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const ANIMATION_DELAYS = {
    WELCOME: 0,
    SIGNUP_TEXT: 0.1,
    USERNAME: 0.2,
    PASSWORD: 0.3,
    SUBMIT: 0.4,
    FORGOT_PASSWORD: 0.5,
};

const formSchema = z
    .object({
        username: z
            .string({ message: 'Обязательно для заполнения' })
            .min(6, { message: 'Имя пользователя должно быть не менее 6 символов' })
            .max(50, { message: 'Имя пользователя должно быть не более 50 символов' })
            .trim(),
        email: z
            .string({ message: 'Обязательно для заполнения' })
            .email({ message: 'Неверный формат электронной почты' })
            .trim(),
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

const SignUpPage = () => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: '',
        },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        console.log(values);
    };

    return (
        <AnimatePresence>
            <motion.div
                key="sign-in-page"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-5 h-screen"
            >
                <motion.div
                    layout
                    layoutId="panel-right"
                    className="col-span-2 justify-center flex flex-col gap-6 3xl:pl-36 3xl:pr-40 pl-16 pr-20"
                >
                    <div className="flex flex-col gap-2">
                        <BlurFade delay={ANIMATION_DELAYS.WELCOME}>
                            <h2 className="text-3xl font-bold">Регистрация</h2>
                        </BlurFade>
                        <BlurFade delay={ANIMATION_DELAYS.SIGNUP_TEXT}>
                            <p className="text-border">Войти в IT - это просто</p>
                        </BlurFade>
                    </div>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <BlurFade delay={ANIMATION_DELAYS.USERNAME}>
                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xl">Имя пользователя</FormLabel>
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
                            <BlurFade delay={ANIMATION_DELAYS.USERNAME}>
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xl">E-mail</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="juststudent@example.com"
                                                    type="email"
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
                                <p className="text-xs">
                                    Я согласен с{' '}
                                    <Link href="/legal/terms">
                                        <Button
                                            variant="link"
                                            size="link"
                                            className="inline-block text-border underline hover:text-border/80"
                                        >
                                            Условиями и положениями
                                        </Button>
                                    </Link>{' '}
                                    и{' '}
                                    <Link href="/legal/privacy">
                                        <Button
                                            variant="link"
                                            size="link"
                                            className="inline-block text-border underline hover:text-border/80"
                                        >
                                            Политикой конфиденциальности
                                        </Button>
                                    </Link>
                                </p>
                            </BlurFade>
                            <BlurFade delay={ANIMATION_DELAYS.SUBMIT}>
                                <Button type="submit" size="lg" className="w-full">
                                    Зарегистрироваться
                                </Button>
                            </BlurFade>
                            <BlurFade delay={ANIMATION_DELAYS.FORGOT_PASSWORD}>
                                <p className="text-center">
                                    Уже есть аккаунт?{' '}
                                    <Link href={'/sign-in'}>
                                        <Button
                                            variant="link"
                                            size="link"
                                            className="inline-block text-border font-semibold underline hover:text-border/80"
                                        >
                                            Войти
                                        </Button>
                                    </Link>
                                </p>
                            </BlurFade>
                        </form>
                    </Form>
                </motion.div>
                <motion.div layout layoutId="panel-left" className="bg-primary col-span-3 m-4 rounded-md">
                    <div className="flex flex-col h-full justify-between pt-60 px-30 pb-10">
                        <div className="flex flex-col gap-10">
                            <BoxReveal duration={0.5} boxColor="#fff">
                                <Logo showText={false} size={120} />
                            </BoxReveal>
                            <BoxReveal duration={0.5} boxColor="#fff">
                                <h1 className="text-5xl leading-18 font-bold text-white">
                                    Добро пожаловать в
                                    <br />
                                    CodeHorizon!{' '}
                                    <span className="inline-block translate-y-1">
                                        <FaWandMagicSparkles />
                                    </span>
                                </h1>
                            </BoxReveal>
                            <div className="max-w-2/3">
                                <BoxReveal duration={0.5} boxColor="#fff">
                                    <p className="text-xl text-white/90 font-semibold ">
                                        Создайте аккаунт, чтобы получить доступ к курсам и тестам. Изучайте новые темы,
                                        проходите испытания и развивайте свои навыки вместе с нами!
                                    </p>
                                </BoxReveal>
                            </div>
                        </div>

                        <BoxReveal duration={0.5} boxColor="#fff">
                            <p className="text-white">© {new Date().getFullYear()} CodeHorizon. Все права защищены.</p>
                        </BoxReveal>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default SignUpPage;

