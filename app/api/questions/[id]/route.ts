import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const question = await prisma.question.findUnique({
            where: { id },
            include: { testCases: true }
        });

        if (!question) {
            return NextResponse.json({ error: 'Question not found' }, { status: 404 });
        }

        return NextResponse.json(question);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
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

        // Use a transaction to ensure atomic update of question and test cases
        const result = await prisma.$transaction(async (tx: any) => {
            // 1. Delete existing test cases
            await tx.testCase.deleteMany({
                where: { questionId: id }
            });

            // 2. Update question and create new test cases
            return await tx.question.update({
                where: { id },
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
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Question update error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.question.delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('API Error (/api/questions/[id] DELETE):', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
