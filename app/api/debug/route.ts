import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
    try {
        const result = await prisma.$queryRaw`SELECT 1 as "connection_test"`;
        const stats = {
            organizerCount: await prisma.organizer.count(),
            participantCount: await prisma.participant.count(),
            examCount: await prisma.exam.count(),
            questionCount: await prisma.question.count(),
        };

        return NextResponse.json({
            status: 'connected',
            test: result,
            stats
        });
    } catch (error: any) {
        console.error('Debug API Error:', error);
        return NextResponse.json({
            status: 'failed',
            error: error.message,
            code: error.code,
            meta: error.meta
        }, { status: 500 });
    }
}
