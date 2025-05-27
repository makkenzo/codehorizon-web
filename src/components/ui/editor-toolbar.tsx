'use client';

import React from 'react';

import { type Editor } from '@tiptap/react';
import { motion } from 'framer-motion';
import {
    Bold,
    Code,
    Heading1,
    Heading2,
    Heading3,
    Italic,
    List,
    ListOrdered,
    Quote,
    Redo,
    Strikethrough,
    Underline,
    Undo,
} from 'lucide-react';

import { Button } from './button';
import { Separator } from './separator';

type Props = {
    editor: Editor | null;
};

export function EditorToolbar({ editor }: Props) {
    if (!editor) {
        return null;
    }

    const toolbarGroups = [
        {
            name: 'history',
            items: [
                {
                    icon: Undo,
                    action: () => editor.chain().focus().undo().run(),
                    isActive: false,
                    disabled: !editor.can().undo(),
                    tooltip: 'Отменить',
                },
                {
                    icon: Redo,
                    action: () => editor.chain().focus().redo().run(),
                    isActive: false,
                    disabled: !editor.can().redo(),
                    tooltip: 'Повторить',
                },
            ],
        },
        {
            name: 'headings',
            items: [
                {
                    icon: Heading1,
                    action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
                    isActive: editor.isActive('heading', { level: 1 }),
                    disabled: false,
                    tooltip: 'Заголовок 1',
                },
                {
                    icon: Heading2,
                    action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
                    isActive: editor.isActive('heading', { level: 2 }),
                    disabled: false,
                    tooltip: 'Заголовок 2',
                },
                {
                    icon: Heading3,
                    action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
                    isActive: editor.isActive('heading', { level: 3 }),
                    disabled: false,
                    tooltip: 'Заголовок 3',
                },
            ],
        },
        {
            name: 'formatting',
            items: [
                {
                    icon: Bold,
                    action: () => editor.chain().focus().toggleBold().run(),
                    isActive: editor.isActive('bold'),
                    disabled: false,
                    tooltip: 'Жирный',
                },
                {
                    icon: Italic,
                    action: () => editor.chain().focus().toggleItalic().run(),
                    isActive: editor.isActive('italic'),
                    disabled: false,
                    tooltip: 'Курсив',
                },
                {
                    icon: Underline,
                    action: () => editor.chain().focus().toggleStrike().run(),
                    isActive: editor.isActive('underline'),
                    disabled: false,
                    tooltip: 'Подчеркнутый',
                },
                {
                    icon: Strikethrough,
                    action: () => editor.chain().focus().toggleStrike().run(),
                    isActive: editor.isActive('strike'),
                    disabled: false,
                    tooltip: 'Зачеркнутый',
                },
                {
                    icon: Code,
                    action: () => editor.chain().focus().toggleCode().run(),
                    isActive: editor.isActive('code'),
                    disabled: false,
                    tooltip: 'Код',
                },
            ],
        },
        {
            name: 'lists',
            items: [
                {
                    icon: List,
                    action: () => editor.chain().focus().toggleBulletList().run(),
                    isActive: editor.isActive('bulletList'),
                    disabled: false,
                    tooltip: 'Маркированный список',
                },
                {
                    icon: ListOrdered,
                    action: () => editor.chain().focus().toggleOrderedList().run(),
                    isActive: editor.isActive('orderedList'),
                    disabled: false,
                    tooltip: 'Нумерованный список',
                },
                {
                    icon: Quote,
                    action: () => editor.chain().focus().toggleBlockquote().run(),
                    isActive: editor.isActive('blockquote'),
                    disabled: false,
                    tooltip: 'Цитата',
                },
            ],
        },
    ];

    return (
        <div className="flex items-center gap-1 p-2 flex-wrap">
            {toolbarGroups.map((group, groupIndex) => (
                <motion.div
                    key={group.name}
                    className="flex items-center gap-1"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: groupIndex * 0.05 }}
                >
                    {group.items.map((item, itemIndex) => {
                        const Icon = item.icon;
                        return (
                            <Button
                                key={itemIndex}
                                variant={item.isActive ? 'default' : 'ghost'}
                                size="sm"
                                onClick={item.action}
                                disabled={item.disabled}
                                className={`h-8 w-8 p-0 transition-all duration-200 ${
                                    item.isActive
                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                                        : 'hover:bg-blue-50 hover:text-blue-600'
                                }`}
                                title={item.tooltip}
                            >
                                <Icon className="h-4 w-4" />
                            </Button>
                        );
                    })}
                    {groupIndex < toolbarGroups.length - 1 && (
                        <Separator orientation="vertical" className="h-6 mx-1 bg-slate-200" />
                    )}
                </motion.div>
            ))}
        </div>
    );
}
