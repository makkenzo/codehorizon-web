'use client';

import { useEffect, useState } from 'react';

import { Avatar, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Carousel, CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';

const HeroCarousel = () => {
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!api) {
            return;
        }

        setCount(api.scrollSnapList().length);
        setCurrent(api.selectedScrollSnap() + 1);

        api.on('select', () => {
            setCurrent(api.selectedScrollSnap() + 1);
        });
    }, [api]);

    return (
        <Carousel
            opts={{
                loop: true,
            }}
            setApi={setApi}
            className="xl:block hidden"
        >
            <CarouselContent>
                {[1, 2, 3].map((index) => (
                    <CarouselItem key={index}>
                        <div
                            className="h-[424px] w-[1208px] bg-no-repeat p-8 grid grid-cols-3"
                            style={{
                                backgroundImage: 'url(/hero-carousel/1.svg)',
                                backgroundSize: '1208px',
                                backgroundPosition: 'center',
                            }}
                        >
                            <div className="flex flex-col gap-12 p-8 justify-center">
                                <div>
                                    <h1 className="text-white text-[32px] font-bold leading-[52px]">
                                        Узнавайте что-то новое каждый день.
                                    </h1>
                                    <p className="text-white/90">Станьте экспертами и покоряйте мир.</p>
                                </div>
                                <Button className="bg-background text-primary hover:text-white font-semibold text-xl w-fit">
                                    Исследуйте фотографию
                                </Button>
                            </div>
                            <div className="justify-end items-end flex">
                                <div className="flex items-center gap-4">
                                    <Avatar className="size-[56px] outline-4 outline-white">
                                        <AvatarImage src="/avatar.png" alt="avatar" />
                                    </Avatar>
                                    <div className="flex flex-col text-white">
                                        <h2 className="font-semibold">Jessica Wong</h2>
                                        <p>Фотограф</p>
                                    </div>
                                </div>
                            </div>
                            <div className="justify-end items-end flex">
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col text-white text-end">
                                        <h2 className="font-semibold">Победитель &quot;Photo 2017 Awwards&quot;</h2>
                                        <p>В Klevr с 2006 года.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
            <div className="flex gap-2 mt-4 justify-center items-center h-2">
                {[...Array(count)].map((_, i) => (
                    <button
                        key={i}
                        className={`transition-all rounded-full cursor-pointer ${
                            current - 1 === i ? 'h-2 w-2 bg-primary scale-100' : 'h-1 w-1 bg-gray-200'
                        }`}
                        onClick={() => api?.scrollTo(i)}
                    />
                ))}
            </div>
        </Carousel>
    );
};

export default HeroCarousel;

