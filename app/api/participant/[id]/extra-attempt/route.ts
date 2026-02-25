import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { canAttemptExtra } = await req.json();

        const participant = await prisma.participant.update({
            where: { id },
            data: { canAttemptExtra }
        });

        return NextResponse.json(participant);
    } catch (error: any) {
        console.error('Extra attempt toggle error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
