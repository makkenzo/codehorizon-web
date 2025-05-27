'use client';

import React from 'react';

import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { EditorContent, JSONContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { motion } from 'framer-motion';
import { createLowlight } from 'lowlight';
import { FileText, Sparkles } from 'lucide-react';

import { cn } from '@/lib/utils';

import { EditorToolbar } from './editor-toolbar';

interface RichTextEditorProps {
    value: string;
    onChange: (richText: string) => void;
    disabled?: boolean;
    className?: string;
    editorClassName?: string;
}

const lowlight = createLowlight();

export function RichTextEditor({ value, onChange, disabled = false, className, editorClassName }: RichTextEditorProps) {
    let initialContent: JSONContent | string;
    try {
        const parsedJson = JSON.parse(value);

        if (parsedJson && typeof parsedJson === 'object' && parsedJson.type === 'doc') {
            initialContent = parsedJson as JSONContent;
        } else {
            initialContent = value;
        }
    } catch (_) {
        initialContent = value;
    }

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                codeBlock: false,
            }),
            CodeBlockLowlight.configure({
                lowlight,
            }),
        ],
        content: initialContent,
        editable: !disabled,
        editorProps: {
            attributes: {
                class: cn(
                    'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-xl w-full max-w-none',
                    'min-h-[200px] w-full rounded-b-xl border-0 bg-transparent px-4 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
                    'prose-headings:text-slate-800 prose-p:text-slate-700 prose-strong:text-slate-800 prose-code:text-violet-600 prose-code:bg-violet-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded',
                    editorClassName
                ),
            },
        },

        onUpdate({ editor }) {
            onChange(editor.getHTML());
        },
    });

    return (
        <motion.div
            className={cn(
                'relative overflow-hidden rounded-xl bg-white/80 backdrop-blur-sm border border-white/50 shadow-lg group',
                className
            )}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

            <div className="relative z-10 flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-50/50 to-purple-50/50 border-b border-white/30">
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative bg-white/80 backdrop-blur-sm rounded-lg p-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                </div>
                <div className="flex-1">
                    <h4 className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Редактор контента
                    </h4>
                    <p className="text-xs text-slate-500">Создайте красивое описание с форматированием</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Sparkles className="h-3 w-3" />
                    <span>Rich Text</span>
                </div>
            </div>

            <div className="relative z-10 border-b border-white/30 bg-white/40 backdrop-blur-sm">
                <EditorToolbar editor={editor} />
            </div>
            <div className="relative z-10 bg-white/60 backdrop-blur-sm">
                <EditorContent
                    editor={editor}
                    className={cn(
                        'focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:ring-offset-0 transition-all duration-300',
                        disabled && 'opacity-50 cursor-not-allowed'
                    )}
                />
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </motion.div>
    );
}
