import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;

        const participant = await prisma.participant.findUnique({
            where: { id }
        });

        if (!participant) {
            return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
        }

        return NextResponse.json(participant);
    } catch (error: any) {
        console.error('Fetch profile error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
