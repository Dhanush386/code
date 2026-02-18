import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json({ error: 'Participant ID is required' }, { status: 400 });
        }

        // Check if participant exists
        const participant = await prisma.participant.findUnique({
            where: { id }
        });

        if (!participant) {
            return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
        }

        // Manually delete dependent records first for robustness (SQLite cascade can be tricky)
        await prisma.submission.deleteMany({
            where: { participantId: id }
        });

        await prisma.participantExam.deleteMany({
            where: { participantId: id }
        });

        // Delete participant
        await prisma.participant.delete({
            where: { id }
        });

        return NextResponse.json({ message: 'Participant deleted successfully' });
    } catch (error: any) {
        console.error('Delete participant error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
