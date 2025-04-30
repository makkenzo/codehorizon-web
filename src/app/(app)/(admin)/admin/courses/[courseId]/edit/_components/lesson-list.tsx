'use client';

import React from 'react';

import { MoreVertical, Pencil, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AdminLessonDTO } from '@/types/admin';

interface LessonListProps {
    lessons: AdminLessonDTO[];
    onEditLesson: (lesson: AdminLessonDTO) => void;
    onDeleteLesson: (lessonId: string, lessonTitle: string) => void;
}

export default function LessonList({ lessons, onEditLesson, onDeleteLesson }: LessonListProps) {
    if (!lessons || lessons.length === 0) {
        return <p className="text-center text-muted-foreground py-4">No lessons added yet.</p>;
    }

    return (
        <div className="w-full overflow-x-auto custom-scrollbar">
            <Table className="min-w-full">
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[45%]">Title</TableHead>
                        <TableHead className="w-[25%]">Slug</TableHead>
                        <TableHead className="w-[15%]">Content Status</TableHead>
                        <TableHead className="w-[15%] text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {lessons.map((lesson) => (
                        <TableRow key={lesson.id} className="hover:bg-muted/50 transition-colors">
                            <TableCell className="font-medium truncate max-w-xs">{lesson.title}</TableCell>
                            <TableCell className="text-muted-foreground truncate max-w-[150px]">
                                {lesson.slug ?? '-'}
                            </TableCell>
                            <TableCell>
                                <Badge variant={lesson.content ? 'default' : 'outline'}>
                                    {lesson.content ? 'Has Content' : 'Empty'}
                                </Badge>
                            </TableCell>
                            <TableCell className="flex justify-end">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button size="icon" variant="ghost" className="px-3">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56 px-4 py-2">
                                        <DropdownMenuLabel>Lesson Actions</DropdownMenuLabel>
                                        <DropdownMenuItem
                                            onClick={() => onEditLesson(lesson)}
                                            className="cursor-pointer"
                                        >
                                            <Pencil className="mr-2 h-4 w-4" /> Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="text-destructive cursor-pointer"
                                            onClick={() => onDeleteLesson(lesson.id, lesson.title)}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
