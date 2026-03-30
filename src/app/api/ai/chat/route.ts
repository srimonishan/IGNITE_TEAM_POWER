import { NextRequest, NextResponse } from 'next/server';
import { chatToRequest, analyzeRequest } from '@/lib/ai';
import { Domain, ServiceRequest } from '@/lib/types';
import { store } from '@/lib/store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, domain, autoCreate } = body;

    if (!message || !domain) {
      return NextResponse.json(
        { error: 'message and domain are required' },
        { status: 400 }
      );
    }

    const extracted = await chatToRequest(message, domain as Domain);
    const aiAnalysis = await analyzeRequest(
      extracted.description,
      extracted.title,
      extracted.location,
      domain as Domain
    );

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
        domain: domain as Domain,
        timestamp: new Date().toISOString(),
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
      alert:
        aiAnalysis.predictedPriority === 'CRITICAL'
          ? { type: 'CRITICAL', message: `CRITICAL: ${extracted.title}` }
          : null,
    });
  } catch (error) {
    console.error('Chat processing error:', error);
    return NextResponse.json({ error: 'Chat processing failed' }, { status: 500 });
  }
}
