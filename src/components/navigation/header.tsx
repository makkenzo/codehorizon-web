'use client';

import { useEffect, useMemo, useState } from 'react';

import { motion } from 'framer-motion';
import { Lock, ShieldQuestion } from 'lucide-react';
import { FaUserSecret } from 'react-icons/fa6';
import { RiProgress5Line } from 'react-icons/ri';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import Logo from '@/components/reusable/logo';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePermissions } from '@/hooks/use-permissions';
import { heroFadeInVariants } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import AuthApiClient from '@/server/auth';
import CoursesApiClient from '@/server/courses';
import { mentorshipApiClient } from '@/server/mentorship';
import { useProfileStore } from '@/stores/profile/profile-store-provider';
import { useUserStore } from '@/stores/user/user-store-provider';

import CatalogDropdown from '../catalog-dropdown';
import CatalogFiltersMobile from '../catalog/filters-mobile';
import MentorshipApplicationModal from '../mentorship/mentorship-application-modal';
import NotificationIcon from '../notifications/notification-icon';
import GlobalSearch from '../reusable/global-search';
import LevelProgress from '../reusable/level-progress';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Dialog, DialogTrigger } from '../ui/dialog';
import { Skeleton } from '../ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import MobileBurgerMenu from './mobile-burger-menu';

