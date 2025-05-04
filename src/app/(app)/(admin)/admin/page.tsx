'use client';

import React, { useEffect, useState } from 'react';

import { isAxiosError } from 'axios';
import { Activity, BookOpen, DollarSign, Users } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, LabelList, Line, LineChart, Pie, PieChart, XAxis, YAxis } from 'recharts';
import { toast } from 'sonner';

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
import { adminApiClient } from '@/server/admin-api-client';
import { AdminChartDataDTO, AdminDashboardStatsDTO } from '@/types/admin';

const chartConfig = {
    users: {
        label: 'Users',
        color: 'var(--chart-1)',
    },
    revenue: {
        label: 'Revenue',
        color: 'var(--chart-2)',
    },
    students: {
        label: 'Students',
        color: 'var(--chart-3)',
    },
} satisfies ChartConfig;

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<AdminDashboardStatsDTO | null>(null);
    const [chartData, setChartData] = useState<AdminChartDataDTO | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [categoryChartConfig, setCategoryChartConfig] = useState<ChartConfig>({});

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
            date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            users: item.value,
        })) ?? [];

    const formattedRevenueChartData =
        chartData?.revenueData.map((item) => ({
            date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
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
                <Card x-chunk="dashboard-01-chunk-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Всего пользователей</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-8 w-24 mt-1" />
                        ) : (
                            <div className="text-2xl font-bold">{stats?.totalUsers ?? '-'}</div>
                        )}
                        {isLoading ? (
                            <Skeleton className="h-4 w-32 mt-1" />
                        ) : (
                            stats?.newUsersToday != null && (
                                <p className="text-xs text-muted-foreground">+{stats.newUsersToday} сегодня</p>
                            )
                        )}
                    </CardContent>
                </Card>

                <Card x-chunk="dashboard-01-chunk-2">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Всего курсов</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-8 w-16 mt-1" />
                        ) : (
                            <div className="text-2xl font-bold">{stats?.totalCourses ?? '-'}</div>
                        )}
                    </CardContent>
                </Card>

                <Card x-chunk="dashboard-01-chunk-0">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Всего дохода</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-8 w-32 mt-1" />
                        ) : (
                            <div className="text-2xl font-bold">${(stats?.totalRevenue ?? 0).toFixed(2)}</div>
                        )}
                    </CardContent>
                </Card>

                <Card x-chunk="dashboard-01-chunk-3">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Завершенных курсов</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-8 w-16 mt-1" />
                        ) : (
                            <div className="text-2xl font-bold">{stats?.completedCoursesCount ?? '-'}</div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:gap-8">
                <Card x-chunk="dashboard-05-chunk-1">
                    <CardHeader className="px-7">
                        <CardTitle>Регистрации пользователей</CardTitle>
                        <CardDescription>Ежедневные регистрации пользователей за последний период.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-[250px] w-full" />
                        ) : formattedUserChartData.length > 0 ? (
                            <ChartContainer config={chartConfig} className="h-[250px] w-full">
                                <LineChart
                                    accessibilityLayer
                                    data={formattedUserChartData}
                                    margin={{ left: 12, right: 12 }}
                                >
                                    <CartesianGrid vertical={false} />
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
                        ) : (
                            <p className="text-center text-muted-foreground py-10">
                                Данные о регистрации пользователей недоступны.
                            </p>
                        )}
                    </CardContent>
                </Card>

                <Card x-chunk="dashboard-05-chunk-2">
                    <CardHeader className="px-7">
                        <CardTitle>Доход</CardTitle>
                        <CardDescription>Ежедневный доход за последний период.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-[250px] w-full" />
                        ) : formattedRevenueChartData.length > 0 ? (
                            <ChartContainer config={chartConfig} className="h-[250px] w-full">
                                <BarChart
                                    accessibilityLayer
                                    data={formattedRevenueChartData}
                                    margin={{ left: 12, right: 12 }}
                                >
                                    <CartesianGrid vertical={false} />
                                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                                    <YAxis tickFormatter={(value) => `$${value}`} />
                                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                    <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                                </BarChart>
                            </ChartContainer>
                        ) : (
                            <p className="text-center text-muted-foreground py-10">Данные о доходе недоступны.</p>
                        )}
                    </CardContent>
                </Card>
                <Card x-chunk="dashboard-05-chunk-3">
                    <CardHeader className="items-center pb-0">
                        <CardTitle>Категории курсов</CardTitle>
                        <CardDescription>Распределение курсов по категориям</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 pb-0">
                        {isLoading ? (
                            <Skeleton className="h-[250px] w-full rounded-full" />
                        ) : formattedCategoryData.length > 0 ? (
                            <ChartContainer
                                config={categoryChartConfig}
                                className="mx-auto aspect-square max-h-[280px]"
                            >
                                <PieChart>
                                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                                    <Pie
                                        data={formattedCategoryData}
                                        dataKey="value"
                                        nameKey="name"
                                        innerRadius={60}
                                        strokeWidth={5}
                                    >
                                        <LabelList
                                            dataKey="value"
                                            className="fill-background"
                                            stroke="none"
                                            fontSize={12}
                                            formatter={(value: number) => value.toString()}
                                        />

                                        {formattedCategoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>

                                    <ChartLegend
                                        content={<ChartLegendContent nameKey="name" />}
                                        className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                                    />
                                </PieChart>
                            </ChartContainer>
                        ) : (
                            <p className="text-center text-muted-foreground py-10">
                                Данные о категориях курсов недоступны.
                            </p>
                        )}
                    </CardContent>
                </Card>

                <Card x-chunk="dashboard-05-chunk-4">
                    <CardHeader>
                        <CardTitle>Топ курсов по учащимся</CardTitle>
                        <CardDescription>Самые популярные курсы по участию.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-[250px] w-full" />
                        ) : formattedPopularityData.length > 0 ? (
                            <ChartContainer config={chartConfig} className="h-[280px] w-full">
                                <BarChart
                                    accessibilityLayer
                                    data={formattedPopularityData}
                                    layout="vertical"
                                    margin={{ left: 10, right: 10, top: 10, bottom: 10 }}
                                >
                                    <CartesianGrid horizontal={false} />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        tickLine={false}
                                        tickMargin={10}
                                        axisLine={false}
                                        tickFormatter={(value) =>
                                            value.length > 20 ? value.slice(0, 18) + '...' : value
                                        }
                                        width={120}
                                    />
                                    <XAxis dataKey="students" type="number" hide />
                                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                                    <Bar dataKey="students" layout="vertical" fill="var(--color-students)" radius={4}>
                                        <LabelList
                                            position="right"
                                            offset={8}
                                            className="fill-foreground"
                                            fontSize={12}
                                            dataKey="students"
                                        />
                                    </Bar>
                                </BarChart>
                            </ChartContainer>
                        ) : (
                            <p className="text-center text-muted-foreground py-10">
                                Данные о популярности курсов недоступны.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
