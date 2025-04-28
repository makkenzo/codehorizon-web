'use client';

import React from 'react';

import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { EditorContent, EditorProvider, JSONContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { createLowlight } from 'lowlight';

import { cn } from '@/lib/utils';

import { EditorToolbar } from './editor-toolbar';

interface RichTextEditorProps {
    value: string;
    onChange: (richText: string) => void;
    disabled?: boolean;
    className?: string;
    toolbarClassName?: string;
    editorClassName?: string;
}

const lowlight = createLowlight();

export function RichTextEditor({
    value,
    onChange,
    disabled = false,
    className,
    toolbarClassName,
    editorClassName,
}: RichTextEditorProps) {
    let initialContent: JSONContent | string;
    try {
        const parsedJson = JSON.parse(value);

        if (parsedJson && typeof parsedJson === 'object' && parsedJson.type === 'doc') {
            initialContent = parsedJson as JSONContent;
        } else {
            initialContent = value;
        }
    } catch (e) {
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
                    'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl',
                    'min-h-[200px] w-full rounded-md rounded-t-none border border-input border-t-0 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
                    editorClassName
                ),
            },
        },

        onUpdate({ editor }) {
            onChange(editor.getHTML());
        },
    });

    return (
        <div
            className={cn(
                'rounded-md border border-input shadow-sm focus-within:ring-1 focus-within:ring-ring',
                className
            )}
        >
            <EditorToolbar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
}
