'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { PiHandWavingDuotone } from 'react-icons/pi';
import { z } from 'zod';

import Link from 'next/link';

import Logo from '@/components/reusable/logo';
import { BlurFade } from '@/components/ui/blur-fade';
import { BoxReveal } from '@/components/ui/box-reveal';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const formSchema = z.object({
    username: z
        .string({ message: 'Обязательно для заполнения' })
        .min(1, { message: 'Обязательно для заполнения' })
        .max(50, { message: 'Имя пользователя должно быть не более 50 символов' })
        .trim(),
    password: z
        .string({ message: 'Обязательно для заполнения' })
        .max(50, { message: 'Пароль должен быть не более 50 символов' })
        .trim(),
});

const ANIMATION_DELAYS = {
    WELCOME: 0,
    SIGNUP_TEXT: 0.1,
    USERNAME: 0.2,
    PASSWORD: 0.3,
    SUBMIT: 0.4,
    FORGOT_PASSWORD: 0.5,
};

const SignInPage = () => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: '',
            password: '',
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
                <motion.div layout layoutId="panel-left" className="bg-primary col-span-3 m-4 rounded-md">
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
                        <BoxReveal duration={0.5} boxColor="#fff">
                            <p className="text-white">© {new Date().getFullYear()} CodeHorizon. Все права защищены.</p>
                        </BoxReveal>
                    </div>
                </motion.div>
                <motion.div
                    layout
                    layoutId="panel-right"
                    className="col-span-2 justify-center flex flex-col gap-6 3xl:pl-36 3xl:pr-40 pl-16 pr-20"
                >
                    <div className="flex flex-col gap-2">
                        <BlurFade delay={ANIMATION_DELAYS.WELCOME}>
                            <h2 className="text-3xl font-bold">Добро пожаловать!</h2>
                        </BlurFade>
                        <BlurFade delay={ANIMATION_DELAYS.SIGNUP_TEXT}>
                            <p className="text-border">
                                Нет аккаунта?{' '}
                                <Link href={'/sign-up'}>
                                    <Button
                                        variant="link"
                                        size="link"
                                        className="inline-block text-border font-semibold underline hover:text-border/80"
                                    >
                                        Создайте новый аккаунт сейчас,
                                    </Button>
                                </Link>{' '}
                                это БЕСПЛАТНО и не займет больше минуты.
                            </p>
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
                            <BlurFade delay={ANIMATION_DELAYS.SUBMIT}>
                                <Button type="submit" size="lg" className="w-full">
                                    Войти
                                </Button>
                            </BlurFade>
                            <BlurFade delay={ANIMATION_DELAYS.FORGOT_PASSWORD}>
                                <p className="text-center">
                                    Забыли пароль?{' '}
                                    <Link href={'/forgot-password'}>
                                        <Button
                                            variant="link"
                                            size="link"
                                            className="inline-block text-border font-semibold underline hover:text-border/80"
                                        >
                                            Нажмите сюда
                                        </Button>
                                    </Link>
                                </p>
                            </BlurFade>
                        </form>
                    </Form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default SignInPage;

