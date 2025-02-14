import { RiProgress5Line } from 'react-icons/ri';

import GlobalSearch from '@/components/reusable/global-search';
import { Button } from '@/components/ui/button';
import { FloatingLabelInput } from '@/components/ui/floating-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
                    <span>Disabled</span>
                </Button>
                <Button size="md" disabled>
                    <RiProgress5Line className="size-[18px]" />
                    <span>Disabled</span>
                </Button>
                <Button size="sm" disabled>
                    <RiProgress5Line />
                    <span>Disabled</span>
                </Button>

                <Button size="icon-lg">
                    <RiProgress5Line className="size-[22px]" />
                </Button>
                <Button size="icon">
                    <RiProgress5Line className="size-[18px]" />
                </Button>
                <Button size="icon-sm">
                    <RiProgress5Line className="size-[13px]" />
                </Button>
            </div>
            <div className="border p-4 grid grid-cols-1 gap-4 items-center">
                <FloatingLabelInput label="Label" endIcon={<RiProgress5Line className="size-[18px] text-muted" />} />
                <FloatingLabelInput
                    value="Some text"
                    readOnly
                    endIcon={<RiProgress5Line className="size-[18px] text-muted" />}
                />
                <FloatingLabelInput
                    label="Label"
                    value="Some text"
                    readOnly
                    endIcon={<RiProgress5Line className="size-[18px] text-muted" />}
                />
                <FloatingLabelInput
                    label="Label"
                    value="Some text"
                    readOnly
                    aria-invalid
                    endIcon={<RiProgress5Line className="size-[18px] text-muted" />}
                    errMsg="Error message here!"
                />
                <GlobalSearch />
            </div>
            <div className="border p-4 grid grid-cols-1 gap-4 items-center">
                <Select>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Theme" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
};

export default Components;
