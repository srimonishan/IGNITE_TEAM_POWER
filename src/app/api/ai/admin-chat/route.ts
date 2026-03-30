import { NextRequest, NextResponse } from 'next/server';
import { adminChat } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, context } = body;
    if (!message) return NextResponse.json({ error: 'message required' }, { status: 400 });
    const reply = await adminChat(message, context);
    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Admin chat error:', error);
    return NextResponse.json({ error: 'Chat failed' }, { status: 500 });
  }
}
