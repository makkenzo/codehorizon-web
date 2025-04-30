import { ReactNode, createContext, useContext } from 'react';

import { Course, Lesson } from '@/types';

interface CourseLearnContextType {
    course: Course | null;
    currentLesson: Lesson | null;
}

const CourseLearnContext = createContext<CourseLearnContextType | undefined>(undefined);

export const CourseLearnProvider = ({
    children,
    course,
    currentLesson,
}: {
    children: ReactNode;
    course: Course | null;
    currentLesson: Lesson | null;
}) => {
    return <CourseLearnContext.Provider value={{ course, currentLesson }}>{children}</CourseLearnContext.Provider>;
};

export const useCourseLearnContext = (): CourseLearnContextType => {
    const context = useContext(CourseLearnContext);
    if (context === undefined) {
        throw new Error('useCourseLearnContext must be used within a CourseLearnProvider');
    }
    return context;
};
