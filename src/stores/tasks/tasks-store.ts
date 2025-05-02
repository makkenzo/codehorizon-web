import { createStore } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { AdminTaskDTO } from '@/types/admin';

import { LessonTasksState, LessonTasksStore, TaskState } from './types';

export const defaultTasksState: LessonTasksState = {
    lessons: {},
};

export const createLessonTasksStore = (initState: LessonTasksState = defaultTasksState) => {
    return createStore<LessonTasksStore>()(
        persist(
            (set, get) => ({
                ...initState,
                initializeLesson: (lessonKey, tasks) =>
                    set((state) => {
                        if (!state.lessons[lessonKey]) {
                            const initialTasksState: { [taskId: string]: TaskState } = {};

                            const persistedLessonData = (get() as LessonTasksStore).lessons[lessonKey];

                            tasks.forEach((task) => {
                                const savedTaskAnswer = persistedLessonData?.tasks[task.id]?.userAnswer;
                                initialTasksState[task.id] = {
                                    taskId: task.id,
                                    userAnswer: savedTaskAnswer ?? '',
                                    checkStatus: null,
                                };
                            });

                            return {
                                lessons: {
                                    ...state.lessons,
                                    [lessonKey]: { tasks: initialTasksState },
                                },
                            };
                        }
                        return state;
                    }),
                updateUserAnswer: (lessonKey, taskId, answer) =>
                    set((state) => {
                        const lessonData = state.lessons[lessonKey];
                        if (!lessonData || !lessonData.tasks[taskId]) return state;

                        const updatedTask: TaskState = {
                            ...lessonData.tasks[taskId],
                            userAnswer: answer,
                            checkStatus: null,
                        };

                        return {
                            lessons: {
                                ...state.lessons,
                                [lessonKey]: {
                                    ...lessonData,
                                    tasks: {
                                        ...lessonData.tasks,
                                        [taskId]: updatedTask,
                                    },
                                },
                            },
                        };
                    }),
                updateCheckStatus: (lessonKey, taskId, status) =>
                    set((state) => {
                        const lessonData = state.lessons[lessonKey];
                        if (!lessonData || !lessonData.tasks[taskId]) return state;

                        const updatedTask: TaskState = {
                            ...lessonData.tasks[taskId],
                            checkStatus: status,
                        };

                        return {
                            lessons: {
                                ...state.lessons,
                                [lessonKey]: {
                                    ...lessonData,
                                    tasks: {
                                        ...lessonData.tasks,
                                        [taskId]: updatedTask,
                                    },
                                },
                            },
                        };
                    }),
                getTaskState: (lessonKey, taskId) => {
                    return get().lessons[lessonKey]?.tasks[taskId];
                },
                getAllTasksCompleted: (lessonKey) => {
                    const lessonData = get().lessons[lessonKey];
                    if (!lessonData || Object.keys(lessonData.tasks).length === 0) {
                        return true;
                    }
                    return Object.values(lessonData.tasks).every((task) => task.checkStatus === true);
                },
                clearLessonState: (lessonKey) =>
                    set((state) => {
                        const newLessons = { ...state.lessons };
                        delete newLessons[lessonKey];
                        return { lessons: newLessons };
                    }),
                clearAllTasksState: () => set({ lessons: {} }),
            }),
            {
                name: 'lesson-tasks-progress',
                storage: createJSONStorage(() => localStorage),
            }
        )
    );
};
