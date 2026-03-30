import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET(request: NextRequest) {
  const stats = await store.getDashboardStats('apartment');
  return NextResponse.json({ stats });
}
