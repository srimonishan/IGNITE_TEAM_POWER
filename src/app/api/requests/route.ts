import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { analyzeRequest } from '@/lib/ai';
import { ServiceRequest } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, location, tenantUid, tenantName, tenantUnit } = body;

    if (!title || !description) {
      return NextResponse.json({ error: 'title and description required' }, { status: 400 });
    }

    const aiAnalysis = await analyzeRequest(description, title, location || '');

    const newRequest: ServiceRequest = {
      id: crypto.randomUUID(),
      title,
      description,
      category: aiAnalysis.predictedCategory,
      priority: aiAnalysis.predictedPriority,
      location: location || 'Not specified',
      status: 'NEW',
      domain: 'apartment',
      timestamp: new Date().toISOString(),
      tenantUid: tenantUid || '',
      tenantName: tenantName || '',
      tenantUnit: tenantUnit || '',
      aiAnalysis,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await store.create(newRequest);

    return NextResponse.json({
      request: newRequest,
      alert: aiAnalysis.predictedPriority === 'CRITICAL'
        ? { type: 'CRITICAL', message: `CRITICAL: ${title}` }
        : null,
    }, { status: 201 });
  } catch (error) {
    console.error('Create request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || undefined;
  const category = searchParams.get('category') || undefined;
  const priority = searchParams.get('priority') || undefined;
  const tenantUid = searchParams.get('tenantUid') || undefined;
  const assignedToUid = searchParams.get('assignedToUid') || undefined;

  let requests = await store.getAll({
    status: status as any,
    category,
    priority: priority as any,
    domain: 'apartment',
    tenantUid,
  });

  if (assignedToUid) {
    requests = requests.filter((r) => r.assignedToUid === assignedToUid);
  }

  return NextResponse.json({ requests });
}
