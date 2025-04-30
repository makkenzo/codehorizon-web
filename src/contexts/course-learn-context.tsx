import { ReactNode, createContext, useContext, useEffect, useState } from 'react';

import { Course, CourseProgress, Lesson } from '@/types';

interface CourseLearnContextType {
    course: Course | null;
    currentLesson: Lesson | null;
    courseProgress: CourseProgress | null;
    updateCourseProgress: (newProgress: CourseProgress) => void;
}

const CourseLearnContext = createContext<CourseLearnContextType | undefined>(undefined);

export const CourseLearnProvider = ({
    children,
    course,
    currentLesson,
    initialProgress,
}: {
    children: ReactNode;
    course: Course | null;
    currentLesson: Lesson | null;
    initialProgress: CourseProgress | null;
}) => {
    const [courseProgress, setCourseProgress] = useState<CourseProgress | null>(initialProgress);

    const updateCourseProgress = (newProgress: CourseProgress) => {
        setCourseProgress(newProgress);
    };

    useEffect(() => {
        setCourseProgress(initialProgress);
    }, [initialProgress]);

    return (
        <CourseLearnContext.Provider value={{ course, currentLesson, courseProgress, updateCourseProgress }}>
            {children}
        </CourseLearnContext.Provider>
    );
};

export const useCourseLearnContext = (): CourseLearnContextType => {
    const context = useContext(CourseLearnContext);
    if (context === undefined) {
        throw new Error('useCourseLearnContext must be used within a CourseLearnProvider');
    }
    return context;
};
