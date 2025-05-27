'use client';

import React, { useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, CheckCircle, Clock, FileCode, FileText, MoreVertical, Pencil, Plus, Trash2 } from 'lucide-react';

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
        return (
            <motion.div
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/50 p-12"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5"></div>
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-tr from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl"></div>

                <div className="relative z-10 flex flex-col items-center justify-center gap-6">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-full blur-lg opacity-75"></div>
                        <div className="relative bg-white/80 backdrop-blur-sm rounded-full p-6 shadow-xl">
                            <BookOpen className="h-12 w-12 text-emerald-600" />
                        </div>
                    </div>
                    <div className="text-center space-y-2">
                        <h3 className="text-xl font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                            Пока нет уроков
                        </h3>
                        <p className="text-slate-600 max-w-md">
                            Начните создавать увлекательные уроки для вашего курса. Каждый урок приближает студентов к
                            их цели!
                        </p>
                    </div>
                    <Button
                        onClick={() => onEditLesson(null as any)}
                        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Создать первый урок
                    </Button>
                </div>
            </motion.div>
        );
    }

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 },
    };

    return (
        <div className="relative">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-lg blur opacity-75"></div>
                        <div className="relative bg-white/80 backdrop-blur-sm rounded-lg p-2">
                            <BookOpen className="h-5 w-5 text-emerald-600" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                            Уроки курса
                        </h3>
                        <p className="text-sm text-slate-500">Всего уроков: {lessons.length}</p>
                    </div>
                </div>
                <Button
                    onClick={() => onEditLesson(null as any)}
                    size="sm"
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить урок
                </Button>
            </div>

            <div className="overflow-hidden rounded-2xl bg-white/70 backdrop-blur-lg shadow-xl border border-white/50">
                <div className="overflow-x-auto">
                    <Table className="min-w-full">
                        <TableHeader>
                            <TableRow className="bg-gradient-to-r from-emerald-50/50 to-teal-50/50 hover:from-emerald-50/70 hover:to-teal-50/70 border-b border-emerald-100/50">
                                <TableHead className="font-semibold text-emerald-700 py-4">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        Название урока
                                    </div>
                                </TableHead>
                                <TableHead className="font-semibold text-emerald-700">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4" />
                                        Slug
                                    </div>
                                </TableHead>
                                <TableHead className="font-semibold text-emerald-700">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="h-4 w-4" />
                                        Статус
                                    </div>
                                </TableHead>
                                <TableHead className="text-right font-semibold text-emerald-700">Действия</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <AnimatePresence>
                                {lessons.map((lesson, index) => (
                                    <motion.tr
                                        key={lesson.slug}
                                        className={`group transition-all duration-300 border-b border-slate-100/50 ${
                                            hoveredRow === lesson.id
                                                ? 'bg-gradient-to-r from-emerald-50/30 to-teal-50/30 shadow-sm'
                                                : 'bg-white/40 hover:bg-white/60'
                                        }`}
                                        onMouseEnter={() => setHoveredRow(lesson.id)}
                                        onMouseLeave={() => setHoveredRow(null)}
                                        variants={item}
                                        initial="hidden"
                                        animate="show"
                                        exit="hidden"
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                    >
                                        <TableCell className="py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <div
                                                        className={`absolute inset-0 rounded-full blur-sm transition-opacity duration-300 ${
                                                            hoveredRow === lesson.id
                                                                ? 'opacity-100 bg-gradient-to-r from-emerald-500/20 to-teal-500/20'
                                                                : 'opacity-0'
                                                        }`}
                                                    ></div>
                                                    <div
                                                        className={`relative p-2 rounded-full transition-all duration-300 ${
                                                            hoveredRow === lesson.id
                                                                ? 'bg-gradient-to-r from-emerald-100 to-teal-100'
                                                                : 'bg-slate-100'
                                                        }`}
                                                    >
                                                        {lesson.content ? (
                                                            <FileText
                                                                className={`h-4 w-4 transition-colors duration-300 ${
                                                                    hoveredRow === lesson.id
                                                                        ? 'text-emerald-600'
                                                                        : 'text-slate-500'
                                                                }`}
                                                            />
                                                        ) : (
                                                            <FileCode
                                                                className={`h-4 w-4 transition-colors duration-300 ${
                                                                    hoveredRow === lesson.id
                                                                        ? 'text-emerald-600'
                                                                        : 'text-slate-500'
                                                                }`}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4
                                                        className={`font-medium truncate transition-all duration-300 ${
                                                            hoveredRow === lesson.id
                                                                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent'
                                                                : 'text-slate-800'
                                                        }`}
                                                    >
                                                        {lesson.title}
                                                    </h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-xs text-slate-500">Урок {index + 1}</span>
                                                        {(lesson.content ||
                                                            (lesson.attachments && lesson.attachments.length > 0) ||
                                                            lesson.mainAttachment ||
                                                            (lesson.tasks && lesson.tasks.length > 0)) && (
                                                            <Badge
                                                                variant="outline"
                                                                className="text-xs px-2 py-0 bg-emerald-50 text-emerald-600 border-emerald-200"
                                                            >
                                                                Готов
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <code
                                                className={`text-xs px-2 py-1 rounded-md transition-colors duration-300 ${
                                                    hoveredRow === lesson.id
                                                        ? 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700'
                                                        : 'bg-slate-100 text-slate-600'
                                                }`}
                                            >
                                                {lesson.slug || '-'}
                                            </code>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    lesson.content ||
                                                    (lesson.attachments && lesson.attachments.length > 0) ||
                                                    lesson.mainAttachment ||
                                                    (lesson.tasks && lesson.tasks.length > 0)
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                className={`transition-all duration-300 ${
                                                    lesson.content ||
                                                    (lesson.attachments && lesson.attachments.length > 0) ||
                                                    lesson.mainAttachment ||
                                                    (lesson.tasks && lesson.tasks.length > 0)
                                                        ? hoveredRow === lesson.id
                                                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                                                            : 'bg-emerald-600 text-white'
                                                        : hoveredRow === lesson.id
                                                          ? 'border-emerald-400 text-emerald-600 bg-emerald-50'
                                                          : 'border-slate-300 text-slate-600'
                                                }`}
                                            >
                                                {lesson.content ||
                                                (lesson.attachments && lesson.attachments.length > 0) ||
                                                lesson.mainAttachment ||
                                                (lesson.tasks && lesson.tasks.length > 0)
                                                    ? 'Есть контент'
                                                    : 'Пустой'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className={`rounded-full h-8 w-8 transition-all duration-300 ${
                                                            hoveredRow === lesson.id
                                                                ? 'bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-600 hover:from-emerald-200 hover:to-teal-200'
                                                                : 'hover:bg-slate-100'
                                                        }`}
                                                    >
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent
                                                    align="end"
                                                    className="w-56 p-2 bg-white/90 backdrop-blur-lg border border-white/50 shadow-xl rounded-xl"
                                                >
                                                    <DropdownMenuLabel className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent font-medium">
                                                        Действия с уроком
                                                    </DropdownMenuLabel>
                                                    <DropdownMenuItem
                                                        onClick={() => onEditLesson(lesson)}
                                                        className="cursor-pointer hover:bg-emerald-50 focus:bg-emerald-50 rounded-lg transition-colors my-1"
                                                    >
                                                        <Pencil className="mr-2 h-4 w-4 text-emerald-600" />{' '}
                                                        Редактировать
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive cursor-pointer hover:bg-red-50 focus:bg-red-50 rounded-lg transition-colors my-1"
                                                        onClick={() => onDeleteLesson(lesson.id, lesson.title)}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" /> Удалить
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
