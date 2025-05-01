import { BookOpen } from 'lucide-react';
import { FaUserSecret } from 'react-icons/fa6';

import Link from 'next/link';

import { PopularAuthorDTO } from '@/types';

import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Card, CardContent } from '../ui/card';

interface AuthorCardProps {
    author: PopularAuthorDTO;
}

const AuthorCard = ({ author }: AuthorCardProps) => {
    const displayName =
        author.firstName || author.lastName
            ? `${author.firstName || ''} ${author.lastName || ''}`.trim()
            : author.username;

    return (
        <Link href={`/u/${author.username}`} className="block group">
            <Card className="overflow-hidden space-y-[40px] hover:shadow-lg transition-shadow duration-200 h-full bg-gradient-to-br from-primary/20 to-primary/5">
                <div className="h-24 relative">
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                        <Avatar
                            className="size-32 border-4 border-background group-hover:scale-105 transition-transform duration-200"
                            style={{ backgroundColor: author.avatarColor ?? undefined }}
                        >
                            {author.avatarUrl && <AvatarImage src={author.avatarUrl} alt={author.username} />}
                            <AvatarFallback className="text-2xl">
                                {displayName?.[0]?.toUpperCase() ?? <FaUserSecret />}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </div>
                <CardContent className="pt-12 p-4 text-center">
                    <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                        {displayName}
                    </h3>
                    <p className="text-sm text-muted-foreground">@{author.username}</p>
                    <div className="flex items-center justify-center gap-1 mt-2 text-xs text-muted-foreground">
                        <BookOpen className="h-3 w-3" />
                        <span>
                            {author.courseCount}{' '}
                            {author.courseCount === 1
                                ? 'курс'
                                : author.courseCount > 1 && author.courseCount < 5
                                  ? 'курса'
                                  : 'курсов'}
                        </span>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
};

export default AuthorCard;
