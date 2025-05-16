import { Submission, SubmitAnswerPayload } from '@/types/task';

import ApiClient from './api-client';

class SubmissionApiClient extends ApiClient {
    async submitAnswer(payload: SubmitAnswerPayload): Promise<Submission> {
        try {
            const response = await this.post<Submission, SubmitAnswerPayload>('/submissions', payload);
            return response.data;
        } catch (error) {
            console.error('Error submitting answer:', error);
            throw error;
        }
    }

    async getSubmissionDetails(submissionId: string): Promise<Submission> {
        try {
            const response = await this.get<Submission>(`/submissions/${submissionId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching submission ${submissionId}:`, error);
            throw error;
        }
    }

    async getMyLatestSubmissionForTask(taskId: string): Promise<Submission | null> {
        try {
            const response = await this.get<Submission>(`/submissions/task/${taskId}/my-latest`);
            return response.data;
        } catch (error: any) {
            if (error.response && error.response.status === 404) {
                return null;
            }
            console.error(`Error fetching latest submission for task ${taskId}:`, error);
            throw error;
        }
    }
}

export const submissionApiClient = new SubmissionApiClient();
