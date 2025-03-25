import { BaseMetadata } from '@/types';

export const createMetadata = (path: string, pageSpecificData?: any): BaseMetadata => {
    const baseMetadata: BaseMetadata = {
        title: 'CodeHorizon | Онлайн-обучение программированию',
        description:
            'Изучайте программирование, data science и веб-разработку с помощью интерактивных курсов от ведущих экспертов',
        keywords: 'онлайн обучение, программирование, курсы, образование',
    };

    switch (true) {
        case path === '/':
            return baseMetadata;

        case path.startsWith('/courses'):
            if (pageSpecificData?.course) {
                return {
                    title: `${pageSpecificData.course.title} | CodeHorizon`,
                    description: `${pageSpecificData.course.shortDescription} Изучите ${pageSpecificData.course.title} онлайн на CodeHorizon`,
                    keywords: `${pageSpecificData.course.keywords}, обучение, онлайн курс`,
                };
            }
            return {
                title: 'Все курсы | CodeHorizon',
                description:
                    'Каталог онлайн-курсов по программированию, веб-разработке и data science. Найдите свой идеальный курс',
                keywords: 'каталог курсов, онлайн обучение, программирование',
            };

        case path.startsWith('/track'):
            if (pageSpecificData?.track) {
                return {
                    title: `${pageSpecificData.track.title} | Обучающий трек | CodeHorizon`,
                    description: `Комплексная программа обучения: ${pageSpecificData.track.description}. Станьте специалистом с CodeHorizon`,
                    keywords: `${pageSpecificData.track.keywords}, обучающий трек, карьера`,
                };
            }
            return {
                title: 'Обучающие треки | CodeHorizon',
                description:
                    'Структурированные программы обучения для построения карьеры в IT. Выберите свой путь развития',
                keywords: 'обучающие треки, карьера в IT, программы обучения',
            };

        case path.startsWith('/profile'):
            return {
                title: 'Личный кабинет | CodeHorizon',
                description: 'Управляйте своим обучением, отслеживайте прогресс и достижения на CodeHorizon',
                keywords: 'личный кабинет, прогресс обучения, достижения',
            };

        case path.startsWith('/blog'):
            if (pageSpecificData?.article) {
                return {
                    title: `${pageSpecificData.article.title} | Блог CodeHorizon`,
                    description: pageSpecificData.article.excerpt,
                    keywords: `${pageSpecificData.article.tags}, блог, образование`,
                };
            }
            return {
                title: 'Блог об IT и программировании | CodeHorizon',
                description: 'Актуальные статьи, туториалы и новости из мира программирования и IT-образования',
                keywords: 'блог, статьи, программирование, IT-образование',
            };

        default:
            return baseMetadata;
    }
};
