'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, Users, Zap } from 'lucide-react';

import Image from 'next/image';
import Link from 'next/link';

import { fadeInVariants } from '@/lib/constants';

import PageWrapper from './reusable/page-wrapper';
import { Button } from './ui/button';
import Threads from './ui/threads';
import WrapButton from './ui/wrap-button';

const Hero = () => {
    const features = [
        {
            icon: BookOpen,
            title: 'Обширный каталог курсов',
            description: 'Найдите курсы по веб-разработке, от основ HTML/CSS до продвинутых фреймворков.',
        },
        {
            icon: Users,
            title: 'Опытные менторы',
            description: 'Учитесь у профессионалов индустрии, получайте персональную обратную связь и поддержку.',
        },
        {
            icon: Zap,
            title: 'Практический подход',
            description: 'Закрепляйте знания с помощью интерактивных заданий, тестов и реальных проектов.',
        },
    ];

    return (
        <>
            <motion.div
                initial={{
                    opacity: 0,
                }}
                animate={{
                    opacity: 1,
                }}
                transition={{
                    duration: 0.3,
                    delay: 0.6,
                }}
                className="w-full h-[1000px] absolute -z-[50]"
            >
                <Threads
                    amplitude={1}
                    distance={0}
                    enableMouseInteraction={true}
                    color={[0.24313725490196078, 0.8, 0.6980392156862745]}
                />
            </motion.div>

            <motion.section
                variants={fadeInVariants}
                animate="visible"
                initial="hidden"
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="overflow-hidden py-8 md:py-16 lg:py-24 bg-background-contrast dark:bg-background"
            >
                <PageWrapper className="relative mt-0">
                    <div className="pointer-events-none absolute inset-0 -top-20 -z-10 mx-auto hidden size-[500px] bg-[radial-gradient(hsl(var(--muted-foreground))_1px,transparent_1px)] opacity-100 [background-size:6px_6px] [mask-image:radial-gradient(circle_at_center,white_250px,transparent_250px)] lg:block"></div>
                    <div className="relative flex flex-col lg:flex-row justify-between gap-10 lg:gap-16">
                        <motion.div
                            className="w-full lg:max-w-lg xl:max-w-xl shrink-0"
                            variants={fadeInVariants}
                            transition={{ delay: 0.1 }}
                        >
                            <motion.p
                                initial={{ opacity: 0, filter: 'blur(4px)', y: 10 }}
                                animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                                transition={{
                                    duration: 0.3,
                                    delay: 12 * 0.1,
                                    ease: 'easeInOut',
                                }}
                                className="text-primary font-semibold text-sm mb-3"
                            >
                                CodeHorizon
                            </motion.p>
                            <h1 className="mb-4 text-4xl font-bold leading-tight lg:text-5xl xl:text-6xl">
                                {'Узнавайте что-то новое каждый день'.split(' ').map((word, index) => (
                                    <motion.span
                                        key={index}
                                        initial={{ opacity: 0, filter: 'blur(4px)', y: 10 }}
                                        animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
                                        transition={{
                                            duration: 0.3,
                                            delay: (index + 15) * 0.1,
                                            ease: 'easeInOut',
                                        }}
                                        className="mr-2 inline-block"
                                    >
                                        {word}
                                    </motion.span>
                                ))}
                            </h1>
                            <motion.p
                                initial={{
                                    opacity: 0,
                                }}
                                animate={{
                                    opacity: 1,
                                }}
                                transition={{
                                    duration: 0.3,
                                    delay: 2.0,
                                }}
                                className="text-muted-foreground text-base lg:text-lg mb-6"
                            >
                                Станьте профессионалами и будьте готовы присоединиться к IT-миру. Изучайте новые темы,
                                проходите испытания и развивайте свои навыки вместе с нами!
                            </motion.p>
                            <motion.div
                                initial={{
                                    opacity: 0,
                                }}
                                animate={{
                                    opacity: 1,
                                }}
                                transition={{
                                    duration: 0.3,
                                    delay: 2.2,
                                }}
                                className="w-fit"
                            >
                                <Link href="/courses">
                                    <WrapButton className="bg-primary">
                                        <span className="font-bold">Выбрать курс</span>
                                    </WrapButton>
                                </Link>
                            </motion.div>
                        </motion.div>
                        <motion.div
                            className="hidden lg:block w-full lg:max-w-2xl xl:max-w-3xl"
                            variants={fadeInVariants}
                            transition={{ delay: 1 }}
                        >
                            <Image
                                src={'/hero/bg.png'}
                                alt="CodeHorizon platform preview"
                                width={900}
                                height={600}
                                className="max-h-[450px] w-full min-w-[450px] rounded-lg object-contain"
                                priority
                            />
                        </motion.div>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            className="relative mt-16 grid md:grid-cols-3 border-t border-input/50"
                            variants={fadeInVariants}
                            transition={{ delay: 2.4 }}
                        >
                            {features.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    className="flex flex-col gap-y-4 px-4 py-8 md:p-6 lg:p-8 border-b md:border-b-0 md:border-r border-input/50 last:border-b-0 last:md:border-r-0"
                                    variants={fadeInVariants}
                                    transition={{ delay: 0.4 + (index + 24) * 0.1 }}
                                >
                                    <feature.icon className="size-8 text-primary" />
                                    <div>
                                        <h3 className="text-lg font-semibold mb-1">{feature.title}</h3>
                                        <p className="text-muted-foreground text-sm">{feature.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                            <div className="bg-input absolute -inset-x-4 top-0 h-px md:hidden"></div>
                            <div className="bg-input absolute -inset-x-4 top-[-0.5px] row-start-2 h-px md:hidden"></div>
                            <div className="bg-input absolute -inset-x-4 top-[-0.5px] row-start-3 h-px md:hidden"></div>
                            <div className="bg-input absolute -inset-x-4 bottom-0 row-start-4 h-px md:hidden"></div>
                            <div className="bg-input absolute -left-2 -top-2 bottom-0 w-px md:hidden"></div>
                            <div className="bg-input absolute -right-2 -top-2 bottom-0 col-start-2 w-px md:hidden"></div>
                            <div className="bg-input absolute -inset-x-2 top-0 hidden h-px md:block"></div>
                            <div className="bg-input absolute -top-2 bottom-0 left-0 hidden w-px md:block"></div>
                            <div className="bg-input absolute -left-[0.5px] -top-2 bottom-0 col-start-2 hidden w-px md:block"></div>
                            <div className="bg-input absolute -left-[0.5px] -top-2 bottom-0 col-start-3 hidden w-px md:block"></div>
                            <div className="bg-input absolute -top-2 bottom-0 right-0 hidden w-px md:block"></div>
                        </motion.div>
                    </AnimatePresence>
                </PageWrapper>
            </motion.section>
        </>
    );
};

export default Hero;
