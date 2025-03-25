import ProfileHorizontalNav from '@/components/profile-horizontal-nav';
import PageWrapper from '@/components/reusable/page-wrapper';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
    return (
        <PageWrapper className="max-w-[845px]">
            <div className="flex flex-col">
                <div className="gap-4 flex flex-col">
                    <ProfileHorizontalNav />
                </div>
                <div className="p-4">{children}</div>
            </div>
        </PageWrapper>
    );
}
