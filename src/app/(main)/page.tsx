import CourseCatalog from '@/components/course/catalog';
import HeroCarousel from '@/components/hero-carousel';
import PageWrapper from '@/components/reusable/page-wrapper';

export default function Home() {
    return (
        <PageWrapper className="space-y-[40px] ">
            <HeroCarousel />
            <CourseCatalog />
        </PageWrapper>
    );
}
