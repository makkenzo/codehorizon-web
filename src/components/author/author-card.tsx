'use client';

import { useState } from 'react';

import { motion } from 'framer-motion';
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
    const isHovered = hoveredAuthor === author.userId;

    return (
        <Link
            href={`/u/${author.username}`}
            onMouseEnter={() => setHoveredAuthor(author.userId)}
            onMouseLeave={() => setHoveredAuthor(null)}
            className="block h-full"
        >
            <motion.div whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 400, damping: 17 }}>
                <Card
                    className={`overflow-hidden h-full p-0 transition-all duration-300 relative border-border/50 ${
                        isHovered ? 'shadow-lg border-primary/20' : 'shadow-sm'
                    }`}
                >
                    {/* Background gradient effect */}
                    <div
                        className={`absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 transition-opacity duration-300 ${
                            isHovered ? 'opacity-100' : ''
                        }`}
                    />

                    {/* Decorative elements */}
                    <div
                        className={`absolute -top-2 -right-2 w-6 h-6 rounded-full border border-primary/20 transition-all duration-300 ${
                            isHovered ? 'opacity-100' : 'opacity-0'
                        }`}
                    >
                        <motion.div
                            className="w-full h-full"
                            animate={
                                isHovered
                                    ? {
                                          y: [0, -5, 0],
                                          x: [0, 3, 0],
                                      }
                                    : {}
                            }
                            transition={{
                                duration: 4,
                                repeat: Number.POSITIVE_INFINITY,
                                repeatType: 'reverse',
                            }}
                        />
                    </div>

                    <div
                        className={`absolute -bottom-2 -left-2 w-4 h-4 rounded-md rotate-12 border border-secondary/20 transition-all duration-300 ${
                            isHovered ? 'opacity-100' : 'opacity-0'
                        }`}
                    >
                        <motion.div
                            className="w-full h-full"
                            animate={
                                isHovered
                                    ? {
                                          rotate: [12, -12, 12],
                                      }
                                    : {}
                            }
                            transition={{
                                duration: 5,
                                repeat: Number.POSITIVE_INFINITY,
                                repeatType: 'reverse',
                            }}
                        />
                    </div>

                    <CardContent className="p-6 relative z-10">
                        <div className="flex flex-col items-center text-center">
                            <div className="relative">
                                {/* Avatar glow effect */}
                                <div
                                    className={`absolute -inset-1 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 blur-md transition-opacity duration-300 ${
                                        isHovered ? 'opacity-70' : 'opacity-0'
                                    }`}
                                />

                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                                >
                                    <Avatar className="h-24 w-24 mb-4 relative border-2 border-background">
                                        <AvatarImage src={author.avatarUrl || undefined} alt={getDisplayName(author)} />
                                        <AvatarFallback
                                            style={{ backgroundColor: author.avatarColor || undefined }}
                                            className="text-xl"
                                        >
                                            {getInitials(author)}
                                        </AvatarFallback>
                                    </Avatar>
                                </motion.div>
                            </div>

                            <motion.h3
                                className={`font-semibold text-xl mb-1 transition-colors duration-300 ${isHovered ? 'text-primary' : ''}`}
                                animate={isHovered ? { scale: 1.03 } : { scale: 1 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                            >
                                {getDisplayName(author)}
                            </motion.h3>

                            <p className="text-muted-foreground text-sm mb-4">@{author.username}</p>

                            <div className="flex items-center justify-center mt-2 text-sm">
                                <motion.div
                                    className="flex items-center"
                                    animate={isHovered ? { y: [0, -2, 0] } : {}}
                                    transition={{ duration: 1, repeat: isHovered ? Number.POSITIVE_INFINITY : 0 }}
                                >
                                    <BookOpen
                                        className={`h-4 w-4 mr-1 transition-colors duration-300 ${isHovered ? 'text-primary' : 'text-muted-foreground'}`}
                                    />
                                    <span>
                                        {author.courseCount} {author.courseCount === 1 ? 'курс' : 'курса'}
                                    </span>
                                </motion.div>
                            </div>

                            <motion.div
                                className="mt-4 py-2 px-4 rounded-full bg-primary text-primary-foreground font-medium text-sm"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{
                                    opacity: isHovered ? 1 : 0,
                                    y: isHovered ? 0 : 10,
                                }}
                                transition={{ duration: 0.2 }}
                            >
                                Посмотреть профиль
                            </motion.div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </Link>
    );
};

export default AuthorCard;
