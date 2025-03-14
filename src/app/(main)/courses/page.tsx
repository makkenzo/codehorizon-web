import CatalogFilters from '@/components/catalog/filters';
import PageWrapper from '@/components/reusable/page-wrapper';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const CoursesPage = () => {
    return (
        <PageWrapper className="grid grid-cols-4 mb-20 gap-5">
            <CatalogFilters />
            <div className="col-span-3">
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold">Все курсы</h2>
                    <Select>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Упорядочить по" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="most-popular">
                                Самые популярные
                            </SelectItem>
                            <SelectItem value="cheapest">
                                Сначала дешевые
                            </SelectItem>
                            <SelectItem value="most-expensive">
                                Сначала дорогие
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-3 bg-emerald-200">
                    {Array(12)
                        .fill(0)
                        .map((course, idx) => (
                            <div
                                key={idx}
                                className="w-[285px] h-[318px] text-center"
                            >
                                Card
                            </div>
                        ))}
                </div>
                <div className="bg-purple-200">Pagination here</div>
            </div>
        </PageWrapper>
    );
};

export default CoursesPage;