const Header = () => {
    const [categories, setCategories] = useState<string[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const { hasPermission } = usePermissions();

    const { isAuthenticated, isPending } = useAuth();
    const pathname = usePathname();

    const { profile, clearProfile } = useProfileStore((state) => state);

    const { user, clearUser } = useUserStore((state) => state);

    const [canApplyForMentorship, setCanApplyForMentorship] = useState(false);
    const [isCheckingMentorshipStatus, setIsCheckingMentorshipStatus] = useState(true);
    const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);

    const isMentor = useMemo(() => user?.roles?.includes('ROLE_MENTOR') || user?.roles?.includes('MENTOR'), [user]);
    const isAdmin = useMemo(() => user?.roles?.includes('ADMIN') || user?.roles?.includes('ROLE_ADMIN'), [user]);

    useEffect(() => {
        const apiClient = new CoursesApiClient();
        const fetchCategories = async () => {
            setIsLoadingCategories(true);
            try {
                const fetched = await apiClient.getCategories();
                setCategories(fetched ?? []);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
                setCategories([]);
            } finally {
                setIsLoadingCategories(false);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const checkMentorshipPossibility = async () => {
            if (isAuthenticated && user && !isMentor && !isAdmin) {
                setIsCheckingMentorshipStatus(true);
                try {
                    const hasActive = await mentorshipApiClient.hasActiveApplication();
                    setCanApplyForMentorship(!hasActive);
                } catch {
                    setCanApplyForMentorship(true);
                } finally {
                    setIsCheckingMentorshipStatus(false);
                }
            } else {
                setCanApplyForMentorship(false);
                setIsCheckingMentorshipStatus(false);
            }
        };

        if (!isPending) {
            checkMentorshipPossibility();
        }
    }, [isAuthenticated, user, isMentor, isAdmin, isPending]);

    const handleApplicationSuccess = () => {
        setIsApplicationModalOpen(false);
        setCanApplyForMentorship(false);
    };

    return (
        <div className={cn('w-full', pathname !== '/' && 'bg-white')}>
            <div className="mx-auto flex max-w-[1208px] items-center justify-between py-2 xl:px-0 px-4">
                {isPending ? (
                    <>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-[40px] w-[40px] rounded-full" />
                                <Skeleton className="h-[28px] w-[120px]" />
                            </div>
                            <Skeleton className="h-[36px] w-[100px]" />
                        </div>
                        <Skeleton className="h-[37px] w-[400px]" />
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-[22px] w-[108px]" />
                            <Skeleton className="size-[38px]" />
                            <Skeleton className="h-[32px] w-[65px]" />
                            <Skeleton className="h-[32px] w-[196px]" />
                        </div>
                    </>
                ) : (
                    <motion.div
                        variants={heroFadeInVariants}
                        animate="visible"
                        initial="hidden"
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="flex w-full"
                    >
                        <div className="flex items-center gap-4 w-full">
                            <div className="flex items-center gap-2">
                                <MobileBurgerMenu profile={profile} />
                                <Logo />
                            </div>
                            <CatalogDropdown categories={categories} isLoading={isLoadingCategories} />
                        </div>
                        <GlobalSearch className="pt-1 lg:block hidden mx-4 flex-grow max-w-md" />

                        <div className="flex items-center gap-4 w-full justify-end ml-auto">
                            {isAuthenticated &&
                                user &&
                                hasPermission('mentorship_application:apply') &&
                                !isCheckingMentorshipStatus && (
                                    <>
                                        {!user.isVerified ? (
                                            <TooltipProvider delayDuration={100}>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className="lg:flex hidden items-center">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-foreground items-center gap-1.5 hover:bg-primary/10 hover:text-primary"
                                                                disabled
                                                            >
                                                                <Lock className="h-3 w-3 mr-1" />
                                                                Стать ментором
                                                            </Button>
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Подтвердите email, чтобы подать заявку.</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        ) : canApplyForMentorship ? (
                                            <Dialog
                                                open={isApplicationModalOpen}
                                                onOpenChange={setIsApplicationModalOpen}
                                            >
                                                <DialogTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-foreground lg:flex hidden items-center gap-1.5 hover:bg-primary/10 hover:text-primary"
                                                    >
                                                        <ShieldQuestion className="h-4 w-4" />
                                                        Стать ментором
                                                    </Button>
                                                </DialogTrigger>
                                                {isApplicationModalOpen && (
                                                    <MentorshipApplicationModal
                                                        onClose={() => setIsApplicationModalOpen(false)}
                                                        onSuccess={handleApplicationSuccess}
                                                    />
                                                )}
                                            </Dialog>
                                        ) : null}
                                    </>
                                )}
                            {pathname.includes('courses') ? <CatalogFiltersMobile /> : null}
                            {isAuthenticated && user ? (
                                <>
                                    <NotificationIcon />
                                    <div className="lg:flex hidden items-center">
                                        <LevelProgress
                                            level={user.level}
                                            currentXp={user.xp}
                                            xpForNextLevel={user.xpForNextLevel}
                                            dailyStreak={user.dailyStreak}
                                            showTooltip={true}
                                            showLevel={false}
                                        />
                                    </div>
                                </>
                            ) : null}
                            {isAuthenticated && user ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Avatar className="hover:cursor-pointer lg:block hidden hover:outline-4 outline-primary outline-0 ease-in-out transition-all duration-100">
                                            {profile?.avatarUrl && <AvatarImage src={profile?.avatarUrl} />}
                                            <AvatarFallback>
                                                <FaUserSecret />
                                            </AvatarFallback>
                                        </Avatar>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56 px-4 py-2" align="end">
                                        <DropdownMenuLabel className="pb-0 pl-0">
                                            {profile && profile.firstName && profile.lastName
                                                ? profile.firstName + ' ' + profile.lastName
                                                : 'Мой Аккаунт'}
                                        </DropdownMenuLabel>
                                        <DropdownMenuLabel className="font-normal pt-0 pl-0">
                                            {user?.email}
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuGroup>
                                            <Link href="/me/profile">
                                                <DropdownMenuItem>Профиль</DropdownMenuItem>
                                            </Link>
                                            <Link href="/me/courses">
                                                <DropdownMenuItem>Мои курсы</DropdownMenuItem>
                                            </Link>
                                            <Link href="/me/certificates">
                                                <DropdownMenuItem>Мои сертификаты</DropdownMenuItem>
                                            </Link>
                                            <Link href="/me/courses?tab=wishlist">
                                                <DropdownMenuItem>Список желаемого</DropdownMenuItem>
                                            </Link>
                                        </DropdownMenuGroup>
                                        {(user?.roles?.includes('MENTOR') ||
                                            user?.roles?.includes('ROLE_MENTOR') ||
                                            user?.roles?.includes('ADMIN') ||
                                            user?.roles?.includes('ROLE_ADMIN')) && (
                                            <>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuGroup>
                                                    <Link href="/admin">
                                                        <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer">
                                                            Админ-панель
                                                        </DropdownMenuItem>
                                                    </Link>
                                                </DropdownMenuGroup>
                                            </>
                                        )}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuGroup>
                                            <Link href="/me/notifications">
                                                <DropdownMenuItem>
                                                    <span>Уведомления</span>
                                                </DropdownMenuItem>
                                            </Link>
                                        </DropdownMenuGroup>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            variant="destructive"
                                            onClick={async () => {
                                                clearProfile();
                                                clearUser();

                                                await new AuthApiClient().isLoggedOut();

                                                window.location.reload();
                                            }}
                                        >
                                            <span>Выйти</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <>
                                    <Link
                                        href={`/sign-in?from=${encodeURIComponent(pathname)}`}
                                        className="lg:block hidden"
                                    >
                                        <Button size="sm" variant="outline">
                                            <span className="font-bold">Войти</span>
                                        </Button>
                                    </Link>
                                    <Link href={'/sign-up'} className="lg:block hidden">
                                        <Button size="sm">
                                            <RiProgress5Line />
                                            <span className="font-bold">Зарегистрироваться</span>
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Header;
