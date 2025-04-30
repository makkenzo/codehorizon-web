'use client';

import { FileArchive, FileAudio, FileCode, FileImage, FileText, FileVideo, Paperclip } from 'lucide-react';

import Link from 'next/link';

import { cn } from '@/lib/utils';
import { AdminAttachmentDTO } from '@/types/admin';

interface AttachmentLinkProps {
    attachment: AdminAttachmentDTO;
    className?: string;
}

const getFileIcon = (fileName: string): React.ReactNode => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'txt':
        case 'md':
        case 'pdf':
        case 'doc':
        case 'docx':
            return <FileText className="h-4 w-4 shrink-0" />;
        case 'js':
        case 'ts':
        case 'jsx':
        case 'tsx':
        case 'py':
        case 'java':
        case 'kt':
        case 'html':
        case 'css':
        case 'json':
            return <FileCode className="h-4 w-4 shrink-0" />;
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'gif':
        case 'webp':
        case 'svg':
            return <FileImage className="h-4 w-4 shrink-0" />;
        case 'mp4':
        case 'webm':
        case 'mov':
        case 'avi':
            return <FileVideo className="h-4 w-4 shrink-0" />;
        case 'mp3':
        case 'wav':
        case 'ogg':
            return <FileAudio className="h-4 w-4 shrink-0" />;
        case 'zip':
        case 'rar':
        case '7z':
        case 'tar':
        case 'gz':
            return <FileArchive className="h-4 w-4 shrink-0" />;
        default:
            return <Paperclip className="h-4 w-4 shrink-0" />;
    }
};

const AttachmentLink = ({ attachment, className }: AttachmentLinkProps) => {
    const icon = getFileIcon(attachment.name || attachment.url);

    return (
        <Link
            href={attachment.url}
            target="_blank"
            rel="noopener noreferrer"
            download
            className={cn(
                'not-prose inline-flex items-center gap-2 text-primary hover:underline bg-primary/10 px-3 py-1.5 rounded-md text-sm transition-colors hover:bg-primary/20 break-all', // Добавил break-all для длинных имен
                className
            )}
            title={`Скачать ${attachment.name || 'файл'}`}
        >
            {icon}
            <span className="truncate">{attachment.name || 'Скачать файл'}</span>
        </Link>
    );
};

export default AttachmentLink;
