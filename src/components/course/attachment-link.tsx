'use client';

import { Paperclip } from 'lucide-react';

import Link from 'next/link';

import { AdminAttachmentDTO } from '@/types/admin';

interface AttachmentLinkProps {
    attachment: AdminAttachmentDTO;
}

const AttachmentLink = ({ attachment }: AttachmentLinkProps) => {
    return (
        <Link
            href={attachment.url}
            target="_blank"
            rel="noopener noreferrer"
            className="not-prose inline-flex items-center gap-2 text-primary hover:underline bg-primary/10 px-3 py-1.5 rounded-md text-sm transition-colors hover:bg-primary/20"
        >
            <Paperclip className="h-4 w-4" />
            {attachment.name}
        </Link>
    );
};

export default AttachmentLink;
