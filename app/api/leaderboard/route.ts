import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const examId = searchParams.get('examId');

    try {
        // In a real app, calculate rankings from submissions
        // For this prototype, return all participants with their current status
        const participants = await prisma.participant.findMany({
            include: {
                submissions: true
            },
            orderBy: [
                { score: 'desc' },
                { totalTime: 'asc' }
            ]
        });

        return NextResponse.json(participants);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
