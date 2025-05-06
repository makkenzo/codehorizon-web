import { CertificateDTO } from '@/types/certificate';

import ApiClient from './api-client';

class CertificateApiClient extends ApiClient {
    async getMyCertificates(): Promise<CertificateDTO[] | null> {
        try {
            const response = await this.get<CertificateDTO[]>('/users/me/certificates');
            return response.data;
        } catch (error) {
            console.error('Ошибка получения списка сертификатов:', error);
            return null;
        }
    }

    async downloadCertificate(certificateId: string): Promise<Blob | null> {
        try {
            const response = await this.get<Blob>(`/certificates/${certificateId}/download`, {
                responseType: 'blob',
            });
            return response.data;
        } catch (error) {
            console.error(`Ошибка скачивания сертификата ${certificateId}:`, error);
            return null;
        }
    }
}

export const certificateApiClient = new CertificateApiClient();
