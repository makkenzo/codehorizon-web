'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, Users, Zap } from 'lucide-react';

import Image from 'next/image';
import Link from 'next/link';

import { fadeInVariants } from '@/lib/constants';

import { InteractiveHoverButton } from './magicui/interactive-hover-button';
import PageWrapper from './reusable/page-wrapper';

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
            <div className="absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background/50"></div>

                <motion.div
                    className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-r from-primary/10 to-primary/5 blur-3xl"
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: 'reverse',
                    }}
                />
                <motion.div
                    className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-l from-secondary/10 to-primary/10 blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: 'reverse',
                        delay: 1,
                    }}
                />
                <div className="absolute inset-0 opacity-30">
                    <motion.div
                        className="absolute top-[15%] left-[20%] w-16 h-16 rounded-full border border-primary/20"
                        animate={{
                            y: [0, -20, 0],
                            opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                            duration: 5,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: 'easeInOut',
                        }}
                    />

                    <motion.div
                        className="absolute top-[40%] right-[25%] w-24 h-24 rounded-lg border border-secondary/20 rotate-45"
                        animate={{
                            rotate: [45, 90, 45],
                            opacity: [0.3, 0.7, 0.3],
                        }}
                        transition={{
                            duration: 7,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: 'easeInOut',
                            delay: 2,
                        }}
                    />

                    <motion.div
                        className="absolute bottom-[20%] left-[30%] w-20 h-20 rounded-md border border-primary/20 rotate-12"
                        animate={{
                            rotate: [12, -12, 12],
                            opacity: [0.4, 0.8, 0.4],
                        }}
                        transition={{
                            duration: 6,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: 'easeInOut',
                            delay: 1,
                        }}
                    />
                </div>
                <div className="absolute inset-0 bg-[radial-gradient(hsl(var(--muted-foreground)/10)_1px,transparent_1px)] [background-size:20px_20px] opacity-30"></div>
            </div>
            <motion.section
                variants={fadeInVariants}
                animate="visible"
                initial="hidden"
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="overflow-hidden py-8 md:py-16 lg:py-24 bg-transparent"
            >
                <PageWrapper className="relative mt-0">
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
                                    <InteractiveHoverButton>
                                        <span className="font-bold">Выбрать курс</span>
                                    </InteractiveHoverButton>
                                </Link>
                            </motion.div>
                        </motion.div>
                        <motion.div
                            className="hidden lg:block w-full lg:max-w-2xl xl:max-w-3xl"
                            variants={fadeInVariants}
                            transition={{ delay: 1 }}
                        >
                            <div className="relative">
                                <motion.div
                                    className="absolute -z-10 inset-0 bg-gradient-to-tr from-primary/10 to-secondary/10 rounded-lg blur-xl"
                                    animate={{
                                        opacity: [0.5, 0.7, 0.5],
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Number.POSITIVE_INFINITY,
                                        repeatType: 'reverse',
                                    }}
                                />

                                <motion.div
                                    className="absolute -z-10 -inset-1 bg-gradient-to-br from-primary/20 to-transparent rounded-lg opacity-70"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 0.7 }}
                                    transition={{ delay: 1.5, duration: 0.8 }}
                                />

                                <Image
                                    src={'/hero/bg.png'}
                                    alt="CodeHorizon platform preview"
                                    width={900}
                                    height={600}
                                    className="max-h-[450px] w-full min-w-[450px] rounded-lg object-contain relative z-10"
                                    priority
                                />

                                <motion.div
                                    className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-primary/10 backdrop-blur-sm border border-primary/20 z-20"
                                    animate={{
                                        y: [0, -10, 0],
                                        x: [0, 5, 0],
                                    }}
                                    transition={{
                                        duration: 4,
                                        repeat: Number.POSITIVE_INFINITY,
                                        repeatType: 'reverse',
                                    }}
                                />

                                <motion.div
                                    className="absolute -bottom-6 right-12 w-16 h-16 rounded-lg bg-secondary/10 backdrop-blur-sm border border-secondary/20 z-20 rotate-12"
                                    animate={{
                                        y: [0, 10, 0],
                                        rotate: [12, 0, 12],
                                    }}
                                    transition={{
                                        duration: 5,
                                        repeat: Number.POSITIVE_INFINITY,
                                        repeatType: 'reverse',
                                        delay: 0.5,
                                    }}
                                />
                            </div>
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
                                    className="flex flex-col gap-y-4 px-4 py-8 md:p-6 lg:p-8 border-b md:border-b-0 md:border-r border-input/50 last:border-b-0 last:md:border-r-0 group"
                                    variants={fadeInVariants}
                                    transition={{ delay: 0.4 + (index + 24) * 0.1 }}
                                    whileHover={{
                                        backgroundColor: 'rgba(var(--primary-rgb), 0.05)',
                                        transition: { duration: 0.2 },
                                    }}
                                >
                                    <motion.div
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                                    >
                                        <feature.icon className="size-8 text-primary" />
                                    </motion.div>
                                    <div>
                                        <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors duration-200">
                                            {feature.title}
                                        </h3>
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
