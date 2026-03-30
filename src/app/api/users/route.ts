import { NextRequest, NextResponse } from 'next/server';
import { userStore } from '@/lib/store';
import { AppUser, UserRole } from '@/lib/types';

export async function GET() {
  const users = await userStore.getAll();
  return NextResponse.json({ users });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, name, email, role, unit, phone, createdBy } = body;
    if (!uid || !name || !email || !role) {
      return NextResponse.json({ error: 'uid, name, email, role required' }, { status: 400 });
    }
    const user: AppUser = {
      uid,
      name,
      email,
      role: role as UserRole,
      unit: unit || '',
      phone: phone || '',
      createdAt: new Date().toISOString(),
      createdBy: createdBy || '',
    };
    await userStore.create(user);
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, role } = body;
    if (!uid || !role) return NextResponse.json({ error: 'uid and role required' }, { status: 400 });
    await userStore.updateRole(uid, role as UserRole);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');
    if (!uid) return NextResponse.json({ error: 'uid required' }, { status: 400 });
    await userStore.remove(uid);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
