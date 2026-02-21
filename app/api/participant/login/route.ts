import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const { teamName, password } = await req.json();

        if (!teamName || !password) {
            return NextResponse.json({ error: 'Team name and password are required' }, { status: 400 });
        }

        const participant = await prisma.participant.findUnique({
            where: { teamName }
        });

        if (!participant) {
            return NextResponse.json({ error: 'Team not found. Please register first.' }, { status: 404 });
        }

        if (participant.password !== password) {
            return NextResponse.json({ error: 'Invalid team password' }, { status: 401 });
        }

        // Update last active on login
        const updatedParticipant = await prisma.participant.update({
            where: { id: participant.id },
            data: { lastActive: new Date() }
        });

        return NextResponse.json(updatedParticipant);
    } catch (error: any) {
        console.error('Login error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
