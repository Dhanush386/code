import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const { accessCode, participantId } = await req.json();

        if (!accessCode) {
            return NextResponse.json({ error: 'Access code is required' }, { status: 400 });
        }

        // Check participant attempts if provided
        if (participantId) {
            const participant = await prisma.participant.findUnique({
                where: { id: participantId }
            });

            if (participant && participant.loginAttempts >= 2) {
                return NextResponse.json({
                    error: 'Maximum entry attempts (2) reached for this code. Please contact proctors if you need further assistance.'
                }, { status: 403 });
            }
        }

        // Fetch level data
        const level = await prisma.examLevel.findUnique({
            where: { accessCode },
            include: {
                questions: {
                    include: {
                        question: {
                            include: {
                                testCases: true
                            }
                        }
                    }
                },
                exam: true
            }
        });

        if (!level) {
            return NextResponse.json({ error: 'Invalid access code' }, { status: 404 });
        }

        // If participantId is provided, check which questions they've already passed
        let questionsWithStatus = level.questions;
        if (participantId) {
            const passedSubmissions = await prisma.submission.findMany({
                where: {
                    participantId,
                    status: 'PASSED',
                    questionId: {
                        in: level.questions.map((q: any) => q.questionId)
                    }
                },
                select: { questionId: true }
            });

            const passedIds = new Set(passedSubmissions.map((s: any) => s.questionId));

            questionsWithStatus = level.questions.map((lq: any) => ({
                ...lq,
                isPassed: passedIds.has(lq.questionId)
            }));
        }

        // Increment attempts on successful code entry
        if (participantId) {
            await prisma.participant.update({
                where: { id: participantId },
                data: { loginAttempts: { increment: 1 } }
            });
        }

        // Return the levels with status
        return NextResponse.json({
            ...level,
            questions: questionsWithStatus
        });
    } catch (error: any) {
        console.error('Verify code error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
