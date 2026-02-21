import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const [totalQuestions, totalExams, participants] = await Promise.all([
            prisma.question.count(),
            prisma.exam.count(),
            prisma.participant.findMany({
                select: {
                    violationCount: true
                }
            })
        ]);

        const registeredTeams = participants.length;
        const totalViolations = participants.reduce((acc, p) => acc + (p.violationCount || 0), 0);

        return NextResponse.json({
            totalQuestions,
            totalExams,
            registeredTeams,
            totalViolations
        });
    } catch (error: any) {
        console.error('API Error (/api/organizer/stats):', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
