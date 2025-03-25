interface PriceProps {
    price: number;
    discount?: number;
}

const Price = ({ price, discount }: PriceProps) => {
    if (discount) {
        return (
            <div className="flex items-start gap-1">
                <span className="text-xl font-semibold">${discount > 0 ? (price - discount).toFixed(2) : price}</span>
                {discount > 0 && <span className="line-through text-black-60/60">${price.toFixed(2)}</span>}
            </div>
        );
    }
    return (
        <div className="flex items-start gap-1">
            <span className="text-xl font-semibold">${price.toFixed(2)}</span>
        </div>
    );
};

export default Price;
