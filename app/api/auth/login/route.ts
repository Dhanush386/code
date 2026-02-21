import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const { username, password } = await req.json();

        if (!username || !password) {
            return NextResponse.json({ error: 'Username/Team Name and password are required' }, { status: 400 });
        }

        // 1. Try to match an Organizer
        const organizer = await prisma.organizer.findUnique({
            where: { username }
        });

        if (organizer && organizer.password === password) {
            return NextResponse.json({
                role: 'organizer',
                user: { id: organizer.id, username: organizer.username }
            });
        }

        // 2. Try to match a Participant (Team Name)
        const participant = await prisma.participant.findUnique({
            where: { teamName: username }
        });

        if (participant) {
            if (participant.password === password) {
                // Update last active on login
                await prisma.participant.update({
                    where: { id: participant.id },
                    data: { lastActive: new Date() }
                });

                return NextResponse.json({
                    role: 'participant',
                    user: participant
                });
            } else {
                return NextResponse.json({ error: 'Invalid password for this team' }, { status: 401 });
            }
        }

        // 3. No match found
        return NextResponse.json({ error: 'Invalid credentials. User not found.' }, { status: 401 });

    } catch (error: any) {
        console.error('Unified login error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
