import { createStore } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { SubmissionStatus } from '@/types/task';

import { LessonTasksState, LessonTasksStore } from './types';

export const defaultTasksState: LessonTasksState = {
    lessons: {},
    submissions: {},
    congratsShownForCourses: [],
};

export const createLessonTasksStore = (initState: LessonTasksState = defaultTasksState) => {
    return createStore<LessonTasksStore>()(
        persist(
            (set, get) => ({
                ...initState,
                submissions: initState.submissions || {},
                initializeLesson: (lessonKey, tasks) =>
                    set((state) => {
                        const taskSpecificKeyPrefix = `${lessonKey}_task_`;
                        let needsUpdate = false;
                        const newSubmissions = { ...state.submissions };

                        tasks.forEach((task) => {
                            const currentTaskKey = `${taskSpecificKeyPrefix}${task.id}`;
                            if (!newSubmissions[currentTaskKey]) {
                                newSubmissions[currentTaskKey] = {
                                    id: '',
                                    taskId: task.id!,
                                    userId: '',
                                    courseId: '',
                                    lessonId: '',
                                    submittedAt: new Date().toISOString(),
                                    status: SubmissionStatus.PENDING,
                                    answerCode: task.boilerplateCode || '',
                                    answerText: '',
                                    language: task.language,
                                    testRunResults: [],
                                };
                                needsUpdate = true;
                            }
                        });

                        return needsUpdate ? { submissions: newSubmissions } : state;
                    }),
                initializeOrUpdateSubmission: (lessonKey, taskId, submissionData) =>
                    set((state) => {
                        const taskSpecificKey = `${lessonKey}_task_${taskId}`;
                        return {
                            submissions: {
                                ...state.submissions,
                                [taskSpecificKey]: submissionData,
                            },
                        };
                    }),
                getSubmissionState: (lessonKey, taskId) => {
                    const taskSpecificKey = `${lessonKey}_task_${taskId}`;
                    return get().submissions[taskSpecificKey];
                },
                getAllTasksCompleted: (lessonKey) => {
                    const lessonSubmissions = Object.keys(get().submissions)
                        .filter((key) => key.startsWith(lessonKey + '_task_'))
                        .map((key) => get().submissions[key]);

                    if (!lessonSubmissions || lessonSubmissions.length === 0) {
                        const course = get().lessons[lessonKey.split('_task_')[0]];
                        return !course || Object.keys(course.tasks).length === 0;
                    }
                    return lessonSubmissions.every((sub) => sub?.status === SubmissionStatus.CORRECT);
                },
                clearLessonSubmissions: (lessonKey) =>
                    set((state) => {
                        const newSubmissions = { ...state.submissions };
                        Object.keys(newSubmissions).forEach((key) => {
                            if (key.startsWith(lessonKey + '_task_')) {
                                delete newSubmissions[key];
                            }
                        });
                        return { submissions: newSubmissions };
                    }),
                markCongratsAsShown: (courseId) =>
                    set((state) => {
                        if (!state.congratsShownForCourses.includes(courseId)) {
                            return { congratsShownForCourses: [...state.congratsShownForCourses, courseId] };
                        }
                        return state;
                    }),

                clearAllTasksState: () => set({ submissions: {}, congratsShownForCourses: [] }),
            }),
            {
                name: 'lesson-tasks-submissions',
                storage: createJSONStorage(() => localStorage),
                partialize: (state) => ({
                    submissions: state.submissions,
                    congratsShownForCourses: state.congratsShownForCourses,
                }),
            }
        )
    );
};
