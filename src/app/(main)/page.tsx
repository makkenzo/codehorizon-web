import CourseCatalog from '@/components/course/catalog';
import Hero from '@/components/hero';
import PageWrapper from '@/components/reusable/page-wrapper';

export default function Home() {
    return (
        <>
            <Hero />
            <PageWrapper className="space-y-[40px] ">
                <CourseCatalog />
            </PageWrapper>
        </>
    );
}
