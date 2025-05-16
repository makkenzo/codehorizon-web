'use client';

import React, { useState } from 'react';

import { FileCode, FileText, FileX, MoreVertical, Pencil, Trash2 } from 'lucide-react';

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
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);

    if (!lessons || lessons.length === 0) {
        return <p className="text-center text-muted-foreground py-4">No lessons added yet.</p>;
    }

    if (!lessons || lessons.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-8 border border-dashed border-border/40 rounded-md bg-background/60 backdrop-blur-sm">
                <div className="flex flex-col items-center justify-center gap-2">
                    <div className="relative">
                        <div className="absolute inset-0 bg-muted-foreground/10 rounded-full blur-lg"></div>
                        <FileX className="h-10 w-10 text-muted-foreground/50 relative z-10" />
                    </div>
                    <p>No lessons added yet.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full overflow-x-auto custom-scrollbar rounded-md border border-border/40 backdrop-blur-sm bg-background/60">
            <Table className="min-w-full">
                <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/40">
                        <TableHead className="w-[45%]">Название</TableHead>
                        <TableHead className="w-[25%]">Slug</TableHead>
                        <TableHead className="w-[15%]">Статус</TableHead>
                        <TableHead className="w-[15%] text-right">Действия</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {lessons.map((lesson) => (
                        <TableRow
                            key={lesson.id}
                            className={`transition-all duration-300 font-semibold ${
                                hoveredRow === lesson.id
                                    ? 'bg-gradient-to-r from-primary/5 to-secondary/5'
                                    : 'bg-background/40 hover:bg-background/60'
                            }`}
                            onMouseEnter={() => setHoveredRow(lesson.id)}
                            onMouseLeave={() => setHoveredRow(null)}
                        >
                            <TableCell className="font-medium truncate max-w-xs">
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <div
                                            className={`absolute inset-0 bg-primary/20 rounded-full blur-sm opacity-0 transition-opacity duration-300 ${
                                                hoveredRow === lesson.id ? 'opacity-100' : ''
                                            }`}
                                        ></div>
                                        {lesson.content ? (
                                            <FileText
                                                className={`h-4 w-4 transition-colors duration-300 relative z-10 ${
                                                    hoveredRow === lesson.id ? 'text-primary' : 'text-muted-foreground'
                                                }`}
                                            />
                                        ) : (
                                            <FileCode
                                                className={`h-4 w-4 transition-colors duration-300 relative z-10 ${
                                                    hoveredRow === lesson.id ? 'text-primary' : 'text-muted-foreground'
                                                }`}
                                            />
                                        )}
                                    </div>
                                    <span
                                        className={`transition-colors duration-300 font-bold ${
                                            hoveredRow === lesson.id
                                                ? 'bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent'
                                                : ''
                                        }`}
                                    >
                                        {lesson.title}
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell
                                className={`text-muted-foreground truncate max-w-[150px] transition-colors duration-300 ${
                                    hoveredRow === lesson.id ? 'text-foreground' : ''
                                }`}
                            >
                                {lesson.slug ?? '-'}
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant={lesson.content ? 'default' : 'outline'}
                                    className={`transition-all duration-300 ${
                                        lesson.content
                                            ? hoveredRow === lesson.id
                                                ? 'bg-gradient-to-r from-primary to-secondary border-primary/20'
                                                : ''
                                            : hoveredRow === lesson.id
                                              ? 'border-primary/40 text-primary'
                                              : ''
                                    }`}
                                >
                                    {lesson.content ? 'Has Content' : 'Empty'}
                                </Badge>
                            </TableCell>

                            <TableCell className="flex justify-end">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className={`px-3 transition-colors duration-300 ${
                                                hoveredRow === lesson.id ? 'text-primary hover:text-primary/80' : ''
                                            }`}
                                        >
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="end"
                                        className="w-56 px-4 py-2 border-border/40 backdrop-blur-sm bg-background/90"
                                    >
                                        <DropdownMenuLabel className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                            Lesson Actions
                                        </DropdownMenuLabel>
                                        <DropdownMenuItem
                                            onClick={() => onEditLesson(lesson)}
                                            className="cursor-pointer hover:bg-primary/5 focus:bg-primary/5"
                                        >
                                            <Pencil className="mr-2 h-4 w-4" /> Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="text-destructive cursor-pointer hover:bg-destructive/5 focus:bg-destructive/5"
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
