'use client';

import { useEffect, useState } from 'react';

import { Award, Calendar, Download, ShieldAlert } from 'lucide-react';

import PageWrapper from '@/components/reusable/page-wrapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { certificateApiClient } from '@/server/certificate';
import { CertificateDTO } from '@/types/certificate';

const MyCertificatesPageContent = () => {
    const [certificates, setCertificates] = useState<CertificateDTO[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    useEffect(() => {
        const fetchCertificates = async () => {
            setIsLoading(true);
            setError(null);
            const data = await certificateApiClient.getMyCertificates();
            if (data !== null) {
                setCertificates(data);
            } else {
                setError('Не удалось загрузить ваши сертификаты.');
                setCertificates([]);
            }
            setIsLoading(false);
        };

        fetchCertificates();
    }, []);

    const handleDownload = async (certificate: CertificateDTO) => {
        setDownloadingId(certificate.id);
        try {
            const blob = await certificateApiClient.downloadCertificate(certificate.id);
            if (blob) {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `certificate-${certificate.uniqueCertificateId}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.parentNode?.removeChild(link);
                window.URL.revokeObjectURL(url);
            }
        } catch (err) {
            console.error('Download initiation failed:', err);
        } finally {
            setDownloadingId(null);
        }
    };

    const renderSkeletons = (count = 3) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(count)].map((_, i) => (
                <Card key={`skel-${i}`}>
                    <CardHeader>
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardFooter>
                        <Skeleton className="h-9 w-24" />
                    </CardFooter>
                </Card>
            ))}
        </div>
    );

    return (
        <PageWrapper>
            <h1 className="text-2xl font-bold mb-6">Мои Сертификаты</h1>

            {isLoading && renderSkeletons()}

            {!isLoading && error && (
                <Card className="border-destructive bg-destructive/10">
                    <CardHeader className="flex-row items-center gap-3 space-y-0">
                        <ShieldAlert className="h-6 w-6 text-destructive" />
                        <CardTitle className="text-destructive">Ошибка</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{error}</p>
                    </CardContent>
                </Card>
            )}

            {!isLoading && !error && certificates && certificates.length === 0 && (
                <Card>
                    <CardContent className="text-center text-muted-foreground">
                        У вас пока нет сертификатов. Завершите курс, чтобы получить свой первый!
                    </CardContent>
                </Card>
            )}

            {!isLoading && !error && certificates && certificates.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {certificates.map((cert) => (
                        <Card
                            key={cert.id}
                            className="overflow-hidden transition-all duration-200 hover:shadow-md py-0"
                        >
                            <CardHeader className="bg-primary/5 pb-2 pt-4">
                                <div className="flex items-start justify-between">
                                    <Badge variant="outline" className="border-primary bg-white text-primary">
                                        {cert.category}
                                    </Badge>
                                    <Award className="size-5 text-primary" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-gray-900">
                                    {cert.courseTitle}
                                </h3>
                                <div className="mb-3 flex items-center text-sm text-gray-500">
                                    <Calendar className="mr-1 h-4 w-4" />
                                    Выдан {cert.completionDate}
                                </div>
                                <p className="text-sm text-gray-600">Инструктор: {cert.instructorName}</p>
                            </CardContent>
                            <CardFooter className="flex justify-between border-t bg-gray-50 px-6 !py-3">
                                {/* <Link href={`/certificate?id=${cert.id}`}>
                                    <Button variant="link" size="sm">
                                        <Eye className="mr-1 h-4 w-4" />
                                        Просмотр
                                    </Button>
                                </Link> */}
                                <Button
                                    size="sm"
                                    onClick={() => handleDownload(cert)}
                                    disabled={downloadingId === cert.id}
                                    isLoading={downloadingId === cert.id}
                                >
                                    <Download className="mr-1 h-4 w-4" />
                                    Скачать PDF
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </PageWrapper>
    );
};

export default MyCertificatesPageContent;
