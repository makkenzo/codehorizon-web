export type BaseMetadata = {
    title: string;
    description: string;
    keywords?: string;
};

export interface NavItem {
    id: string;
    href?: string;
    label: string;
    icon: React.ReactNode;
    variant?: 'ghost' | 'default';
    className?: string;
    subItems?: {
        id: string;
        href: string;
        label: string;
        icon: React.ReactNode;
        variant?: 'ghost' | 'default';
        className?: string;
    }[];
}

export interface ProfileNavItem {
    label: string;
    href: string;
}
