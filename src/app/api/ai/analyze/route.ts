import { NextRequest, NextResponse } from 'next/server';
import { analyzeRequest } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, location } = body;

    if (!description) {
      return NextResponse.json({ error: 'description required' }, { status: 400 });
    }

    const analysis = await analyzeRequest(description, title || '', location || '');
    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('AI analysis error:', error);
    return NextResponse.json({ error: 'AI analysis failed' }, { status: 500 });
  }
}
