'use client';

import React, { useEffect, useState } from 'react';

import { motion } from 'framer-motion';
import {
    ChevronDown,
    ChevronUp,
    Filter,
    MoreHorizontal,
    Pencil,
    Search,
    UserCheck,
    UserX,
    Users,
    X,
} from 'lucide-react';

import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { adminApiClient } from '@/server/admin-api-client';
import { PagedResponse } from '@/types';
import { AdminUser } from '@/types/admin';

import AdminUserEditDialog from './_components/user-edit-dialog';

export default function AdminUsersPage() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [data, setData] = useState<PagedResponse<AdminUser> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
    const [sortField, setSortField] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState<string | null>(null);
    const [filterVerified, setFilterVerified] = useState<boolean | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

    const currentPage = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('size') || '10', 10);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const result = await adminApiClient.getUsers(currentPage, pageSize);
                setData(result);
            } catch (error) {
                console.error('Failed to fetch users:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [currentPage, pageSize]);

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', newPage.toString());
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const filteredUsers = data?.content
        .filter((user) => {
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                return user.username.toLowerCase().includes(query) || user.email.toLowerCase().includes(query);
            }
            return true;
        })
        .filter((user) => {
            if (filterRole) {
                return user.roles.includes(filterRole) || user.roles.includes(`ROLE_${filterRole}`);
            }
            return true;
        })
        .filter((user) => {
            if (filterVerified !== null) {
                return user.isVerified === filterVerified;
            }
            return true;
        })
        .sort((a, b) => {
            if (!sortField) return 0;

            let valueA, valueB;

            switch (sortField) {
                case 'username':
                    valueA = a.username.toLowerCase();
                    valueB = b.username.toLowerCase();
                    break;
                case 'email':
                    valueA = a.email.toLowerCase();
                    valueB = b.email.toLowerCase();
                    break;
                case 'verified':
                    valueA = a.isVerified ? 1 : 0;
                    valueB = b.isVerified ? 1 : 0;
                    break;
                case 'roles':
                    valueA = a.roles.length;
                    valueB = b.roles.length;
                    break;
                default:
                    return 0;
            }

            if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
            if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

    const renderSkeletons = (count: number) => {
        if (viewMode === 'grid') {
            return Array.from({ length: count }).map((_, index) => (
                <div
                    key={`skeleton-${index}`}
                    className="relative overflow-hidden rounded-xl bg-white/40 backdrop-blur-sm shadow-lg border border-white/20 p-6"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 z-0"></div>
                    <div className="relative z-10 space-y-4">
                        <Skeleton className="h-6 w-32 rounded-md" />
                        <Skeleton className="h-4 w-48 rounded-md" />
                        <div className="flex gap-2 mt-4">
                            <Skeleton className="h-6 w-16 rounded-full" />
                            <Skeleton className="h-6 w-16 rounded-full" />
                        </div>
                    </div>
                </div>
            ));
        }

        return Array.from({ length: count }).map((_, index) => (
            <div
                key={`skeleton-${index}`}
                className="relative overflow-hidden rounded-xl bg-white/40 backdrop-blur-sm shadow-lg border border-white/20 p-4 flex items-center justify-between"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 z-0"></div>
                <div className="relative z-10 flex-1 flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-5 w-32 rounded-md" />
                        <Skeleton className="h-4 w-48 rounded-md" />
                    </div>
                </div>
                <div className="relative z-10 flex gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                </div>
            </div>
        ));
    };

    const getRoleColor = (role: string) => {
        const normalizedRole = role.replace('ROLE_', '');
        switch (normalizedRole) {
            case 'ADMIN':
                return 'bg-rose-100 text-rose-700 border-rose-200';
            case 'MENTOR':
                return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'USER':
                return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getInitials = (username: string) => {
        return username.substring(0, 2).toUpperCase();
    };

    const getRandomGradient = (userId: string) => {
        const hash = userId.split('').reduce((acc, char) => {
            return char.charCodeAt(0) + ((acc << 5) - acc);
        }, 0);

        const gradients = [
            'from-violet-500 to-fuchsia-500',
            'from-cyan-500 to-blue-500',
            'from-emerald-500 to-teal-500',
            'from-amber-500 to-orange-500',
            'from-rose-500 to-pink-500',
            'from-indigo-500 to-purple-500',
            'from-blue-500 to-indigo-500',
            'from-green-500 to-emerald-500',
            'from-orange-500 to-red-500',
            'from-pink-500 to-rose-500',
        ];

        return gradients[Math.abs(hash) % gradients.length];
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05,
            },
        },
    };

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 },
    };

    return (
        <div className="relative min-h-screen py-8">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-full blur-3xl opacity-60 animate-pulse"></div>
                <div className="absolute top-1/4 right-1/3 w-80 h-80 bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl opacity-60 animate-pulse delay-700"></div>
                <div className="absolute bottom-1/3 -left-20 w-72 h-72 bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl opacity-60 animate-pulse delay-1000"></div>
                <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-bl from-amber-500/20 to-orange-500/20 rounded-full blur-3xl opacity-60 animate-pulse delay-500"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="mb-8">
                    <motion.h1
                        className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        Управление пользователями
                    </motion.h1>
                    <motion.p
                        className="text-slate-600 mt-2"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        Просматривайте и редактируйте данные пользователей вашей платформы
                    </motion.p>
                </div>

                <motion.div
                    className="bg-white/70 backdrop-blur-md rounded-3xl shadow-xl border border-white/50 overflow-hidden mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <div className="p-6 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10">
                        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                            <div className="relative w-full md:w-64 group">
                                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                                <div className="relative bg-white/80 backdrop-blur-sm rounded-xl flex items-center px-3 border border-white/50 shadow-sm">
                                    <Search className="size-4 text-slate-400 mr-2" />
                                    <input
                                        type="text"
                                        placeholder="Поиск пользователей..."
                                        className="py-2 w-full bg-transparent focus:outline-none text-sm"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2 w-full md:w-auto">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-white/50 bg-white/80 backdrop-blur-sm"
                                        >
                                            <Filter className="size-4 mr-2" />
                                            Фильтры
                                            <ChevronDown className="size-4 ml-2" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56 p-2 bg-white/90 backdrop-blur-lg border border-white/50 shadow-xl rounded-xl">
                                        <DropdownMenuLabel>Фильтровать по роли</DropdownMenuLabel>
                                        <DropdownMenuItem
                                            className={`my-1 rounded-sm cursor-pointer pl-2 ${filterRole === null ? 'bg-violet-100' : ''}`}
                                            onClick={() => setFilterRole(null)}
                                        >
                                            Все роли
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className={`my-1 rounded-sm cursor-pointer pl-2 ${filterRole === 'ADMIN' ? 'bg-violet-100' : ''}`}
                                            onClick={() => setFilterRole('ADMIN')}
                                        >
                                            Администраторы
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className={`my-1 rounded-sm cursor-pointer pl-2 ${filterRole === 'MENTOR' ? 'bg-violet-100' : ''}`}
                                            onClick={() => setFilterRole('MENTOR')}
                                        >
                                            Менторы
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className={`my-1 rounded-sm cursor-pointer pl-2 ${filterRole === 'USER' ? 'bg-violet-100' : ''}`}
                                            onClick={() => setFilterRole('USER')}
                                        >
                                            Пользователи
                                        </DropdownMenuItem>

                                        <DropdownMenuLabel className="mt-2">Статус верификации</DropdownMenuLabel>
                                        <DropdownMenuItem
                                            className={`my-1 rounded-sm cursor-pointer pl-2 ${filterVerified === null ? 'bg-violet-100' : ''}`}
                                            onClick={() => setFilterVerified(null)}
                                        >
                                            Все пользователи
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className={`my-1 rounded-sm cursor-pointer pl-2 ${filterVerified === true ? 'bg-violet-100' : ''}`}
                                            onClick={() => setFilterVerified(true)}
                                        >
                                            Верифицированные
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className={`my-1 rounded-sm cursor-pointer pl-2 ${filterVerified === false ? 'bg-violet-100' : ''}`}
                                            onClick={() => setFilterVerified(false)}
                                        >
                                            Не верифицированные
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <div className="flex rounded-lg overflow-hidden border border-white/50 shadow-sm">
                                    <Button
                                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                                        size="sm"
                                        className={`rounded-none rounded-l-lg ${viewMode === 'grid' ? 'bg-violet-600 hover:bg-violet-700' : 'bg-white/80 backdrop-blur-sm'}`}
                                        onClick={() => setViewMode('grid')}
                                    >
                                        <Users className="size-4" />
                                    </Button>
                                    <Button
                                        variant={viewMode === 'list' ? 'default' : 'outline'}
                                        size="sm"
                                        className={`rounded-none rounded-r-lg ${viewMode === 'list' ? 'bg-violet-600 hover:bg-violet-700' : 'bg-white/80 backdrop-blur-sm'}`}
                                        onClick={() => setViewMode('list')}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <line x1="3" y1="6" x2="21" y2="6"></line>
                                            <line x1="3" y1="12" x2="21" y2="12"></line>
                                            <line x1="3" y1="18" x2="21" y2="18"></line>
                                        </svg>
                                    </Button>
                                </div>
                            </div>
                        </div>
                        {(searchQuery || filterRole || filterVerified !== null) && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {searchQuery && (
                                    <Badge variant="outline" className="bg-white/80 backdrop-blur-sm px-3 py-1">
                                        Поиск: {searchQuery}
                                        <button className="ml-2" onClick={() => setSearchQuery('')}>
                                            <X className="size-4" />
                                        </button>
                                    </Badge>
                                )}
                                {filterRole && (
                                    <Badge variant="outline" className="bg-white/80 backdrop-blur-sm px-3 py-1">
                                        Роль: {filterRole.replace('ROLE_', '')}
                                        <button className="ml-2" onClick={() => setFilterRole(null)}>
                                            <X className="size-4" />
                                        </button>
                                    </Badge>
                                )}
                                {filterVerified !== null && (
                                    <Badge variant="outline" className="bg-white/80 backdrop-blur-sm px-3 py-1">
                                        {filterVerified ? 'Верифицированные' : 'Не верифицированные'}
                                        <button className="ml-2 shrink-0" onClick={() => setFilterVerified(null)}>
                                            <X className="size-4" />
                                        </button>
                                    </Badge>
                                )}
                                {(searchQuery || filterRole || filterVerified !== null) && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 px-2 text-xs"
                                        onClick={() => {
                                            setSearchQuery('');
                                            setFilterRole(null);
                                            setFilterVerified(null);
                                        }}
                                    >
                                        Сбросить все
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>

                    {viewMode === 'grid' ? (
                        <div className="p-6">
                            {isLoading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {renderSkeletons(pageSize)}
                                </div>
                            ) : filteredUsers && filteredUsers.length > 0 ? (
                                <motion.div
                                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                                    variants={container}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    {filteredUsers.map((user) => (
                                        <motion.div
                                            key={user.id}
                                            className="relative overflow-hidden rounded-xl bg-white/40 backdrop-blur-sm shadow-lg border border-white/20 group hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                                            variants={item}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 z-0"></div>
                                            <div
                                                className={`absolute top-0 left-0 right-0 h-24 bg-gradient-to-r ${getRandomGradient(user.id)} opacity-80 z-0`}
                                            ></div>

                                            <div className="relative z-10 pt-16 px-6 pb-6">
                                                <div className="absolute top-6 right-6">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                aria-haspopup="true"
                                                                size="icon"
                                                                variant="ghost"
                                                                className="rounded-full h-8 w-8 bg-white/30 backdrop-blur-sm group"
                                                            >
                                                                <MoreHorizontal className="size-4 text-white group-hover:text-foreground" />
                                                                <span className="sr-only">Toggle menu</span>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent
                                                            className="w-56 p-2 bg-white/90 backdrop-blur-lg border border-white/50 shadow-xl rounded-xl"
                                                            align="end"
                                                        >
                                                            <DropdownMenuLabel>Действия</DropdownMenuLabel>
                                                            <DropdownMenuItem
                                                                onClick={() => setEditingUser(user)}
                                                                className="cursor-pointer hover:bg-violet-50 rounded-lg transition-colors my-1 focus:bg-violet-50"
                                                            >
                                                                <Pencil className="mr-2 size-4" /> Редактировать
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>

                                                <div className="flex flex-col items-center mb-4">
                                                    <div
                                                        className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-xl font-bold bg-gradient-to-br ${getRandomGradient(user.id)} shadow-lg border-4 border-white`}
                                                    >
                                                        {user.imageUrl ? (
                                                            <Avatar className="w-full h-full">
                                                                <AvatarImage src={user.imageUrl} alt={user.username} />
                                                            </Avatar>
                                                        ) : (
                                                            getInitials(user.username)
                                                        )}
                                                    </div>
                                                    <h3 className="mt-4 text-lg font-semibold">{user.username}</h3>
                                                    <p className="text-slate-500 text-sm">{user.email}</p>
                                                    <div className="mt-2">
                                                        <Badge
                                                            variant={user.isVerified ? 'default' : 'destructive'}
                                                            className="px-3 py-1"
                                                        >
                                                            {user.isVerified ? (
                                                                <>
                                                                    <UserCheck className="h-3 w-3 mr-1" /> Верифицирован
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <UserX className="h-3 w-3 mr-1" /> Не верифицирован
                                                                </>
                                                            )}
                                                        </Badge>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-2 justify-center">
                                                    {user.roles.map((role) => (
                                                        <Badge
                                                            key={role}
                                                            variant="outline"
                                                            className={`${getRoleColor(role)} border px-3 py-1`}
                                                        >
                                                            {role.replace('ROLE_', '')}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                                    <div className="rounded-full bg-slate-100 p-4 mb-4">
                                        <Users className="h-8 w-8 text-slate-400" />
                                    </div>
                                    <p className="text-lg font-medium">Пользователи не найдены</p>
                                    <p className="text-sm text-slate-400 mt-1">
                                        Попробуйте изменить параметры поиска или фильтры
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="p-6">
                            {isLoading ? (
                                <div className="space-y-4">{renderSkeletons(pageSize)}</div>
                            ) : filteredUsers && filteredUsers.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="flex items-center px-4 py-2 text-sm font-medium text-slate-500 bg-slate-50/50 rounded-lg">
                                        <div className="flex-1 pl-14">
                                            <button
                                                className="flex items-center gap-1 hover:text-violet-600 transition-colors"
                                                onClick={() => handleSort('email')}
                                            >
                                                Имя пользователя/E-mail
                                                {sortField === 'email' &&
                                                    (sortDirection === 'asc' ? (
                                                        <ChevronUp className="h-3 w-3" />
                                                    ) : (
                                                        <ChevronDown className="h-3 w-3" />
                                                    ))}
                                            </button>
                                        </div>
                                        <div className="flex-1 w-24">
                                            <button
                                                className="flex items-center gap-1 hover:text-violet-600 transition-colors"
                                                onClick={() => handleSort('verified')}
                                            >
                                                Статус
                                                {sortField === 'verified' &&
                                                    (sortDirection === 'asc' ? (
                                                        <ChevronUp className="h-3 w-3" />
                                                    ) : (
                                                        <ChevronDown className="h-3 w-3" />
                                                    ))}
                                            </button>
                                        </div>
                                        <div className="flex-1 w-40">
                                            <button
                                                className="flex items-center gap-1 hover:text-violet-600 transition-colors"
                                                onClick={() => handleSort('roles')}
                                            >
                                                Роли
                                                {sortField === 'roles' &&
                                                    (sortDirection === 'asc' ? (
                                                        <ChevronUp className="h-3 w-3" />
                                                    ) : (
                                                        <ChevronDown className="h-3 w-3" />
                                                    ))}
                                            </button>
                                        </div>
                                        <div className="w-16 text-right">Действия</div>
                                    </div>

                                    <motion.div
                                        className="space-y-3"
                                        variants={container}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        {filteredUsers.map((user) => (
                                            <motion.div
                                                key={user.id}
                                                className="relative overflow-hidden rounded-xl bg-white/40 backdrop-blur-sm shadow-md border border-white/20 p-4 flex items-center hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                                                variants={item}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/10 z-0"></div>
                                                <div className="relative z-10 flex-1 flex items-center gap-4">
                                                    <div
                                                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold bg-gradient-to-br ${getRandomGradient(user.id)} shadow border-2 border-white`}
                                                    >
                                                        {user.imageUrl ? (
                                                            <Avatar className="w-full h-full">
                                                                <AvatarImage src={user.imageUrl} alt={user.username} />
                                                            </Avatar>
                                                        ) : (
                                                            getInitials(user.username)
                                                        )}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-medium">{user.username}</h3>
                                                        <p className="text-slate-500 text-sm">{user.email}</p>
                                                    </div>
                                                    <div className="w-24 flex-1">
                                                        <Badge
                                                            variant={user.isVerified ? 'default' : 'destructive'}
                                                            className="px-2 py-0.5 text-xs"
                                                        >
                                                            {user.isVerified ? 'Верифицирован' : 'Не верифицирован'}
                                                        </Badge>
                                                    </div>
                                                    <div className="w-40 flex flex-wrap gap-1 flex-1">
                                                        {user.roles.map((role) => (
                                                            <Badge
                                                                key={role}
                                                                variant="outline"
                                                                className={`${getRoleColor(role)} border text-xs px-2 py-0.5`}
                                                            >
                                                                {role.replace('ROLE_', '')}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="relative z-10">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                aria-haspopup="true"
                                                                size="icon"
                                                                variant="ghost"
                                                                className="rounded-full h-8 w-8 hover:bg-slate-100 hover:text-red-500"
                                                            >
                                                                <MoreHorizontal className="size-4 text-slate-600" />
                                                                <span className="sr-only">Toggle menu</span>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent
                                                            className="w-56 p-2 bg-white/90 backdrop-blur-lg border border-white/50 shadow-xl rounded-xl"
                                                            align="end"
                                                        >
                                                            <DropdownMenuLabel>Действия</DropdownMenuLabel>
                                                            <DropdownMenuItem
                                                                onClick={() => setEditingUser(user)}
                                                                className="cursor-pointer hover:bg-violet-50 rounded-lg transition-colors my-1 focus:bg-violet-50 pl-2"
                                                            >
                                                                <Pencil className="size-4" /> Редактировать
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                                    <div className="rounded-full bg-slate-100 p-4 mb-4">
                                        <Users className="h-8 w-8 text-slate-400" />
                                    </div>
                                    <p className="text-lg font-medium">Пользователи не найдены</p>
                                    <p className="text-sm text-slate-400 mt-1">
                                        Попробуйте изменить параметры поиска или фильтры
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            </div>

            {editingUser && (
                <AdminUserEditDialog
                    user={editingUser}
                    onOpenChange={(open) => !open && setEditingUser(null)}
                    onUserUpdate={(updatedUser) => {
                        setData((prevData) =>
                            prevData
                                ? {
                                      ...prevData,
                                      content: prevData.content.map((u) => (u.id === updatedUser.id ? updatedUser : u)),
                                  }
                                : null
                        );
                        setEditingUser(null);
                    }}
                />
            )}
        </div>
    );
}
