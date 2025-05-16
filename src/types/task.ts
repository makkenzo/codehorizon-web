import { Attachment } from '.';
import { ProgrammingLanguage } from './admin';

export enum TaskType {
    TEXT_INPUT = 'TEXT_INPUT',
    CODE_INPUT = 'CODE_INPUT',
    MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
}

export interface TestCase {
    id: string;
    name: string;
    input: string[];
    expectedOutput: string[];
    isHidden: boolean;
    points: number;
}

export interface Task {
    id: string;
    description: string;
    solution?: string | null;
    taskType: TaskType;
    options?: string[] | null;

    language?: ProgrammingLanguage | null;
    boilerplateCode?: string | null;
    testCases: TestCase[];
}

export interface Lesson {
    id: string;
    title: string;
    slug: string;
    content: string;
    codeExamples?: string[];
    tasks?: Task[];
    attachments?: Attachment[];
    mainAttachment?: string;
    videoLength?: number;
}

export enum SubmissionStatus {
    PENDING = 'PENDING',
    CHECKING = 'CHECKING',
    CORRECT = 'CORRECT',
    INCORRECT = 'INCORRECT',
    PARTIALLY_CORRECT = 'PARTIALLY_CORRECT',
    ERROR = 'ERROR',
    TIMEOUT = 'TIMEOUT',
    MANUAL_REVIEW_REQUIRED = 'MANUAL_REVIEW_REQUIRED',
}

export interface TestRunResult {
    testCaseId: string;
    testCaseName: string;
    passed: boolean;
    actualOutput?: string[] | null;
    expectedOutput?: string[] | null;
    errorMessage?: string | null;
    executionTimeMs?: number | null;
}

export interface Submission {
    id: string;
    userId: string;
    courseId: string;
    lessonId: string;
    taskId: string;
    submittedAt: string;
    checkedAt?: string | null;
    language?: string | null;
    answerCode?: string | null;
    answerText?: string | null;
    status: SubmissionStatus;
    score?: number | null;
    feedback?: string | null;
    stdout?: string | null;
    stderr?: string | null;
    compileErrorMessage?: string | null;
    testRunResults: TestRunResult[];
}

export interface SubmitAnswerPayload {
    courseId: string;
    lessonId: string;
    taskId: string;
    language?: string;
    answerCode?: string;
    answerText?: string;
}
