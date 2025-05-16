'use client';

import React, { useEffect, useState } from 'react';

import { isAxiosError } from 'axios';
import { Activity, BookOpen, DollarSign, Loader2, RefreshCw, Users } from 'lucide-react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    LabelList,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
} from 'recharts';
import { toast } from 'sonner';

import { InteractiveHoverButton } from '@/components/magicui/interactive-hover-button';
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
        color: 'var(--chart-1)',
    },
    revenue: {
        label: 'Доход',
        color: 'var(--chart-2)',
    },
    students: {
        label: 'Студенты',
        color: 'var(--chart-3)',
    },
} satisfies ChartConfig;

const AdminDashboardPageContent = () => {
    const [stats, setStats] = useState<AdminDashboardStatsDTO | null>(null);
    const [chartData, setChartData] = useState<AdminChartDataDTO | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRetroGrantLoading, setIsRetroGrantLoading] = useState(false);
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

    return (
        <div className="flex flex-col gap-4 md:gap-6 lg:gap-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="overflow-hidden border-border/40 backdrop-blur-sm bg-background/60 relative group hover:shadow-lg transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-primary/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Всего пользователей</CardTitle>
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/10 blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <Users className="h-4 w-4 text-primary relative z-10" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-8 w-24 mt-1" />
                        ) : (
                            <div className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                                {stats?.totalUsers ?? '-'}
                            </div>
                        )}
                        {isLoading ? (
                            <Skeleton className="h-4 w-32 mt-1" />
                        ) : (
                            stats?.newUsersToday != null && (
                                <p className="text-xs text-muted-foreground">
                                    <span className="text-primary">+{stats.newUsersToday}</span> сегодня
                                </p>
                            )
                        )}
                    </CardContent>
                </Card>

                <Card className="overflow-hidden border-border/40 backdrop-blur-sm bg-background/60 relative group hover:shadow-lg transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-secondary/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Всего курсов</CardTitle>
                        <div className="relative">
                            <div className="absolute inset-0 bg-secondary/10 blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <BookOpen className="h-4 w-4 text-secondary relative z-10" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-8 w-16 mt-1" />
                        ) : (
                            <div className="text-2xl font-bold bg-gradient-to-r from-secondary to-secondary/70 bg-clip-text text-transparent">
                                {stats?.totalCourses ?? '-'}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="overflow-hidden border-border/40 backdrop-blur-sm bg-background/60 relative group hover:shadow-lg transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-green-500/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Всего дохода</CardTitle>
                        <div className="relative">
                            <div className="absolute inset-0 bg-green-500/10 blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <DollarSign className="h-4 w-4 text-green-500 relative z-10" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-8 w-32 mt-1" />
                        ) : (
                            <div className="text-2xl font-bold bg-gradient-to-r from-green-500 to-green-500/70 bg-clip-text text-transparent">
                                ${(stats?.totalRevenue ?? 0).toFixed(2)}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="overflow-hidden border-border/40 backdrop-blur-sm bg-background/60 relative group hover:shadow-lg transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-purple-500/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Завершенных курсов</CardTitle>
                        <div className="relative">
                            <div className="absolute inset-0 bg-purple-500/10 blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <Activity className="h-4 w-4 text-purple-500 relative z-10" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-8 w-16 mt-1" />
                        ) : (
                            <div className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-purple-500/70 bg-clip-text text-transparent">
                                {stats?.completedCoursesCount ?? '-'}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:gap-8">
                <Card className="border-border/40 backdrop-blur-sm bg-background/60 overflow-hidden relative group hover:shadow-lg transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-primary/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <CardHeader className="px-7 relative z-10">
                        <CardTitle className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                            Регистрации пользователей
                        </CardTitle>
                        <CardDescription>Ежедневные регистрации пользователей за последний период.</CardDescription>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        {isLoading ? (
                            <Skeleton className="h-[250px] w-full" />
                        ) : formattedUserChartData.length > 0 ? (
                            <div className="h-[250px] w-full">
                                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                                    <LineChart accessibilityLayer data={formattedUserChartData} margin={{ right: 0 }}>
                                        <defs>
                                            <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.2} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid vertical={false} stroke="hsl(var(--border))" opacity={0.2} />
                                        <XAxis
                                            dataKey="date"
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                            tickFormatter={(value) => value}
                                        />
                                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                        <Line
                                            dataKey="users"
                                            type="natural"
                                            stroke="var(--color-users)"
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                    </LineChart>
                                </ChartContainer>
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground py-10">
                                Данные о регистрации пользователей недоступны.
                            </p>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-border/40 backdrop-blur-sm bg-background/60 overflow-hidden relative group hover:shadow-lg transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-green-500/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <CardHeader className="px-7 relative z-10">
                        <CardTitle className="bg-gradient-to-r from-green-500 to-green-500/70 bg-clip-text text-transparent">
                            Доход
                        </CardTitle>
                        <CardDescription>Ежедневный доход за последний период.</CardDescription>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        {isLoading ? (
                            <Skeleton className="h-[250px] w-full" />
                        ) : formattedRevenueChartData.length > 0 ? (
                            <div className="h-[250px] w-full">
                                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                                    <BarChart data={formattedRevenueChartData} margin={{ left: 12, right: 12 }}>
                                        <defs>
                                            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.2} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid vertical={false} stroke="hsl(var(--border))" opacity={0.2} />
                                        <XAxis
                                            dataKey="date"
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                            stroke="hsl(var(--muted-foreground))"
                                        />
                                        <YAxis
                                            tickFormatter={(value) => `$${value}`}
                                            stroke="hsl(var(--muted-foreground))"
                                        />
                                        <ChartTooltip
                                            cursor={false}
                                            content={<ChartTooltipContent indicator="dot" />}
                                            wrapperClassName="!bg-background/80 backdrop-blur-md !border-border/40 !shadow-lg"
                                        />
                                        <Bar
                                            dataKey="revenue"
                                            fill="var(--color-revenue)"
                                            radius={[4, 4, 0, 0]}
                                            barSize={30}
                                        />
                                    </BarChart>
                                </ChartContainer>
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground py-10">Данные о доходе недоступны.</p>
                        )}
                    </CardContent>
                </Card>
                <Card className="border-border/40 backdrop-blur-sm bg-background/60 overflow-hidden relative group hover:shadow-lg transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-secondary/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <CardHeader className="items-center pb-0 relative z-10">
                        <CardTitle className="bg-gradient-to-r from-secondary to-secondary/70 bg-clip-text text-transparent">
                            Категории курсов
                        </CardTitle>
                        <CardDescription>Распределение курсов по категориям</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 pb-0 relative z-10">
                        {isLoading ? (
                            <Skeleton className="h-[250px] w-full" />
                        ) : formattedCategoryData.length > 0 ? (
                            <div className="mx-auto aspect-square max-h-[280px]">
                                <ChartContainer config={chartConfig} className="h-[280px] w-full">
                                    <PieChart>
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
                                                    <stop offset="100%" stopColor={entry.fill} stopOpacity={0.7} />
                                                </linearGradient>
                                            ))}
                                        </defs>
                                        <ChartTooltip
                                            cursor={false}
                                            content={<ChartTooltipContent hideIndicator hideLabel />}
                                        />
                                        <Pie
                                            data={formattedCategoryData}
                                            dataKey="value"
                                            nameKey="name"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={2}
                                        >
                                            <LabelList
                                                dataKey="value"
                                                className="fill-background font-medium"
                                                stroke="none"
                                                fontSize={12}
                                                formatter={(value: number) => value.toString()}
                                            />

                                            {formattedCategoryData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={`url(#pieGradient-${index})`}
                                                    stroke="hsl(var(--background))"
                                                    strokeWidth={2}
                                                />
                                            ))}
                                        </Pie>

                                        <ChartLegend
                                            content={<ChartLegendContent nameKey="name" />}
                                            className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                                        />
                                    </PieChart>
                                </ChartContainer>
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground py-10">
                                Данные о категориях курсов недоступны.
                            </p>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-border/40 backdrop-blur-sm bg-background/60 overflow-hidden relative group hover:shadow-lg transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-purple-500/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <CardHeader className="relative z-10">
                        <CardTitle className="bg-gradient-to-r from-purple-500 to-purple-500/70 bg-clip-text text-transparent">
                            Топ курсов по учащимся
                        </CardTitle>
                        <CardDescription>Самые популярные курсы по участию.</CardDescription>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        {isLoading ? (
                            <Skeleton className="h-[250px] w-full" />
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
                                                <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0.4} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid horizontal={false} />
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
                                        />
                                        <XAxis dataKey="students" type="number" hide />
                                        <ChartTooltip
                                            cursor={false}
                                            content={<ChartTooltipContent indicator="line" />}
                                        />
                                        <Bar
                                            dataKey="students"
                                            layout="vertical"
                                            fill="var(--color-students)"
                                            radius={4}
                                        >
                                            <LabelList
                                                position="right"
                                                offset={0}
                                                className="fill-foreground"
                                                fontSize={12}
                                                dataKey="students"
                                            />
                                        </Bar>
                                    </BarChart>
                                </ChartContainer>
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground py-10">
                                Данные о популярности курсов недоступны.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
            {hasPermission('admin:job:run') && (
                <Card className="border-border/40 backdrop-blur-sm bg-background/60 overflow-hidden relative group hover:shadow-lg transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-primary/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <CardHeader className="relative z-10">
                        <CardTitle className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            Административные задачи
                        </CardTitle>
                        <CardDescription>Запуск служебных операций для поддержания системы.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col sm:flex-row gap-4 relative z-10">
                        <InteractiveHoverButton
                            onClick={handleRetroactiveGrant}
                            disabled={isRetroGrantLoading}
                            icon={
                                isRetroGrantLoading ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                )
                            }
                            className="relative flex w-fit overflow-hidden group/btn bg-gradient-to-r from-primary/10 to-secondary/10 hover:from-primary/20 hover:to-secondary/20 border-border/40"
                        >
                            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-primary/10 to-secondary/10 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></span>
                            <span className="relative z-10">Запустить пересчет достижений</span>
                        </InteractiveHoverButton>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default AdminDashboardPageContent;
