import ApiClient from './api-client';

class PaymentsApiClient extends ApiClient {
    async createCheckoutSession(courseId: string, userId: string) {
        try {
            const response = await this.post<{ sessionId: string }>('/payments/checkout', { courseId, userId }).then(
                (res) => res.data
            );

            return response.sessionId;
        } catch (error) {
            console.log('Ошибка при создании сессии оплаты', error);
        }
    }
}

export default PaymentsApiClient;
