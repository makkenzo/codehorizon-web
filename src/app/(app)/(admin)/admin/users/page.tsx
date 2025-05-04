'use client';

import React, { useEffect, useState } from 'react';

import { MoreHorizontal, Pencil } from 'lucide-react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import MyPagination from '@/components/reusable/my-pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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

    const renderSkeletons = (count: number) => {
        return Array.from({ length: count }).map((_, index) => (
            <TableRow key={`skeleton-${index}`}>
                <TableCell>
                    <Skeleton className="h-5 w-24" />
                </TableCell>
                <TableCell>
                    <Skeleton className="h-5 w-40" />
                </TableCell>
                <TableCell>
                    <Skeleton className="h-5 w-16" />
                </TableCell>
                <TableCell>
                    <Skeleton className="h-5 w-24" />
                </TableCell>
                <TableCell>
                    <Skeleton className="h-8 w-8" />
                </TableCell>
            </TableRow>
        ));
    };

    return (
        <Card className="shadow-sm" x-chunk="dashboard-06-chunk-0">
            <CardHeader>
                <CardTitle>Пользователи</CardTitle>
                <CardDescription>Управляйте своими пользователями и просматривайте их данные.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Имя пользователя</TableHead>
                            <TableHead>E-mail</TableHead>
                            <TableHead>Статус</TableHead>
                            <TableHead>Роли</TableHead>
                            <TableHead className="text-right">Действия</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            renderSkeletons(pageSize)
                        ) : data && data.content.length > 0 ? (
                            data.content.map((user) => (
                                <TableRow key={user.id} className="hover:bg-muted/50 transition-colors">
                                    <TableCell className="font-medium">{user.username}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={user.isVerified ? 'default' : 'destructive'}>
                                            {user.isVerified ? 'Верифицирован' : 'Не верифицирован'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-1">
                                            {user.roles.map((role) => (
                                                <Badge key={role} variant="secondary">
                                                    {role.replace('ROLE_', '')}
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell className="flex justify-end">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    aria-haspopup="true"
                                                    size="icon"
                                                    variant="ghost"
                                                    className="px-3 transition-colors"
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Toggle menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-56 px-4 py-2" align="end">
                                                <DropdownMenuLabel>Действия</DropdownMenuLabel>
                                                <DropdownMenuItem
                                                    onClick={() => setEditingUser(user)}
                                                    className="cursor-pointer"
                                                >
                                                    <Pencil className="mr-2 h-4 w-4" /> Редактировать
                                                </DropdownMenuItem>
                                                {/* <DropdownMenuItem className="text-destructive">
                                                     <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                </DropdownMenuItem> */}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    Пользователей не найдено.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {data && data.totalPages > 1 && (
                    <MyPagination
                        className="mt-4"
                        currentPage={currentPage}
                        totalPages={data.totalPages}
                        onPageChange={handlePageChange}
                    />
                )}

                {editingUser && (
                    <AdminUserEditDialog
                        user={editingUser}
                        onOpenChange={(open) => !open && setEditingUser(null)}
                        onUserUpdate={(updatedUser) => {
                            setData((prevData) =>
                                prevData
                                    ? {
                                          ...prevData,
                                          content: prevData.content.map((u) =>
                                              u.id === updatedUser.id ? updatedUser : u
                                          ),
                                      }
                                    : null
                            );
                            setEditingUser(null);
                        }}
                    />
                )}
            </CardContent>
        </Card>
    );
}
