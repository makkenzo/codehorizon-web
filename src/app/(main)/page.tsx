import CourseCatalog from '@/components/course/catalog';
import HeroCarousel from '@/components/hero-carousel';
import PageWrapper from '@/components/reusable/page-wrapper';
import { AuthProvider } from '@/providers/auth-provider';

export default function Home() {
    return (
        <AuthProvider>
            <PageWrapper className="space-y-[40px] ">
                <HeroCarousel />
                <CourseCatalog />
            </PageWrapper>
        </AuthProvider>
    );
}
