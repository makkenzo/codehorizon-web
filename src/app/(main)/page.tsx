import HomeCourseCatalog from '@/components/course/home-catalog';
import Hero from '@/components/hero';
import PageWrapper from '@/components/reusable/page-wrapper';

export default function Home() {
    return (
        <>
            <Hero />
            <PageWrapper className="space-y-[40px] ">
                <HomeCourseCatalog />
            </PageWrapper>
        </>
    );
}
