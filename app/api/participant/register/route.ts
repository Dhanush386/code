import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const { teamName, collegeName, members, regNos, password } = await req.json();

        if (!teamName || !collegeName || !members || !regNos || !password) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        const existingTeam = await prisma.participant.findUnique({
            where: { teamName }
        });

        if (existingTeam) {
            return NextResponse.json({ error: 'Team name already registered' }, { status: 400 });
        }

        // Check for duplicate registration numbers
        const allParticipants = await prisma.participant.findMany({
            select: { regNos: true, teamName: true }
        });

        const newRegs = regNos.split(',').map((r: string) => r.trim().toUpperCase()).filter(Boolean);

        for (const p of allParticipants) {
            const existingRegs = p.regNos.split(',').map(r => r.trim().toUpperCase());
            for (const reg of newRegs) {
                if (existingRegs.includes(reg)) {
                    return NextResponse.json({
                        error: `Registration Number [${reg}] is already registered under team "${p.teamName}".`
                    }, { status: 400 });
                }
            }
        }

        const participant = await prisma.participant.create({
            data: {
                teamName,
                collegeName,
                members,
                regNos,
                password,
                lastActive: new Date()
            }
        });

        return NextResponse.json(participant);
    } catch (error: any) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
