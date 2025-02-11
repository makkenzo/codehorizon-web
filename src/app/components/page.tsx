import { Button } from '@/components/ui/button';
import { RiProgress5Line } from 'react-icons/ri';

const Components = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
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
            <div className="border p-4 flex gap-4 items-center">
                <Button size="lg">
                    <RiProgress5Line className="size-[26px]" />
                    Large button
                </Button>
                <Button size="md">
                    <RiProgress5Line />
                    Medium button
                </Button>
                <Button size="sm">
                    <RiProgress5Line />
                    Small button
                </Button>
            </div>
        </div>
    );
};

export default Components;

