import { Metadata } from 'next';

interface PageMetadata {
    title: string;
    description: string;
    keywords?: string;
    imageUrl?: string;
    path: string;
}

const SITE_NAME = 'CodeHorizon';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://codehorizon.makkenzo.com';

const DEFAULT_KEYWORDS = 'обучение, курсы, программирование, веб-разработка, онлайн курсы, IT, CodeHorizon';
const DEFAULT_IMAGE_URL = `${BASE_URL}/opengraph-image.jpg`;

export const createMetadata = ({ title, description, keywords, imageUrl, path }: PageMetadata): Metadata => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    const effectiveImageUrl = imageUrl || DEFAULT_IMAGE_URL;
    const canonicalUrl = `${BASE_URL}${path === '/' ? '' : path}`;

    return {
        metadataBase: new URL(BASE_URL),
        title: fullTitle,
        description: description,
        keywords: keywords || DEFAULT_KEYWORDS,
        openGraph: {
            title: fullTitle,
            description: description,
            url: canonicalUrl,
            siteName: SITE_NAME,
            images: [
                {
                    url: effectiveImageUrl,
                    width: 1200,
                    height: 630,
                    alt: fullTitle,
                },
            ],
            locale: 'ru_RU',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: fullTitle,
            description: description,
            images: [effectiveImageUrl],
        },
        alternates: {
            canonical: canonicalUrl,
        },
    };
};

export const homePageMetadata = createMetadata({
    title: 'Главная',
    description:
        'CodeHorizon - современная платформа для изучения программирования. Качественные курсы, тесты и интерактивные материалы для вашего обучения.',
    path: '/',
});

export const coursesPageMetadata = createMetadata({
    title: 'Каталог курсов',
    description:
        'Найдите идеальный курс для изучения программирования и веб-разработки на CodeHorizon. Широкий выбор тем и уровней сложности.',
    keywords: `${DEFAULT_KEYWORDS}, каталог курсов, найти курс`,
    path: '/courses',
});

export const signInPageMetadata = createMetadata({
    title: 'Вход',
    description: 'Войдите в свой аккаунт на CodeHorizon, чтобы продолжить обучение и получить доступ к своим курсам.',
    path: '/sign-in',
});

export const signUpPageMetadata = createMetadata({
    title: 'Регистрация',
    description:
        'Присоединяйтесь к CodeHorizon! Зарегистрируйтесь, чтобы начать свой путь в мир программирования с нашими курсами.',
    path: '/sign-up',
});

export const forgotPasswordPageMetadata = createMetadata({
    title: 'Восстановление пароля',
    description: 'Забыли пароль от вашего аккаунта на CodeHorizon? Восстановите доступ здесь.',
    path: '/forgot-password',
});

export const resetPasswordPageMetadata = createMetadata({
    title: 'Сброс пароля',
    description: 'Установите новый пароль для вашего аккаунта на CodeHorizon.',
    path: '/reset-password',
});

// Для юридических страниц
export const termsPageMetadata = createMetadata({
    title: 'Условия использования',
    description: `Ознакомьтесь с условиями использования платформы CodeHorizon.`,
    path: '/legal/terms',
});

export const privacyPageMetadata = createMetadata({
    title: 'Политика конфиденциальности',
    description: `Узнайте, как CodeHorizon обрабатывает и защищает ваши персональные данные.`,
    path: '/legal/privacy',
});
