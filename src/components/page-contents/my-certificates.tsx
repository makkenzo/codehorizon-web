'use client';

import { useEffect, useState } from 'react';

import { motion } from 'framer-motion';
import { Award, Calendar, Download, Loader2, ShieldAlert } from 'lucide-react';

import PageWrapper from '@/components/reusable/page-wrapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { certificateApiClient } from '@/server/certificate';
import { CertificateDTO } from '@/types/certificate';

import { InteractiveHoverButton } from '../magicui/interactive-hover-button';

const MyCertificatesPageContent = () => {
    const [certificates, setCertificates] = useState<CertificateDTO[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    useEffect(() => {
        const fetchCertificates = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await certificateApiClient.getMyCertificates();
                if (data !== null) {
                    setCertificates(data);
                } else {
                    setError('Не удалось загрузить ваши сертификаты.');
                    setCertificates([]);
                }
            } catch (err) {
                setError('Произошла ошибка при загрузке сертификатов.');
                setCertificates([]);
                console.error(err);
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
            setError(`Не удалось скачать сертификат: ${certificate.courseTitle}`);
        } finally {
            setDownloadingId(null);
        }
    };

    const renderSkeletons = (count = 3) => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(count)].map((_, i) => (
                <Card
                    key={`skel-${i}`}
                    className="flex flex-col h-full bg-card/70 dark:bg-background/70 backdrop-blur-sm border border-border/20 hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-lg"
                >
                    <CardHeader className="pb-3 pt-5 px-5">
                        <div className="flex justify-between items-start">
                            <Skeleton className="h-5 w-1/3 rounded" />
                            <Skeleton className="h-6 w-6 rounded-full" />
                        </div>
                        <Skeleton className="h-6 w-3/4 rounded mt-2" />
                    </CardHeader>
                    <CardContent className="flex-grow px-5 pb-4 space-y-1.5">
                        <Skeleton className="h-4 w-1/2 rounded" />
                        <Skeleton className="h-4 w-2/3 rounded" />
                        <Skeleton className="h-3 w-1/3 rounded mt-1" />
                    </CardContent>
                    <CardFooter className="px-5 py-4 border-t border-border/10 dark:border-border/20">
                        <Skeleton className="h-9 w-full rounded" />
                    </CardFooter>
                </Card>
            ))}
        </div>
    );

    return (
        <PageWrapper className="mb-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
            >
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Award className="h-6 w-6 text-[#3eccb2]" />
                        <span className="bg-gradient-to-r from-[#3eccb2] to-[hsl(173,58%,39%)] bg-clip-text text-transparent">
                            Мои Сертификаты
                        </span>
                    </h1>
                </div>

                {isLoading && renderSkeletons()}

                {!isLoading && error && (
                    <Card className="border-destructive/30 bg-destructive/5 backdrop-blur-sm">
                        <CardHeader className="flex-row items-center gap-3 space-y-0 pb-3 pt-4">
                            <ShieldAlert className="h-6 w-6 text-destructive" />
                            <CardTitle className="text-destructive text-lg">Ошибка загрузки</CardTitle>
                        </CardHeader>
                        <CardContent className="pb-4">
                            <p className="text-sm text-destructive/90">{error}</p>
                        </CardContent>
                    </Card>
                )}

                {!isLoading && !error && certificates && certificates.length === 0 && (
                    <div className="text-center py-16 px-4 rounded-xl bg-card/50 dark:bg-background/50 backdrop-blur-sm border border-border/20 shadow-sm">
                        <Award className="h-16 w-16 mx-auto text-[#3eccb2]/40 mb-4" />
                        <h3 className="text-xl font-semibold mb-1 text-foreground">Сертификатов пока нет</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            Завершите любой из ваших курсов, чтобы получить свой первый сертификат и пополнить эту
                            коллекцию!
                        </p>
                    </div>
                )}

                {!isLoading && !error && certificates && certificates.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {certificates.map((cert, index) => (
                            <motion.div
                                key={cert.id}
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.07 }}
                            >
                                <Card className="flex flex-col h-full bg-card/70 dark:bg-background/70 backdrop-blur-sm border border-border/20 hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-xl py-0">
                                    <CardHeader className="pb-3 pt-5 px-5">
                                        <div className="flex justify-between items-start">
                                            <Badge
                                                variant="outline"
                                                className="border-[#3eccb2]/70 text-[#3eccb2] bg-gradient-to-r from-[#3eccb2]/5 to-transparent font-medium"
                                            >
                                                {cert.category || 'Курс'}
                                            </Badge>
                                            <div className="p-1.5 rounded-full bg-gradient-to-tr from-[#3eccb2]/20 to-transparent border border-[#3eccb2]/30">
                                                <Award className="size-4 text-[#3eccb2]" />
                                            </div>
                                        </div>
                                        <CardTitle className="text-lg font-semibold line-clamp-2 pt-2 !mt-1 text-foreground">
                                            {cert.courseTitle}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex-grow px-5 pb-4 space-y-1.5">
                                        <div className="flex items-center text-xs text-muted-foreground">
                                            <Calendar className="mr-1.5 h-3.5 w-3.5" />
                                            Выдан: {cert.completionDate}
                                        </div>
                                        {cert.instructorName && (
                                            <p className="text-xs text-muted-foreground">
                                                Инструктор: {cert.instructorName}
                                            </p>
                                        )}
                                        <p className="text-[10px] text-muted-foreground/70 pt-1">
                                            ID: {cert.uniqueCertificateId}
                                        </p>
                                    </CardContent>
                                    <CardFooter className="px-5 py-4 border-t border-border/10 dark:border-border/20">
                                        <InteractiveHoverButton
                                            onClick={() => handleDownload(cert)}
                                            disabled={downloadingId === cert.id}
                                            icon={<Download className="h-4 w-4" />}
                                            className="w-full"
                                            buttonClassName="justify-center"
                                        >
                                            Скачать PDF
                                        </InteractiveHoverButton>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>
        </PageWrapper>
    );
};

export default MyCertificatesPageContent;
