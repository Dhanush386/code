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

        // 2. Find previous best score for this question
        const submissions = await prisma.submission.findMany({
            where: {
                participantId,
                questionId
            },
            orderBy: { score: 'desc' },
            take: 2 // We already created the current one, so we want the 2nd best if it exists
        });

        // The current submission is already in the DB (created at step 1)
        // So we filter it out to find the best PREVIOUS score
        const previousBestSubmission = submissions.find((s: any) => s.id !== submission.id);
        const previousBestScore = previousBestSubmission ? previousBestSubmission.score : 0;

        // 3. Update participant score and level
        const participant = await prisma.participant.findUnique({
            where: { id: participantId }
        });

        if (!participant) {
            return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
        }

        // Calculate score gain (new score - previous best score)
        const scoreGain = Math.max(0, score - previousBestScore);

        let updateData: any = {
            score: participant.score + scoreGain,
            totalTime: participant.totalTime + timeTaken
        };

        // Only progress level if all test cases passed
        if (isPassed) {
            // Find ALL questions in this level for this participant's exam
            const participantWithExam = await prisma.participant.findUnique({
                where: { id: participantId },
                include: {
                    exams: {
                        include: {
                            exam: {
                                include: {
                                    levels: {
                                        where: { levelNumber: levelNumber },
                                        include: {
                                            questions: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            if (participantWithExam && participantWithExam.exams.length > 0) {
                const currentLevelConfig = participantWithExam.exams[0].exam.levels[0];
                if (currentLevelConfig) {
                    const levelQuestionIds = currentLevelConfig.questions.map((q: any) => q.questionId);

                    // Count how many unique questions in this level have at least one PASSED submission
                    const passedQuestions = await prisma.submission.groupBy({
                        by: ['questionId'],
                        where: {
                            participantId: participantId,
                            questionId: { in: levelQuestionIds },
                            status: 'PASSED'
                        }
                    });

                    // If they've passed all questions in this level, move them up
                    if (passedQuestions.length === levelQuestionIds.length && levelQuestionIds.length > 0) {
                        if (participant.currentLevel === levelNumber) {
                            updateData.currentLevel = levelNumber + 1;
                            updateData.loginAttempts = 0; // Reset for next access code
                        }
                    }
                }
            }
        }

        const updatedParticipant = await prisma.participant.update({
            where: { id: participantId },
            data: updateData
        });

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
