import { CheckIcon } from 'lucide-react';

import Image from 'next/image';

import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';

interface FeatureItem {
    title: string;
    description: string;
}

interface Testimonial {
    quote: string;
    authorName: string;
    authorTitle: string;
    avatarSrc?: string;
    avatarFallback: string;
}

interface CourseFeatureSectionProps {
    badgeText: string;
    title: string;
    subtitle: string;
    description: string;
    features: FeatureItem[];
    benefitTitle: string;
    benefitDescription: string;
    testimonial?: Testimonial;
}

export default function CourseFeatureSection({
    badgeText,
    title,
    subtitle,
    description,
    features,
    benefitTitle,
    benefitDescription,
    testimonial,
    // finalImageUrl
}: CourseFeatureSectionProps) {
    return (
        <div className="space-y-12">
            <div className="space-y-4">
                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                    {badgeText}
                </Badge>
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{title}</h1>
                <p className="text-lg text-muted-foreground">{subtitle}</p>
            </div>

            <div className="space-y-6 text-muted-foreground">
                <p>{description}</p>
                <div className="space-y-4">
                    {features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-3">
                            <div className="flex size-6 shrink-0 items-center justify-center text-primary">
                                <CheckIcon className="size-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground">{feature.title}</h3>
                                <p>{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">{benefitTitle}</h2>
                <p className="text-muted-foreground">{benefitDescription}</p>
            </div>

            {testimonial && (
                <Card className="border-l-4 border-l-primary bg-card shadow-none">
                    <CardContent className="p-6">
                        <blockquote className="mb-4 italic text-foreground">"{testimonial.quote}"</blockquote>
                        <div className="flex items-center gap-3">
                            <Avatar className="size-10">
                                {testimonial.avatarSrc && <AvatarImage src={testimonial.avatarSrc} />}
                                <AvatarFallback>{testimonial.avatarFallback}</AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="font-semibold text-foreground">{testimonial.authorName}</div>
                                <div className="text-sm text-muted-foreground">{testimonial.authorTitle}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
