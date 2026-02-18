import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, organizerId, levels } = body;

        // Create the exam first
        const exam = await prisma.exam.create({
            data: {
                name,
                organizerId,
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
                        questions: true
                    }
                }
            }
        });

        return NextResponse.json(exam);
    } catch (error: any) {
        console.error('Exam creation error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET() {
    try {
        const exams = await prisma.exam.findMany({
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
        return NextResponse.json(exams);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
