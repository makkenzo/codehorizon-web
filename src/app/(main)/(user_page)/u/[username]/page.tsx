import ProfileApiClient from '@/server/profile';

interface UserPageProps {
    params: { username: string };
}

const UserPage = ({ params }: UserPageProps) => {
    const { username } = params;

    return (
        <div>
            <h1>{username}</h1>
        </div>
    );
};

export default UserPage;

