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

            if (participant && participant.loginAttempts > 2) {
                return NextResponse.json({
                    error: 'Maximum login attempts (2) reached. Please contact proctors if this is an error.'
                }, { status: 403 });
            }
        }

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

        // Simplicity for this prototype: return all questions for this level
        // In a more advanced version, we could handle persistent random assignment here
        return NextResponse.json(level);
    } catch (error: any) {
        console.error('Verify code error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
