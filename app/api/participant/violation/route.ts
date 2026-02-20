import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const { participantId, reason } = await req.json();

        if (!participantId) {
            return NextResponse.json({ error: 'Participant ID is required' }, { status: 400 });
        }

        // 1. Fetch current participant
        const participant = await prisma.participant.findUnique({
            where: { id: participantId }
        });

        if (!participant) {
            return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
        }

        // 2. Calculate penalty (2 marks deduction)
        // Ensure score doesn't go below 0
        const newScore = Math.max(0, participant.score - 2);
        const newViolationCount = participant.violationCount + 1;

        console.log(`[VIOLATION] Participant ${participant.teamName} (${participantId}): ${reason}. Penalty applied. Old Score: ${participant.score}, New Score: ${newScore}`);

        // 3. Update participant
        const updatedParticipant = await prisma.participant.update({
            where: { id: participantId },
            data: {
                score: newScore,
                violationCount: newViolationCount,
                lastActive: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            score: updatedParticipant.score,
            violationCount: updatedParticipant.violationCount,
            teamName: updatedParticipant.teamName
        });
    } catch (error: any) {
        console.error('Violation processing error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
