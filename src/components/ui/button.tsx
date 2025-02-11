import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { type VariantProps, cva } from 'class-variance-authority';
import * as React from 'react';

const buttonVariants = cva(
    "inline-flex hover:cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ease-in-out duration-100 transition-color disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 ring-ring/10 dark:ring-ring/20 dark:outline-ring/40 outline-ring/50 focus-visible:bg-none active:bg-none aria-invalid:focus-visible:ring-0 active:bg-transparent active:border-1 flex justify-center active:text-border",
    {
        variants: {
            variant: {
                default: 'bg-primary text-primary-foreground hover:bg-accent-80',
                destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
                outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
                secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
                ghost: 'hover:bg-accent hover:text-accent-foreground',
                link: 'text-primary underline-offset-4 hover:underline',
            },
            size: {
                default: 'h-[41px] rounded-md px-4 has-[>svg]:px-2.5',
                sm: 'h-[32px] rounded-sm px-3 has-[>svg]:px-4',
                md: 'h-[41px] font-bold text-lg rounded-md px-4 has-[>svg]:px-[18px]',
                lg: 'h-[50px] font-bold text-xl rounded-lg px-6 has-[>svg]:px-6',
                icon: 'size-9',
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
                    console.log(child);

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

