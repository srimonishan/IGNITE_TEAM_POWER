import { NextRequest, NextResponse } from 'next/server';
import { chatToRequest, analyzeRequest } from '@/lib/ai';
import { ServiceRequest } from '@/lib/types';
import { store } from '@/lib/store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, autoCreate, tenantUid, tenantName, tenantUnit } = body;

    if (!message) {
      return NextResponse.json({ error: 'message required' }, { status: 400 });
    }

    const extracted = await chatToRequest(message);
    const aiAnalysis = await analyzeRequest(extracted.description, extracted.title, extracted.location);

    let savedRequest: ServiceRequest | null = null;

    if (autoCreate !== false) {
      savedRequest = {
        id: crypto.randomUUID(),
        title: extracted.title,
        description: extracted.description,
        category: aiAnalysis.predictedCategory,
        priority: aiAnalysis.predictedPriority,
        location: extracted.location,
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
      await store.create(savedRequest);
    }

    return NextResponse.json({
      request: savedRequest,
      extracted,
      analysis: aiAnalysis,
      alert: aiAnalysis.predictedPriority === 'CRITICAL'
        ? { type: 'CRITICAL', message: `CRITICAL: ${extracted.title}` }
        : null,
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Chat processing failed' }, { status: 500 });
  }
}
