import PageWrapper from '@/components/reusable/page-wrapper';

const PrivacyPage = () => {
    return (
        <PageWrapper>
            <h1 className="text-center text-2xl font-semibold">Политика конфиденциальности</h1>
            <section className="space-y-4 mb-20">
                <div>
                    <h2 className="text-xl font-semibold mt-4">1. Общие положения</h2>
                    <p className="mt-2">
                        1.1. Настоящая Политика конфиденциальности (далее — «Политика») регулирует обработку и защиту
                        персональных данных пользователей образовательной платформы CodeHorizon (далее — «Платформа»).
                    </p>
                    <p>
                        1.2. Используя Платформу, пользователь (далее — «Пользователь») выражает свое согласие с
                        условиями данной Политики.
                    </p>
                    <p>
                        1.3. CodeHorizon оставляет за собой право вносить изменения в Политика без предварительного
                        уведомления Пользователей.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mt-4">2. Сбор и использование персональных данных</h2>
                    <p className="mt-2">2.1. CodeHorizon собирает и обрабатывает следующие данные Пользователей:</p>
                    <ul className="list-disc ml-6 mt-2">
                        <li>Имя и фамилию;</li>
                        <li>Адрес электронной почты;</li>
                        <li>Телефонный номер (при необходимости);</li>
                        <li>Платежные данные (при покупке курсов);</li>
                        <li>
                            Другие данные, предоставленные Пользователем при регистрации или в процессе использования
                            Платформы.
                        </li>
                    </ul>
                    <p className="mt-2">2.2. Данные используются для следующих целей:</p>
                    <ul className="list-disc ml-6 mt-2">
                        <li>Предоставление доступа к образовательным материалам;</li>
                        <li>Улучшение работы Платформы и пользовательского опыта;</li>
                        <li>Обеспечение безопасности и предотвращение мошенничества;</li>
                        <li>Информационная и маркетинговая рассылка (с согласия Пользователя).</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mt-4">3. Хранение и защита данных</h2>
                    <p className="mt-2">
                        3.1. CodeHorizon принимает все необходимые меры для защиты персональных данных Пользователей от
                        несанкционированного доступа, утраты или изменения.
                    </p>
                    <p>3.2. Данные хранятся в защищенных базах данных и доступны только уполномоченным сотрудникам.</p>
                    <p>
                        3.3. Платежные данные обрабатываются сторонними платежными системами, и CodeHorizon не хранит
                        информацию о банковских картах Пользователей.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mt-4">4. Передача данных третьим лицам</h2>
                    <p className="mt-2">
                        4.1. CodeHorizon не передает персональные данные третьим лицам без согласия Пользователя, за
                        исключением случаев, предусмотренных законом.
                    </p>
                    <p className="mt-2">4.2. Данные могут быть переданы:</p>
                    <ul className="list-disc ml-6 mt-2">
                        <li>Партнерам, предоставляющим техническую поддержку Платформы;</li>
                        <li>Платежным системам для обработки транзакций;</li>
                        <li>Государственным органам в соответствии с законодательными требованиями.</li>
                    </ul>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mt-4">5. Права пользователя</h2>
                    <p className="mt-2">5.1. Пользователь имеет право:</p>
                    <ul className="list-disc ml-6 mt-2">
                        <li>Запрашивать информацию о своих персональных данных;</li>
                        <li>Вносить изменения и корректировки в свои данные;</li>
                        <li>Требовать удаления своих данных, если это не противоречит законодательству;</li>
                        <li>Отозвать согласие на обработку персональных данных.</li>
                    </ul>
                    <p className="mt-2">
                        5.2. Для реализации своих прав Пользователь может связаться с администрацией CodeHorizon по
                        указанным контактам на Платформе.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mt-4">6. Файлы cookie</h2>
                    <p className="mt-2">
                        6.1. CodeHorizon использует файлы cookie для улучшения работы Платформы и персонализации
                        контента.
                    </p>
                    <p>
                        6.2. Пользователь может отключить файлы cookie в настройках браузера, однако это может повлиять
                        на функциональность Платформы.
                    </p>
                </div>

                <div>
                    <h2 className="text-xl font-semibold mt-4">7. Заключительные положения</h2>
                    <p className="mt-2">7.1. Настоящая Политика вступает в силу с момента публикации на Платформе.</p>
                    <p>
                        7.2. Продолжение использования Платформы после внесения изменений в Политика означает согласие
                        Пользователя с обновленными условиями.
                    </p>
                </div>
            </section>
        </PageWrapper>
    );
};

export default PrivacyPage;
