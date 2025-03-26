import { cn } from '@/lib/utils';

interface PriceProps {
    price: number;
    discount?: number;
    priceClassName?: string;
    discountPriceClassName?: string;
}

const Price = ({ price, discount, priceClassName, discountPriceClassName }: PriceProps) => {
    if (discount) {
        return (
            <div className="flex items-start gap-1">
                <span className={cn('text-xl font-semibold', priceClassName)}>
                    ${discount > 0 ? (price - discount).toFixed(2) : price}
                </span>
                {discount > 0 && (
                    <span className={cn('line-through text-black-60/60', discountPriceClassName)}>
                        ${price.toFixed(2)}
                    </span>
                )}
            </div>
        );
    }
    return (
        <div className="flex items-start gap-1">
            <span className={cn('text-xl font-semibold', priceClassName)}>${price.toFixed(2)}</span>
        </div>
    );
};

export default Price;
