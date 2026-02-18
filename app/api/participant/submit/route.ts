import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const { participantId, questionId, score, levelNumber, timeTaken, isPassed, code, language } = await req.json();

        if (!participantId || !questionId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Create submission record
        const submission = await prisma.submission.create({
            data: {
                participantId,
                questionId,
                levelNumber,
                code: code || '',
                language: language || '',
                status: isPassed ? 'PASSED' : 'FAILED',
                score,
                timeTaken,
                createdAt: new Date()
            }
        });

        // 2. Check if this is a first-time pass for this question
        const existingPassedSubmission = await prisma.submission.findFirst({
            where: {
                participantId,
                questionId,
                status: 'PASSED'
            }
        });

        // 3. Update participant score and level ONLY if not already passed
        const participant = await prisma.participant.findUnique({
            where: { id: participantId }
        });

        if (!participant) {
            return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
        }

        // If this is a first-time pass, update score and level
        // (Note: existingPassedSubmission is null if this is the first pass being recorded right now,
        // but wait, we already created the record above at step 1!
        // So we should check if there are OTHER passed submissions.)

        const otherPassedSubmissions = await prisma.submission.findMany({
            where: {
                participantId,
                questionId,
                status: 'PASSED',
                id: { not: submission.id }
            }
        });

        const isDuplicatePass = otherPassedSubmissions.length > 0;
        let updatedParticipant = participant;

        if (isPassed && !isDuplicatePass) {
            updatedParticipant = await prisma.participant.update({
                where: { id: participantId },
                data: {
                    score: participant.score + score,
                    totalTime: participant.totalTime + timeTaken,
                    currentLevel: participant.currentLevel === levelNumber
                        ? levelNumber + 1
                        : participant.currentLevel
                }
            });
        }

        return NextResponse.json({
            success: true,
            score: updatedParticipant.score,
            currentLevel: updatedParticipant.currentLevel
        });
    } catch (error: any) {
        console.error('Submission error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
