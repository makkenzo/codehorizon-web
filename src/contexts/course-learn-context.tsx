import { ReactNode, createContext, useContext, useEffect, useState } from 'react';

import { Course, UserSpecificCourseProgressDetails } from '@/types';

interface CourseLearnContextType {
    course: Course | null;
    courseProgress: UserSpecificCourseProgressDetails | null;
    updateCourseProgress: (newProgress: UserSpecificCourseProgressDetails) => void;
}

const CourseLearnContext = createContext<CourseLearnContextType | undefined>(undefined);

export const CourseLearnProvider = ({
    children,
    course,
    initialProgress,
    updateCourseProgress,
}: {
    children: ReactNode;
    course: Course | null;
    initialProgress: UserSpecificCourseProgressDetails | null;
    updateCourseProgress: (newProgress: UserSpecificCourseProgressDetails) => void;
}) => {
    const [courseProgress, setCourseProgress] = useState<UserSpecificCourseProgressDetails | null>(initialProgress);

    useEffect(() => {
        setCourseProgress(initialProgress);
    }, [initialProgress]);

    return (
        <CourseLearnContext.Provider value={{ course, courseProgress, updateCourseProgress }}>
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
