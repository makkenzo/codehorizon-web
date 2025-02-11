import { Button } from '@/components/ui/button';
import { RiProgress5Line } from 'react-icons/ri';

const Components = () => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            <div className="border p-4">
                <h1 className="text-xl">Съешь еще этих французских булок, да выпей же чаю.</h1>
                <h2 className="text-lg">Съешь еще этих французских булок, да выпей же чаю.</h2>
                <h3 className="text-base">Съешь еще этих французских булок, да выпей же чаю.</h3>
                <h4 className="text-sm">Съешь еще этих французских булок, да выпей же чаю.</h4>
                <h5 className="text-xs">Съешь еще этих французских булок, да выпей же чаю.</h5>
            </div>
            <div className="border p-4">
                <h1 className="text-xl font-bold">Съешь еще этих французских булок, да выпей же чаю.</h1>
                <h2 className="text-lg font-bold">Съешь еще этих французских булок, да выпей же чаю.</h2>
                <h3 className="text-base font-bold">Съешь еще этих французских булок, да выпей же чаю.</h3>
                <h4 className="text-sm font-bold">Съешь еще этих французских булок, да выпей же чаю.</h4>
                <h5 className="text-xs font-bold">Съешь еще этих французских булок, да выпей же чаю.</h5>
            </div>
            <div className="border p-4 grid grid-cols-3 gap-4 items-center">
                <Button size="lg">
                    <RiProgress5Line className="size-[26px]" />
                    <span>Large button</span>
                </Button>
                <Button size="md">
                    <RiProgress5Line className="size-[18px]" />
                    <span>Medium button</span>
                </Button>
                <Button size="sm">
                    <RiProgress5Line />
                    <span>Small button</span>
                </Button>

                <Button size="lg">
                    <span>Large button</span>
                </Button>
                <Button size="md">
                    <span>Medium button</span>
                </Button>
                <Button size="sm">
                    <span>Small button</span>
                </Button>

                <Button size="lg" disabled>
                    <RiProgress5Line className="size-[26px]" />
                    Disabled
                </Button>
                <Button size="md" disabled>
                    <RiProgress5Line className="size-[18px]" />
                    Disabled
                </Button>
                <Button size="sm" disabled>
                    <RiProgress5Line />
                    Disabled
                </Button>
            </div>
        </div>
    );
};

export default Components;

