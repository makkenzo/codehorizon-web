import ApiClient from './api-client';

class S3ApiClient extends ApiClient {
    async uploadFile(file: File, directory: string) {
        try {
            const isDirectoryValid = directory.match(/^[a-z0-9]+(?:[._-][a-z0-9]+)*$/);

            if (!isDirectoryValid) {
                throw new Error('Неверный формат папки');
            }

            const formData = new FormData();
            formData.append('file', file);

            const response = await this.post<{ url: string }>(`/s3/upload?directory=${directory}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
                .then((response) => response.data)
                .catch((e) => console.error(e));

            return response;
        } catch (error) {
            console.log('Ошибка', error);
        }
    }
}

export default S3ApiClient;
