import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const exam = await prisma.exam.findUnique({
            where: { id },
            include: {
                levels: {
                    include: {
                        questions: {
                            include: {
                                question: true
                            }
                        }
                    }
                }
            }
        });

        if (!exam) {
            return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
        }

        return NextResponse.json(exam);
    } catch (error: any) {
        console.error(`API Error (/api/exams/[id]):`, error);
        return NextResponse.json({
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.exam.delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Exam deletion error:', error);
        return NextResponse.json({
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { name, levels } = body;

        if (!name || !levels || !Array.isArray(levels)) {
            return NextResponse.json({ error: 'Invalid update data. Name and levels array are required.' }, { status: 400 });
        }

        console.log(`[EXAM_UPDATE] Updating exam ${id}: ${name}`);

        const updatedExam = await prisma.$transaction(async (tx) => {
            // 1. Delete existing levels (cascades to QuestionOnExam)
            // We use deleteMany to clear any existing levels for this exam
            await tx.examLevel.deleteMany({
                where: { examId: id }
            });

            // 2. Update exam name and recreate levels
            return await tx.exam.update({
                where: { id },
                data: {
                    name,
                    levels: {
                        create: levels.map((level: any) => ({
                            levelNumber: level.levelNumber,
                            accessCode: level.accessCode,
                            timeLimit: level.timeLimit,
                            questions: {
                                create: (level.questionIds || []).map((qid: string) => ({
                                    question: { connect: { id: qid } }
                                }))
                            }
                        }))
                    }
                },
                include: {
                    levels: {
                        include: {
                            questions: {
                                include: {
                                    question: true
                                }
                            }
                        }
                    }
                }
            });
        }, {
            timeout: 10000 // Increase timeout for complex transactions
        });

        return NextResponse.json(updatedExam);
    } catch (error: any) {
        console.error('CRITICAL: Exam update failure:', error);

        // Return a more descriptive error if it's a Prisma unique constraint violation
        if (error.code === 'P2002') {
            return NextResponse.json({
                error: 'Update Conflict: One or more access codes are already in use. Please regenerate codes and retry.',
                details: error.meta
            }, { status: 409 });
        }

        return NextResponse.json({
            error: error.message || 'Internal Server Error during update',
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
