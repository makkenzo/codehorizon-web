import { CheckIcon } from 'lucide-react';

import { FeatureItem, Testimonial } from '@/types';

import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';

interface CourseFeatureSectionProps {
    badgeText?: string | null;
    title?: string | null;
    subtitle?: string | null;
    description?: string | null;
    features?: FeatureItem[] | null;
    benefitTitle?: string | null;
    benefitDescription?: string | null;
    testimonial?: Testimonial | null;
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
}: CourseFeatureSectionProps) {
    if (!badgeText && !title && !subtitle && !description && !features && !benefitTitle && !benefitDescription) {
        return null;
    }

    return (
        <div className="space-y-12">
            {[badgeText, title, subtitle].some((item) => item) ? (
                <div className="space-y-4">
                    {badgeText ? (
                        <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                            {badgeText}
                        </Badge>
                    ) : null}
                    {title ? (
                        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{title}</h1>
                    ) : null}
                    {subtitle ? <p className="text-lg text-muted-foreground">{subtitle}</p> : null}
                </div>
            ) : null}

            {[description, features].some((item) => item) ? (
                <div className="space-y-6 text-muted-foreground">
                    {description ? <p>{description}</p> : null}
                    {features ? (
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
                    ) : null}
                </div>
            ) : null}

            {[benefitTitle, benefitDescription].some((i) => i) ? (
                <div className="space-y-4">
                    {benefitTitle ? (
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">{benefitTitle}</h2>
                    ) : null}
                    {benefitDescription ? <p className="text-muted-foreground">{benefitDescription}</p> : null}
                </div>
            ) : null}

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
