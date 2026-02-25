import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { isLocked } = await req.json();

        const participant = await prisma.participant.update({
            where: { id },
            data: { isLocked }
        });

        return NextResponse.json(participant);
    } catch (error: any) {
        console.error('Lock toggle error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
