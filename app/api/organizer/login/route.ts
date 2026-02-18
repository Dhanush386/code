import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { username, password } = await req.json();

        if (!username || !password) {
            return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
        }

        const organizer = await prisma.organizer.findUnique({
            where: { username }
        });

        if (!organizer || organizer.password !== password) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        return NextResponse.json({ id: organizer.id, username: organizer.username });
    } catch (error: any) {
        console.error('Organizer login error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
