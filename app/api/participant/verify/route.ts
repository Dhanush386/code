import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const { accessCode, participantId } = await req.json();

        if (!accessCode) {
            return NextResponse.json({ error: 'Access code is required' }, { status: 400 });
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

        // Check level-specific attempts if participantId is provided
        if (participantId) {
            const levelAttempt = await prisma.levelAttempt.findUnique({
                where: {
                    participantId_examLevelId: {
                        participantId,
                        examLevelId: level.id
                    }
                }
            });

            if (levelAttempt && levelAttempt.attempts >= 2) {
                return NextResponse.json({
                    error: 'Maximum entry attempts (2) reached for this code. Please contact proctors if you need further assistance.'
                }, { status: 403 });
            }
        }

        // Enforce startTime check
        if (level.startTime && new Date() < new Date(level.startTime)) {
            const timeStr = new Date(level.startTime).toLocaleString('en-IN', {
                timeZone: 'Asia/Kolkata',
                dateStyle: 'medium',
                timeStyle: 'short'
            });
            return NextResponse.json({
                error: `This phase is scheduled to open at ${timeStr}. Please wait for the relay node to initialize.`,
                startTime: level.startTime
            }, { status: 403 });
        }

        // If participantId is provided, check which questions they've already passed
        let questionsWithStatus = level.questions;
        let participantTime = -1;
        if (participantId) {
            const participant = await prisma.participant.findUnique({
                where: { id: participantId }
            });

            if (participant) {
                participantTime = participant.timeRemaining;

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

            // Increment level-specific attempts
            await prisma.levelAttempt.upsert({
                where: {
                    participantId_examLevelId: {
                        participantId,
                        examLevelId: level.id
                    }
                },
                update: { attempts: { increment: 1 } },
                create: {
                    participantId,
                    examLevelId: level.id,
                    attempts: 1
                }
            });
        }

        // Return the levels with status
        return NextResponse.json({
            ...level,
            questions: questionsWithStatus,
            timeRemaining: participantTime
        });
    } catch (error: any) {
        console.error('Verify code error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
