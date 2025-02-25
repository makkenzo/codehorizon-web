import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import PageWrapper from '@/components/reusable/page-wrapper';
import ProfileApiClient from '@/server/profile';

const profileSchema = z.object({
    firstName: z.string().nullable(),
    lastName: z.string().nullable(),
    bio: z.string().nullable(),
    location: z.string().nullable(),
    website: z.string().nullable(),
    socialLinks: z.record(z.string(), z.string()).nullable(),
});

const ProfilePage = async () => {
    // const profile = await new ProfileApiClient().getProfile();

    // const form = useForm<z.infer<typeof profileSchema>>({
    //     resolver: zodResolver(profileSchema),
    //     defaultValues: {
    //         firstName: profile.firstName,
    //         lastName: null,
    //         bio: null,
    //         location: null,
    //         website: null,
    //         socialLinks: null,
    //     },
    // });

    return <h1>ProfilePage</h1>;
};

export default ProfilePage;

