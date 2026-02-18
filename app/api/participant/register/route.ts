import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const { teamName, collegeName, members } = await req.json();

        if (!teamName || !collegeName || !members) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        const existingTeam = await prisma.participant.findUnique({
            where: { teamName }
        });

        if (existingTeam) {
            return NextResponse.json({ error: 'Team name already registered' }, { status: 400 });
        }

        const participant = await prisma.participant.create({
            data: {
                teamName,
                collegeName,
                members,
                lastActive: new Date()
            }
        });

        return NextResponse.json(participant);
    } catch (error: any) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
