import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const { teamName } = await req.json();

        if (!teamName) {
            return NextResponse.json({ error: 'Team name is required' }, { status: 400 });
        }

        const participant = await prisma.participant.findUnique({
            where: { teamName }
        });

        if (!participant) {
            return NextResponse.json({ error: 'Team not found. Please register first.' }, { status: 404 });
        }

        // Check attempt limit
        if (participant.loginAttempts >= 2) {
            return NextResponse.json({
                error: 'Maximum login attempts (2) reached. Please contact proctors if this is an error.'
            }, { status: 403 });
        }

        // Update last active and increment attempts on login
        const updatedParticipant = await prisma.participant.update({
            where: { id: participant.id },
            data: {
                lastActive: new Date(),
                loginAttempts: { increment: 1 }
            }
        });

        return NextResponse.json(updatedParticipant);
    } catch (error: any) {
        console.error('Login error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
