import { NextRequest, NextResponse } from 'next/server';
import { analyzeRequest } from '@/lib/ai';
import { Domain } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, location, domain } = body;

    if (!description || !domain) {
      return NextResponse.json(
        { error: 'description and domain are required' },
        { status: 400 }
      );
    }

    const analysis = await analyzeRequest(
      description,
      title || '',
      location || '',
      domain as Domain
    );

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('AI analysis error:', error);
    return NextResponse.json({ error: 'AI analysis failed' }, { status: 500 });
  }
}
