import { AdminTaskDTO } from '@/types/admin';
import { Submission } from '@/types/task';

export interface LessonTasksState {
    lessons: {
        [lessonKey: string]:
            | {
                  tasks: { [taskId: string]: AdminTaskDTO };
              }
            | undefined;
    };
    submissions: {
        [taskSpecificKey: string]: Submission | undefined;
    };
    congratsShownForCourses: string[];
}

export interface LessonTasksActions {
    initializeLesson: (lessonKey: string, tasks: AdminTaskDTO[]) => void;
    initializeOrUpdateSubmission: (lessonKey: string, taskId: string, submissionData: Submission) => void;
    getSubmissionState: (lessonKey: string, taskId: string) => Submission | undefined;
    getAllTasksCompleted: (lessonKey: string) => boolean;
    clearLessonSubmissions: (lessonKey: string) => void;
    markCongratsAsShown: (courseId: string) => void;
    clearAllTasksState: () => void;
}

export type LessonTasksStore = LessonTasksState & LessonTasksActions;
