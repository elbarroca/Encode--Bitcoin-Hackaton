import { NextResponse } from 'next/server';
import { exec } from 'child_process';

export async function POST(req: Request) {
    try {
        const { threshold, publicKeys } = await req.json();

        NextResponse.json({ message: 'success' }, { status: 200 })
    } catch (error) {
        console.error('Error parsing request:', error);
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}