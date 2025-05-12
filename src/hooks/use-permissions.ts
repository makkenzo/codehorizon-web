import { useUserStore } from '@/stores/user/user-store-provider';

export const usePermissions = () => {
    const permissions = useUserStore((state) => state.permissions);

    const hasPermission = (permissionToCheck: string): boolean => {
        return !!permissions?.includes(permissionToCheck);
    };

    const hasAnyPermission = (permissionsToCheck: string[]): boolean => {
        if (!permissions) return false;
        return permissionsToCheck.some((p) => permissions.includes(p));
    };

    return { permissions, hasPermission, hasAnyPermission };
};
