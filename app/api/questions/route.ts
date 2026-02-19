import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            title,
            description,
            inputFormat,
            outputFormat,
            constraints,
            sampleInput,
            sampleOutput,
            difficulty,
            languages,
            testCases // [{ input, expectedOutput, isHidden }]
        } = body;

        const question = await prisma.question.create({
            data: {
                title,
                description,
                inputFormat,
                outputFormat,
                constraints,
                sampleInput,
                sampleOutput,
                difficulty,
                languages,
                testCases: {
                    create: testCases || []
                }
            },
            include: {
                testCases: true
            }
        });

        return NextResponse.json(question);
    } catch (error: any) {
        console.error('Question creation error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const questions = await prisma.question.findMany({
            orderBy: { id: 'desc' },
            include: {
                testCases: true
            }
        });
        return NextResponse.json(questions);
    } catch (error: any) {
        console.error('API Error (/api/questions):', error);
        return NextResponse.json({
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
