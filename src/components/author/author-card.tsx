import { useState } from 'react';

import { BookOpen } from 'lucide-react';

import Link from 'next/link';

import { getDisplayName, getInitials } from '@/lib/utils';
import { PopularAuthorDTO } from '@/types';

import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Card, CardContent } from '../ui/card';

interface AuthorCardProps {
    author: PopularAuthorDTO;
}

const AuthorCard = ({ author }: AuthorCardProps) => {
    const [hoveredAuthor, setHoveredAuthor] = useState<string | null>(null);

    return (
        <Link
            href={`/u/${author.username}`}
            onMouseEnter={() => setHoveredAuthor(author.userId)}
            onMouseLeave={() => setHoveredAuthor(null)}
            className="block h-full"
        >
            <Card
                className={`overflow-hidden h-full p-0 transition-all duration-300 ${
                    hoveredAuthor === author.userId ? 'shadow-lg transform -translate-y-1' : 'shadow-sm'
                }`}
            >
                <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                        <Avatar className="h-24 w-24 mb-4">
                            <AvatarImage src={author.avatarUrl || undefined} alt={getDisplayName(author)} />
                            <AvatarFallback
                                style={{ backgroundColor: author.avatarColor || undefined }}
                                className="text-xl"
                            >
                                {getInitials(author)}
                            </AvatarFallback>
                        </Avatar>

                        <h3 className="font-semibold text-xl mb-1">{getDisplayName(author)}</h3>
                        <p className="text-muted-foreground text-sm mb-4">@{author.username}</p>

                        <div className="flex items-center justify-center mt-2 text-sm">
                            <BookOpen className="h-4 w-4 mr-1 text-muted-foreground" />
                            <span>
                                {author.courseCount} {author.courseCount === 1 ? 'курс' : 'курса'}
                            </span>
                        </div>

                        <div
                            className={`
                        mt-4 py-2 px-4 rounded-full bg-primary text-primary-foreground
                        font-medium text-sm transition-all duration-300
                        ${hoveredAuthor === author.userId ? 'opacity-100' : 'opacity-0'}
                      `}
                        >
                            Посмотреть профиль
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
};

export default AuthorCard;
