import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const { participantId, timeRemaining } = await req.json();

        if (!participantId) {
            return NextResponse.json({ error: 'Participant ID is required' }, { status: 400 });
        }

        const participant = await prisma.participant.update({
            where: { id: participantId },
            data: {
                lastActive: new Date(),
                isStarted: true,
                timeRemaining: timeRemaining !== undefined ? timeRemaining : undefined
            }
        });

        return NextResponse.json({
            success: true,
            isLocked: participant.isLocked
        });
    } catch (error: any) {
        console.error('Heartbeat error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
