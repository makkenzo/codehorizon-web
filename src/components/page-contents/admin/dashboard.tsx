'use client';

import React, { useEffect, useState } from 'react';

import { isAxiosError } from 'axios';
import { motion } from 'framer-motion';
import {
    Award,
    BarChart3,
    BookOpen,
    Crown,
    DollarSign,
    Loader2,
    PieChart,
    RefreshCw,
    Rocket,
    Sparkles,
    Star,
    Target,
    TrendingUp,
    Users,
    Zap,
} from 'lucide-react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    LabelList,
    Line,
    LineChart,
    Pie,
    PieChart as RechartsPieChart,
    XAxis,
    YAxis,
} from 'recharts';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { usePermissions } from '@/hooks/use-permissions';
import { adminApiClient } from '@/server/admin-api-client';
import { AdminChartDataDTO, AdminDashboardStatsDTO } from '@/types/admin';

const chartConfig = {
    users: {
        label: 'Пользователи',
        color: '#8b5cf6',
    },
    revenue: {
        label: 'Доход',
        color: '#10b981',
    },
    students: {
        label: 'Студенты',
        color: '#f59e0b',
    },
} satisfies ChartConfig;

const AdminDashboardPageContent = () => {
    const [stats, setStats] = useState<AdminDashboardStatsDTO | null>(null);
    const [chartData, setChartData] = useState<AdminChartDataDTO | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRetroGrantLoading, setIsRetroGrantLoading] = useState(false);
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const { hasPermission } = usePermissions();

    const [categoryChartConfig, setCategoryChartConfig] = useState<ChartConfig>({});

    const handleRetroactiveGrant = async () => {
        if (
            !confirm(
                'Вы уверены, что хотите запустить полную перепроверку достижений для всех пользователей? Это может занять некоторое время.'
            )
        ) {
            return;
        }
        setIsRetroGrantLoading(true);
        try {
            const response = await adminApiClient.runRetroactiveAchievementGrant();
            toast.success(
                response.message || 'Задача ретроактивной выдачи достижений успешно запущена в фоновом режиме.'
            );
        } catch (error: unknown) {
            console.error('Failed to run retroactive achievement grant:', error);
            let errorMsg = 'Неизвестная ошибка при запуске задачи.';
            if (isAxiosError(error)) {
                errorMsg = error?.response?.data?.message || error.message || errorMsg;
            } else if (error instanceof Error) {
                errorMsg = error.message;
            }
            toast.error(`Ошибка: ${errorMsg}`);
        } finally {
            setIsRetroGrantLoading(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [statsRes, chartsRes] = await Promise.all([
                    adminApiClient.getDashboardStats(),
                    adminApiClient.getDashboardCharts(),
                ]);
                setStats(statsRes);
                setChartData(chartsRes);

                if (chartsRes?.categoryDistribution) {
                    const newConfig: ChartConfig = {};
                    chartsRes.categoryDistribution.forEach((item) => {
                        newConfig[item.category] = { label: item.category, color: item.fill };
                    });
                    setCategoryChartConfig(newConfig);
                }
            } catch (error: unknown) {
                console.error('Failed to load dashboard data:', error);

                let errorMsg = 'Unknown error';

                if (isAxiosError(error)) {
                    errorMsg = error?.response?.data?.message || error.message || 'Unknown error';
                } else if (error instanceof Error) {
                    errorMsg = error.message;
                }

                toast.error(`Failed to load dashboard data: ${errorMsg}`);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const formattedUserChartData =
        chartData?.userRegistrations.map((item) => ({
            date: new Date(item.date).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' }),
            users: item.value,
        })) ?? [];

    const formattedRevenueChartData =
        chartData?.revenueData.map((item) => ({
            date: new Date(item.date).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' }),
            revenue: item.value,
        })) ?? [];
    const formattedCategoryData =
        chartData?.categoryDistribution.map((item) => ({
            name: item.category,
            value: item.courseCount,
            fill: item.fill,
        })) ?? [];
    const formattedPopularityData =
        chartData?.topCoursesByStudents.map((item) => ({
            name: item.courseTitle,
            students: item.studentCount,
        })) ?? [];

    const StatCard = ({
        title,
        value,
        icon: Icon,
        description,
        isLoadingCard,
        color = 'primary',
        id,
        trend,
    }: {
        title: string;
        value: string | number;
        icon: React.ElementType;
        description?: string;
        isLoadingCard?: boolean;
        color?: 'primary' | 'secondary' | 'green' | 'purple' | 'blue' | 'rose' | 'amber';
        id: string;
        trend?: 'up' | 'down' | 'stable';
    }) => {
        const colorMap = {
            primary: {
                bg: 'from-violet-50/80 to-purple-50/80',
                border: 'border-violet-200/50',
                text: 'from-violet-600 to-purple-600',
                icon: 'text-violet-600',
                iconBg: 'bg-violet-100',
                glow: 'bg-violet-500/20',
                shadow: 'shadow-violet-500/20',
            },
            secondary: {
                bg: 'from-blue-50/80 to-cyan-50/80',
                border: 'border-blue-200/50',
                text: 'from-blue-600 to-cyan-600',
                icon: 'text-blue-600',
                iconBg: 'bg-blue-100',
                glow: 'bg-blue-500/20',
                shadow: 'shadow-blue-500/20',
            },
            green: {
                bg: 'from-emerald-50/80 to-teal-50/80',
                border: 'border-emerald-200/50',
                text: 'from-emerald-600 to-teal-600',
                icon: 'text-emerald-600',
                iconBg: 'bg-emerald-100',
                glow: 'bg-emerald-500/20',
                shadow: 'shadow-emerald-500/20',
            },
            purple: {
                bg: 'from-fuchsia-50/80 to-pink-50/80',
                border: 'border-fuchsia-200/50',
                text: 'from-fuchsia-600 to-pink-600',
                icon: 'text-fuchsia-600',
                iconBg: 'bg-fuchsia-100',
                glow: 'bg-fuchsia-500/20',
                shadow: 'shadow-fuchsia-500/20',
            },
            blue: {
                bg: 'from-sky-50/80 to-blue-50/80',
                border: 'border-sky-200/50',
                text: 'from-sky-600 to-blue-600',
                icon: 'text-sky-600',
                iconBg: 'bg-sky-100',
                glow: 'bg-sky-500/20',
                shadow: 'shadow-sky-500/20',
            },
            rose: {
                bg: 'from-rose-50/80 to-pink-50/80',
                border: 'border-rose-200/50',
                text: 'from-rose-600 to-pink-600',
                icon: 'text-rose-600',
                iconBg: 'bg-rose-100',
                glow: 'bg-rose-500/20',
                shadow: 'shadow-rose-500/20',
            },
            amber: {
                bg: 'from-amber-50/80 to-yellow-50/80',
                border: 'border-amber-200/50',
                text: 'from-amber-600 to-yellow-600',
                icon: 'text-amber-600',
                iconBg: 'bg-amber-100',
                glow: 'bg-amber-500/20',
                shadow: 'shadow-amber-500/20',
            },
        };

        const isHovered = hoveredCard === id;

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                whileHover={{ y: -5 }}
            >
                <Card
                    className={`overflow-hidden backdrop-blur-lg bg-gradient-to-br ${colorMap[color].bg} ${colorMap[color].border} relative group hover:${colorMap[color].shadow} hover:shadow-xl transition-all duration-500 cursor-pointer`}
                    onMouseEnter={() => setHoveredCard(id)}
                    onMouseLeave={() => setHoveredCard(null)}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5"></div>
                    <div
                        className={`absolute -top-20 -right-20 w-40 h-40 ${colorMap[color].glow} rounded-full blur-3xl opacity-0 group-hover:opacity-60 transition-opacity duration-700`}
                    ></div>
                    <div
                        className={`absolute -bottom-20 -left-20 w-32 h-32 ${colorMap[color].glow} rounded-full blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-700`}
                    ></div>

                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                        <div className="space-y-1">
                            <CardTitle className="text-sm font-medium text-slate-700">{title}</CardTitle>
                            {trend && (
                                <Badge
                                    variant="outline"
                                    className={`text-xs px-2 py-0 ${
                                        trend === 'up'
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                            : trend === 'down'
                                              ? 'bg-rose-50 text-rose-600 border-rose-200'
                                              : 'bg-slate-50 text-slate-600 border-slate-200'
                                    }`}
                                >
                                    {trend === 'up' ? '↗ Рост' : trend === 'down' ? '↘ Снижение' : '→ Стабильно'}
                                </Badge>
                            )}
                        </div>
                        <div className="relative">
                            <div
                                className={`absolute inset-0 ${colorMap[color].glow} blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                            ></div>
                            <div
                                className={`relative ${colorMap[color].iconBg} rounded-xl p-3 transition-all duration-300 ${
                                    isHovered ? 'scale-110 shadow-lg' : ''
                                }`}
                            >
                                <Icon className={`h-5 w-5 ${colorMap[color].icon} transition-colors duration-300`} />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10 pb-6">
                        {isLoadingCard ? (
                            <div className="space-y-2">
                                <Skeleton className="h-8 w-24 rounded-md" />
                                <Skeleton className="h-4 w-3/4 rounded-md" />
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div
                                    className={`text-3xl font-bold bg-gradient-to-r ${colorMap[color].text} bg-clip-text text-transparent transition-all duration-300`}
                                >
                                    {value}
                                </div>
                                {description && (
                                    <p
                                        className={`text-xs ${colorMap[color].icon} opacity-80 transition-colors duration-300`}
                                    >
                                        {description}
                                    </p>
                                )}
                            </div>
                        )}
                    </CardContent>

                    <div className="absolute top-2 right-2 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                        <Sparkles className={`h-4 w-4 ${colorMap[color].icon}`} />
                    </div>
                </Card>
            </motion.div>
        );
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 },
    };

    return (
        <div className="relative min-h-screen py-8">
            <div className="absolute inset-0 overflow-hidden -z-10">
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-violet-500/15 to-fuchsia-500/15 rounded-full blur-3xl opacity-60 animate-pulse"></div>
                <div className="absolute top-1/4 right-1/3 w-80 h-80 bg-gradient-to-tr from-emerald-500/10 to-teal-500/15 rounded-full blur-3xl opacity-60 animate-pulse delay-700"></div>
                <div className="absolute bottom-1/3 -left-20 w-72 h-72 bg-gradient-to-tr from-blue-500/10 to-cyan-500/15 rounded-full blur-3xl opacity-60 animate-pulse delay-1000"></div>
                <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-bl from-amber-500/10 to-orange-500/15 rounded-full blur-3xl opacity-60 animate-pulse delay-500"></div>
            </div>
            <div className="container mx-auto px-4 relative z-10">
                <motion.div
                    className="mb-8"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center gap-4 mb-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 rounded-lg blur opacity-75"></div>
                            <div className="relative bg-white/80 backdrop-blur-sm rounded-lg p-3">
                                <BarChart3 className="h-8 w-8 text-violet-600" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                                Панель администратора
                            </h1>
                            <p className="text-slate-600 mt-2">Обзор ключевых метрик и аналитики платформы</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8"
                    variants={container}
                    initial="hidden"
                    animate="show"
                >
                    <motion.div variants={item}>
                        <StatCard
                            id="users"
                            title="Всего пользователей"
                            value={stats?.totalUsers ?? '-'}
                            icon={Users}
                            description={
                                stats?.newUsersToday != null
                                    ? `+${stats.newUsersToday} сегодня`
                                    : 'Зарегистрированные пользователи'
                            }
                            isLoadingCard={isLoading}
                            color="primary"
                            trend="up"
                        />
                    </motion.div>
                    <motion.div variants={item}>
                        <StatCard
                            id="courses"
                            title="Всего курсов"
                            value={stats?.totalCourses ?? '-'}
                            icon={BookOpen}
                            description="Опубликованные курсы"
                            isLoadingCard={isLoading}
                            color="secondary"
                            trend="stable"
                        />
                    </motion.div>
                    <motion.div variants={item}>
                        <StatCard
                            id="revenue"
                            title="Всего дохода"
                            value={`$${(stats?.totalRevenue ?? 0).toFixed(2)}`}
                            icon={DollarSign}
                            description="Общий доход платформы"
                            isLoadingCard={isLoading}
                            color="green"
                            trend="up"
                        />
                    </motion.div>
                    <motion.div variants={item}>
                        <StatCard
                            id="completed"
                            title="Завершенных курсов"
                            value={stats?.completedCoursesCount ?? '-'}
                            icon={Award}
                            description="Успешно завершенные"
                            isLoadingCard={isLoading}
                            color="purple"
                            trend="up"
                        />
                    </motion.div>
                </motion.div>

                <motion.div
                    className="grid gap-8 md:grid-cols-2 mb-8"
                    variants={container}
                    initial="hidden"
                    animate="show"
                >
                    <motion.div variants={item}>
                        <Card className="bg-white/70 backdrop-blur-lg shadow-xl border border-white/50 overflow-hidden relative group py-0">
                            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-purple-500/5"></div>
                            <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-violet-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                            <CardHeader className="relative z-10 bg-gradient-to-r from-violet-500/10 to-purple-500/10 border-b border-white/30 py-6">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-lg blur opacity-75"></div>
                                        <div className="relative bg-white/80 backdrop-blur-sm rounded-lg p-2">
                                            <TrendingUp className="h-5 w-5 text-violet-600" />
                                        </div>
                                    </div>
                                    <div>
                                        <CardTitle className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                                            Регистрации пользователей
                                        </CardTitle>
                                        <CardDescription>Ежедневные регистрации за последний период</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="relative z-10 p-6">
                                {isLoading ? (
                                    <Skeleton className="h-[250px] w-full rounded-lg" />
                                ) : formattedUserChartData.length > 0 ? (
                                    <div className="h-[250px] w-full">
                                        <ChartContainer config={chartConfig} className="h-[250px] w-full">
                                            <LineChart
                                                accessibilityLayer
                                                data={formattedUserChartData}
                                                margin={{ right: 0 }}
                                            >
                                                <defs>
                                                    <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop
                                                            offset="5%"
                                                            stopColor="hsl(var(--chart-1))"
                                                            stopOpacity={0.8}
                                                        />
                                                        <stop
                                                            offset="95%"
                                                            stopColor="hsl(var(--chart-1))"
                                                            stopOpacity={0.2}
                                                        />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid
                                                    vertical={false}
                                                    stroke="rgba(148, 163, 184, 0.2)"
                                                    strokeDasharray="3 3"
                                                />
                                                <XAxis
                                                    dataKey="date"
                                                    tickLine={false}
                                                    axisLine={false}
                                                    tickMargin={8}
                                                    tickFormatter={(value) => value}
                                                    style={{ fontSize: '11px', fill: '#64748b' }}
                                                />
                                                <ChartTooltip
                                                    cursor={false}
                                                    content={
                                                        <ChartTooltipContent
                                                            hideLabel
                                                            className="bg-white/90 backdrop-blur-lg border border-white/50 shadow-xl rounded-lg"
                                                        />
                                                    }
                                                />
                                                <Line
                                                    dataKey="users"
                                                    type="natural"
                                                    stroke="var(--color-users)"
                                                    strokeWidth={3}
                                                    dot={{ fill: 'var(--color-users)', strokeWidth: 2, r: 4 }}
                                                    activeDot={{ r: 6, stroke: 'var(--color-users)', strokeWidth: 2 }}
                                                />
                                            </LineChart>
                                        </ChartContainer>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                                        <div className="rounded-full bg-slate-100 p-4 mb-4">
                                            <TrendingUp className="h-8 w-8 text-slate-400" />
                                        </div>
                                        <p className="text-lg font-medium">Данные недоступны</p>
                                        <p className="text-sm text-slate-400 mt-1">
                                            Данные о регистрации пользователей недоступны
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div variants={item}>
                        <Card className="bg-white/70 backdrop-blur-lg shadow-xl border border-white/50 overflow-hidden relative group py-0">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5"></div>
                            <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-emerald-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                            <CardHeader className="relative z-10 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-b border-white/30 py-6">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-lg blur opacity-75"></div>
                                        <div className="relative bg-white/80 backdrop-blur-sm rounded-lg p-2">
                                            <DollarSign className="h-5 w-5 text-emerald-600" />
                                        </div>
                                    </div>
                                    <div>
                                        <CardTitle className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                            Доход
                                        </CardTitle>
                                        <CardDescription>Ежедневный доход за последний период</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="relative z-10 p-6">
                                {isLoading ? (
                                    <Skeleton className="h-[250px] w-full rounded-lg" />
                                ) : formattedRevenueChartData.length > 0 ? (
                                    <div className="h-[250px] w-full">
                                        <ChartContainer config={chartConfig} className="h-[250px] w-full">
                                            <BarChart data={formattedRevenueChartData} margin={{ left: 12, right: 12 }}>
                                                <defs>
                                                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                                        <stop offset="95%" stopColor="#059669" stopOpacity={0.2} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid
                                                    vertical={false}
                                                    stroke="rgba(148, 163, 184, 0.2)"
                                                    strokeDasharray="3 3"
                                                />
                                                <XAxis
                                                    dataKey="date"
                                                    tickLine={false}
                                                    axisLine={false}
                                                    tickMargin={8}
                                                    style={{ fontSize: '11px', fill: '#64748b' }}
                                                />
                                                <YAxis
                                                    tickFormatter={(value) => `$${value}`}
                                                    style={{ fontSize: '11px', fill: '#64748b' }}
                                                    tickLine={false}
                                                    axisLine={false}
                                                />
                                                <ChartTooltip
                                                    cursor={false}
                                                    content={
                                                        <ChartTooltipContent
                                                            indicator="dot"
                                                            className="bg-white/90 backdrop-blur-lg border border-white/50 shadow-xl rounded-lg"
                                                        />
                                                    }
                                                />
                                                <Bar
                                                    dataKey="revenue"
                                                    fill="url(#revenueGradient)"
                                                    radius={[4, 4, 0, 0]}
                                                    barSize={30}
                                                />
                                            </BarChart>
                                        </ChartContainer>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                                        <div className="rounded-full bg-slate-100 p-4 mb-4">
                                            <DollarSign className="h-8 w-8 text-slate-400" />
                                        </div>
                                        <p className="text-lg font-medium">Данные недоступны</p>
                                        <p className="text-sm text-slate-400 mt-1">Данные о доходе недоступны</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div variants={item}>
                        <Card className="bg-white/70 backdrop-blur-lg shadow-xl border border-white/50 overflow-hidden relative group py-0">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5"></div>
                            <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-blue-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                            <CardHeader className="relative z-10 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-b border-white/30 py-6">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg blur opacity-75"></div>
                                        <div className="relative bg-white/80 backdrop-blur-sm rounded-lg p-2">
                                            <PieChart className="h-5 w-5 text-blue-600" />
                                        </div>
                                    </div>
                                    <div>
                                        <CardTitle className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                                            Категории курсов
                                        </CardTitle>
                                        <CardDescription>Распределение курсов по категориям</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="relative z-10 p-6">
                                {isLoading ? (
                                    <Skeleton className="h-[280px] w-full rounded-lg" />
                                ) : formattedCategoryData.length > 0 ? (
                                    <div className="mx-auto aspect-square max-h-[280px]">
                                        <ChartContainer config={chartConfig} className="h-[280px] w-full">
                                            <RechartsPieChart>
                                                <defs>
                                                    {formattedCategoryData.map((entry, index) => (
                                                        <linearGradient
                                                            key={`gradient-${index}`}
                                                            id={`pieGradient-${index}`}
                                                            x1="0"
                                                            y1="0"
                                                            x2="0"
                                                            y2="1"
                                                        >
                                                            <stop offset="0%" stopColor={entry.fill} stopOpacity={1} />
                                                            <stop
                                                                offset="100%"
                                                                stopColor={entry.fill}
                                                                stopOpacity={0.7}
                                                            />
                                                        </linearGradient>
                                                    ))}
                                                </defs>
                                                <ChartTooltip
                                                    cursor={false}
                                                    content={
                                                        <ChartTooltipContent
                                                            hideIndicator
                                                            hideLabel
                                                            className="bg-white/90 backdrop-blur-lg border border-white/50 shadow-xl rounded-lg"
                                                        />
                                                    }
                                                />
                                                <Pie
                                                    data={formattedCategoryData}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    innerRadius={60}
                                                    outerRadius={100}
                                                    paddingAngle={2}
                                                >
                                                    <LabelList
                                                        dataKey="value"
                                                        className="fill-white font-medium"
                                                        stroke="none"
                                                        fontSize={12}
                                                        formatter={(value: number) => value.toString()}
                                                    />
                                                    {formattedCategoryData.map((entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={`url(#pieGradient-${index})`}
                                                            stroke="white"
                                                            strokeWidth={2}
                                                        />
                                                    ))}
                                                </Pie>
                                                <ChartLegend
                                                    content={<ChartLegendContent nameKey="name" />}
                                                    className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                                                />
                                            </RechartsPieChart>
                                        </ChartContainer>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                                        <div className="rounded-full bg-slate-100 p-4 mb-4">
                                            <PieChart className="h-8 w-8 text-slate-400" />
                                        </div>
                                        <p className="text-lg font-medium">Данные недоступны</p>
                                        <p className="text-sm text-slate-400 mt-1">
                                            Данные о категориях курсов недоступны
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div variants={item}>
                        <Card className="bg-white/70 backdrop-blur-lg shadow-xl border border-white/50 overflow-hidden relative group py-0">
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/5"></div>
                            <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-amber-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                            <CardHeader className="relative z-10 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-b border-white/30 py-6">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-lg blur opacity-75"></div>
                                        <div className="relative bg-white/80 backdrop-blur-sm rounded-lg p-2">
                                            <Star className="h-5 w-5 text-amber-600" />
                                        </div>
                                    </div>
                                    <div>
                                        <CardTitle className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                                            Топ курсов по студентам
                                        </CardTitle>
                                        <CardDescription>Самые популярные курсы по участию</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="relative z-10 p-6">
                                {isLoading ? (
                                    <Skeleton className="h-[280px] w-full rounded-lg" />
                                ) : formattedPopularityData.length > 0 ? (
                                    <div className="h-[280px] w-full">
                                        <ChartContainer config={chartConfig} className="h-[280px] w-full">
                                            <BarChart
                                                accessibilityLayer
                                                data={formattedPopularityData}
                                                layout="vertical"
                                                margin={{ left: 0, right: 10, top: 10, bottom: 10 }}
                                            >
                                                <defs>
                                                    <linearGradient id="popularityGradient" x1="0" y1="0" x2="1" y2="0">
                                                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                                                        <stop offset="95%" stopColor="#d97706" stopOpacity={0.4} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid horizontal={false} stroke="rgba(148, 163, 184, 0.2)" />
                                                <YAxis
                                                    dataKey="name"
                                                    type="category"
                                                    tickLine={false}
                                                    tickMargin={0}
                                                    axisLine={false}
                                                    tickFormatter={(value) =>
                                                        value.length > 20 ? value.slice(0, 18) + '...' : value
                                                    }
                                                    width={120}
                                                    style={{ fontSize: '11px', fill: '#64748b' }}
                                                />
                                                <XAxis dataKey="students" type="number" hide />
                                                <ChartTooltip
                                                    cursor={false}
                                                    content={
                                                        <ChartTooltipContent
                                                            indicator="line"
                                                            className="bg-white/90 backdrop-blur-lg border border-white/50 shadow-xl rounded-lg"
                                                        />
                                                    }
                                                />
                                                <Bar
                                                    dataKey="students"
                                                    layout="vertical"
                                                    fill="url(#popularityGradient)"
                                                    radius={4}
                                                >
                                                    <LabelList
                                                        position="right"
                                                        offset={0}
                                                        className="fill-slate-700"
                                                        fontSize={12}
                                                        dataKey="students"
                                                    />
                                                </Bar>
                                            </BarChart>
                                        </ChartContainer>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                                        <div className="rounded-full bg-slate-100 p-4 mb-4">
                                            <Star className="h-8 w-8 text-slate-400" />
                                        </div>
                                        <p className="text-lg font-medium">Данные недоступны</p>
                                        <p className="text-sm text-slate-400 mt-1">
                                            Данные о популярности курсов недоступны
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>

                {hasPermission('admin:job:run') && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <Card className="bg-white/70 backdrop-blur-lg shadow-xl border border-white/50 overflow-hidden relative group py-0">
                            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-fuchsia-500/5"></div>
                            <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-violet-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="absolute -top-32 -left-32 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                            <CardHeader className="relative z-10 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border-b border-white/30 py-6">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 rounded-lg blur opacity-75"></div>
                                        <div className="relative bg-white/80 backdrop-blur-sm rounded-lg p-2">
                                            <Rocket className="h-5 w-5 text-violet-600" />
                                        </div>
                                    </div>
                                    <div>
                                        <CardTitle className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                                            Административные задачи
                                        </CardTitle>
                                        <CardDescription>
                                            Запуск служебных операций для поддержания системы
                                        </CardDescription>
                                    </div>
                                </div>
                                <Badge variant="outline" className="w-fit bg-white/80 backdrop-blur-sm">
                                    <Crown className="h-3 w-3 mr-1 text-amber-500" />
                                    Только для администраторов
                                </Badge>
                            </CardHeader>
                            <CardContent className="relative z-10 p-6">
                                <Button
                                    onClick={handleRetroactiveGrant}
                                    disabled={isRetroGrantLoading}
                                    className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                                >
                                    {isRetroGrantLoading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                    )}
                                    Запустить пересчет достижений
                                    <Zap className="h-3 w-3 ml-2" />
                                </Button>
                            </CardContent>

                            <div className="absolute top-4 right-4 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                                <Target className="h-20 w-20 text-violet-500 transform rotate-12" />
                            </div>
                        </Card>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboardPageContent;
