import { NextResponse } from 'next/server';
import { userStore } from '@/lib/store';

const SEED_USERS = [
  {
    uid: 'admin-001',
    name: 'Sarah Johnson',
    email: 'admin@resolvehq.com',
    role: 'admin' as const,
    unit: '',
    phone: '',
    specialization: '',
    createdAt: new Date().toISOString(),
    createdBy: 'system',
  },
  {
    uid: 'tenant-001',
    name: 'James Rodriguez',
    email: 'tenant@resolvehq.com',
    role: 'tenant' as const,
    unit: 'A-301',
    phone: '',
    specialization: '',
    createdAt: new Date().toISOString(),
    createdBy: 'system',
  },
  {
    uid: 'staff-001',
    name: 'Mike Chen',
    email: 'electrician@resolvehq.com',
    role: 'staff' as const,
    unit: '',
    phone: '',
    specialization: 'Electrician',
    createdAt: new Date().toISOString(),
    createdBy: 'system',
  },
];

export async function POST() {
  try {
    const results = [];
    for (const user of SEED_USERS) {
      await userStore.create(user);
      results.push({ email: user.email, role: user.role, name: user.name });
    }
    return NextResponse.json({ success: true, users: results });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Seed failed' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    accounts: [
      { role: 'Admin', email: 'admin@resolvehq.com', password: 'Admin@123', name: 'Sarah Johnson' },
      { role: 'Tenant', email: 'tenant@resolvehq.com', password: 'Tenant@123', name: 'James Rodriguez', unit: 'A-301' },
      { role: 'Staff (Electrician)', email: 'electrician@resolvehq.com', password: 'Staff@123', name: 'Mike Chen', specialization: 'Electrician' },
    ],
    instructions: 'Sign up with these emails and passwords via /auth?mode=signup, selecting the correct role. The system will store user profiles in Firestore.',
  });
}
