import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';
import { type VariantProps, cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
    "inline-flex hover:cursor-pointer items-center justify-center gap-2 whitespace-nowrap outline-none ring-0 rounded-md text-sm font-medium ease-in-out transition-color disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 focus-visible:bg-none active:bg-none active:bg-transparent border-1 border-transparent flex justify-center active:border-border active:text-border",
    {
        variants: {
            variant: {
                default: 'bg-primary text-primary-foreground hover:bg-accent-80 hover:text-foreground',
                'primary-inverted': 'bg-white text-primary hover:bg-accent-80 hover:text-accent-foreground',
                destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
                outline: 'border border-border bg-background hover:bg-accent hover:text-accent-foreground',
                secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
                ghost: 'hover:bg-accent hover:text-accent-foreground',
                link: 'text-primary underline-offset-4 hover:underline active:border-transparent',
            },
            size: {
                default: 'h-[41px] font-bold rounded-md px-4 has-[>svg]:px-2.5',
                sm: 'h-[32px] rounded-sm font-bold px-3 has-[>svg]:px-4',
                md: 'h-[41px] font-bold text-lg rounded-md px-4 has-[>svg]:px-[18px]',
                lg: 'h-[50px] font-bold text-xl rounded-lg px-6 has-[>svg]:px-6',
                'icon-sm': 'h-[32px] w-fit px-4 rounded-sm',
                icon: 'h-[41px] w-fit px-5 rounded-md',
                'icon-lg': 'h-[50px] w-fit px-6 rounded-lg',
                link: 'p-0',
            },
        },

        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
);

function Button({
    className,
    variant,
    isLoading = false,
    size,
    children,
    asChild = false,
    ...props
}: React.ComponentProps<'button'> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean;
        isLoading?: boolean;
    }) {
    const Comp = asChild ? Slot : 'button';

    return (
        <Comp
            className={cn(buttonVariants({ variant, size, className }))}
            {...props}
            disabled={props.disabled || isLoading}
        >
            <>
                {isLoading ? (
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-slate-600" />
                ) : null}
                {React.Children.map(children, (child) => {
                    if (React.isValidElement<React.ComponentProps<'span'>>(child) && child.type == 'span') {
                        return React.cloneElement(child, {
                            className: cn('translate-y-[0.5px]', child.props.className),
                        });
                    }

                    return child;
                })}
            </>
        </Comp>
    );
}

export { Button, buttonVariants };
