import { Vibrant } from 'node-vibrant/node';

import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const imageUrl = searchParams.get('imageUrl');

    if (!imageUrl) {
        return NextResponse.json({ error: 'No image URL provided' }, { status: 400 });
    }

    try {
        const palette = await Vibrant.from(imageUrl).getPalette();

        const color = palette?.Vibrant?.hex ?? '#3ECCB2';
        console.log(color);

        return NextResponse.json({ color });
    } catch (error) {
        console.error('Error processing image:', error);
        return NextResponse.json({ error: 'Failed to process image' }, { status: 500 });
    }
}

