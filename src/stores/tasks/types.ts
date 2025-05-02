import { AdminTaskDTO } from '@/types/admin';

export type TaskCheckStatus = boolean | null;

export interface TaskState {
    taskId: string;
    userAnswer: string;
    checkStatus: TaskCheckStatus;
}

export interface LessonTasksState {
    lessons: {
        [lessonKey: string]:
            | {
                  tasks: {
                      [taskId: string]: TaskState;
                  };
              }
            | undefined;
    };
    congratsShownForCourses: string[];
}

export interface LessonTasksActions {
    initializeLesson: (lessonKey: string, tasks: AdminTaskDTO[]) => void;
    updateUserAnswer: (lessonKey: string, taskId: string, answer: string) => void;
    updateCheckStatus: (lessonKey: string, taskId: string, status: TaskCheckStatus) => void;
    getTaskState: (lessonKey: string, taskId: string) => TaskState | undefined;
    getAllTasksCompleted: (lessonKey: string) => boolean;
    clearLessonState: (lessonKey: string) => void;
    congratsShownForCourses: string[];
    markCongratsAsShown: (courseId: string) => void;
    clearAllTasksState: () => void;
}

export type LessonTasksStore = LessonTasksState & LessonTasksActions;
