import ProfileHorizontalNav from '@/components/profile-horizontal-nav';
import PageWrapper from '@/components/reusable/page-wrapper';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
    return (
        <PageWrapper>
            <div className="flex flex-col">
                <div className="gap-4 flex flex-col">
                    <ProfileHorizontalNav />
                </div>
                {children}
            </div>
        </PageWrapper>
    );
}

