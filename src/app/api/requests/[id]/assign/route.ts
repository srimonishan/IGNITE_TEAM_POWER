import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { assignedTo } = body;

    if (!assignedTo) {
      return NextResponse.json({ error: 'assignedTo is required' }, { status: 400 });
    }

    const updated = await store.assign(params.id, assignedTo);
    if (!updated) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json({ request: updated });
  } catch (error) {
    console.error('Error assigning request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
