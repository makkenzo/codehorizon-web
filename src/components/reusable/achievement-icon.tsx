import React from 'react';

import * as Icons from 'lucide-react';

interface AchievementIconProps extends Icons.LucideProps {
    iconName: string | null | undefined;
}

const AchievementIcon: React.FC<AchievementIconProps> = ({ iconName, ...props }) => {
    if (!iconName) {
        return <Icons.ShieldQuestion {...props} />;
    }

    const IconComponent = Icons[iconName as keyof typeof Icons] as React.ElementType | undefined;

    if (!IconComponent) {
        console.warn(`AchievementIcon: Icon "${iconName}" not found in lucide-react. Using default.`);
        return <Icons.ShieldQuestion {...props} />;
    }

    return <IconComponent {...props} />;
};

export default AchievementIcon;
