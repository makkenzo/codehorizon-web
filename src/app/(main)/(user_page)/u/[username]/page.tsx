import PageWrapper from '@/components/reusable/page-wrapper';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ProfileApiClient from '@/server/profile';

interface UserPageProps {
    params: Promise<{ username: string }>;
}

const UserPage = async (props: UserPageProps) => {
    const params = await props.params;
    const { username } = params;

    const user = await new ProfileApiClient().getUserProfile(username);

    if (!user) {
        throw new Error('User not found');
    }

    return (
        <PageWrapper>
            <div
                className="w-full h-[150px] relative rounded"
                style={{ backgroundColor: user.profile.avatarColor ?? '#3ECCB2' }}
            >
                <div className="absolute translate-y-1/3 left-1/6 flex flex-col gap-4">
                    <Avatar className="size-40 outline-4 outline-white">
                        {user.profile.avatarUrl && <AvatarImage src={user.profile.avatarUrl} />}
                        <AvatarFallback className="text-[70px] select-none">{user.username[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <h1 className="font-bold text-2xl">
                            {user.profile.firstName} {user.profile.lastName}
                        </h1>
                        <h2 className="text-primary">@{user.username}</h2>
                    </div>
                </div>
            </div>
            <div className="mt-40 p-4 space-y-4">...</div>
        </PageWrapper>
    );
};

export default UserPage;
