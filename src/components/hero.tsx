'use client';

import { motion } from 'framer-motion';

import Link from 'next/link';

import { heroFadeInVariants } from '@/lib/constants';
import { useAuth } from '@/providers/auth-provider';

import PageWrapper from './reusable/page-wrapper';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';

const Hero = () => {
    const { isAuthenticated, isPending } = useAuth();
    return (
        <motion.div
            variants={heroFadeInVariants}
            animate="visible"
            initial="hidden"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="md:block hidden"
        >
            <div
                className="absolute top-0 h-[660px] animate-in w-full bg-no-repeat bg-center bg-[#F3D876] -z-1"
                style={{ backgroundImage: `url(/hero/bg.webp)` }}
            />
            <div className="h-[603px]">
                <PageWrapper className="h-full justify-center mt-0 flex flex-col">
                    <div className="w-1/2 flex flex-col gap-2">
                        <h1 className="text-[48px] font-bold leading-[62px]">Узнавайте что-то новое каждый день</h1>
                        <p className="text-black-60 font-light">
                            Станьте профессионалами и будьте готовы присоединиться к IT-миру
                        </p>
                        {isPending ? (
                            <div className="w-full flex items-center gap-4 mt-2">
                                <Skeleton className="w-[125px] h-[41px]" />
                                <Skeleton className="w-[165px] h-[41px]" />
                            </div>
                        ) : (
                            <div className="flex items-center gap-4 mt-2">
                                <Link href="/courses">
                                    <Button variant="primary-inverted">Выбрать курс</Button>
                                </Link>
                                {!isAuthenticated && <Button>Создать аккаунт</Button>}
                            </div>
                        )}
                    </div>
                </PageWrapper>
            </div>
        </motion.div>
    );
};

export default Hero;
