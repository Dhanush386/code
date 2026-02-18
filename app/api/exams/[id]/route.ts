import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
    req: Request,
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
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
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
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { name, levels } = body;

        const updatedExam = await prisma.$transaction(async (tx: any) => {
            // 1. Delete existing levels (cascades to QuestionOnExam)
            await tx.examLevel.deleteMany({
                where: { examId: id }
            });

            // 2. Update exam and recreate levels
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
                                create: level.questionIds.map((qid: string) => ({
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
        });

        return NextResponse.json(updatedExam);
    } catch (error: any) {
        console.error('Exam update error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
