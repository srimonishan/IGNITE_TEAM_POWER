import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { analyzeRequest } from '@/lib/ai';
import { ServiceRequest, Domain } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, location, domain } = body;

    if (!title || !description || !domain) {
      return NextResponse.json(
        { error: 'title, description, and domain are required' },
        { status: 400 }
      );
    }

    const aiAnalysis = await analyzeRequest(
      description,
      title,
      location || '',
      domain as Domain
    );

    const newRequest: ServiceRequest = {
      id: crypto.randomUUID(),
      title,
      description,
      category: aiAnalysis.predictedCategory,
      priority: aiAnalysis.predictedPriority,
      location: location || 'Not specified',
      status: 'NEW',
      domain: domain as Domain,
      timestamp: new Date().toISOString(),
      aiAnalysis,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await store.create(newRequest);

    const isCritical = aiAnalysis.predictedPriority === 'CRITICAL';

    return NextResponse.json(
      {
        request: newRequest,
        alert: isCritical
          ? { type: 'CRITICAL', message: `CRITICAL request created: ${title}` }
          : null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || undefined;
  const category = searchParams.get('category') || undefined;
  const priority = searchParams.get('priority') || undefined;
  const domain = searchParams.get('domain') || undefined;

  const requests = await store.getAll({
    status: status as any,
    category,
    priority: priority as any,
    domain,
  });

  return NextResponse.json({ requests });
}
