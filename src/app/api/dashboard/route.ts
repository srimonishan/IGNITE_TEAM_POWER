import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain') || undefined;

  const stats = await store.getDashboardStats(domain);
  return NextResponse.json({ stats });
}
