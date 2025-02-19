import CourseCatalog from '@/components/course/catalog';
import HeroCarousel from '@/components/hero-carousel';
import { AuthProvider } from '@/providers/auth-provider';

export default function Home() {
    return (
        <AuthProvider>
            <div className="xl:px-0 px-8 max-w-[1208px] space-y-[40px] mx-auto mt-[40px]">
                <HeroCarousel />
                <CourseCatalog />
            </div>
        </AuthProvider>
    );
}
