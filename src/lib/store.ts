import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from './firebase';
import { ServiceRequest, Status, Priority, DashboardStats, AppUser, UserRole } from './types';

const REQ_COL = 'requests';
const USR_COL = 'users';

const memRequests: ServiceRequest[] = [];
const memUsers: AppUser[] = [];

async function allRequests(domain?: string): Promise<ServiceRequest[]> {
  try {
    const snap = await getDocs(collection(db, REQ_COL));
    let results = snap.docs.map((d) => ({ ...d.data(), id: d.id }) as ServiceRequest);
    if (domain) results = results.filter((r) => r.domain === domain);
    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    let results = [...memRequests];
    if (domain) results = results.filter((r) => r.domain === domain);
    return results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

export const store = {
  async getAll(filters?: { status?: Status; category?: string; priority?: Priority; domain?: string; tenantUid?: string }): Promise<ServiceRequest[]> {
    let results = await allRequests(filters?.domain);
    if (filters?.status) results = results.filter((r) => r.status === filters.status);
    if (filters?.category) results = results.filter((r) => r.category === filters.category);
    if (filters?.priority) results = results.filter((r) => r.priority === filters.priority);
    if (filters?.tenantUid) results = results.filter((r) => r.tenantUid === filters.tenantUid);
    return results;
  },

  async getById(id: string): Promise<ServiceRequest | undefined> {
    try {
      const snap = await getDoc(doc(db, REQ_COL, id));
      if (snap.exists()) return { ...snap.data(), id: snap.id } as ServiceRequest;
    } catch {
      return memRequests.find((r) => r.id === id);
    }
    return undefined;
  },

  async create(request: ServiceRequest): Promise<ServiceRequest> {
    memRequests.push(request);
    try { await setDoc(doc(db, REQ_COL, request.id), request); } catch {}
    return request;
  },

  async updateStatus(id: string, status: Status): Promise<ServiceRequest | undefined> {
    const now = new Date().toISOString();
    const mem = memRequests.find((r) => r.id === id);
    if (mem) { mem.status = status; mem.updatedAt = now; }
    try {
      await updateDoc(doc(db, REQ_COL, id), { status, updatedAt: now });
      const snap = await getDoc(doc(db, REQ_COL, id));
      if (snap.exists()) return { ...snap.data(), id: snap.id } as ServiceRequest;
    } catch { return mem; }
    return mem;
  },

  async assign(id: string, assignedTo: string): Promise<ServiceRequest | undefined> {
    const now = new Date().toISOString();
    const mem = memRequests.find((r) => r.id === id);
    if (mem) { mem.assignedTo = assignedTo; mem.status = 'ASSIGNED'; mem.updatedAt = now; }
    try {
      await updateDoc(doc(db, REQ_COL, id), { assignedTo, status: 'ASSIGNED', updatedAt: now });
      const snap = await getDoc(doc(db, REQ_COL, id));
      if (snap.exists()) return { ...snap.data(), id: snap.id } as ServiceRequest;
    } catch { return mem; }
    return mem;
  },

  async getDashboardStats(domain?: string): Promise<DashboardStats> {
    const requests = await allRequests(domain);
    return {
      total: requests.length,
      byStatus: {
        NEW: requests.filter((r) => r.status === 'NEW').length,
        ASSIGNED: requests.filter((r) => r.status === 'ASSIGNED').length,
        IN_PROGRESS: requests.filter((r) => r.status === 'IN_PROGRESS').length,
        COMPLETED: requests.filter((r) => r.status === 'COMPLETED').length,
      },
      byPriority: {
        CRITICAL: requests.filter((r) => r.priority === 'CRITICAL').length,
        HIGH: requests.filter((r) => r.priority === 'HIGH').length,
        MEDIUM: requests.filter((r) => r.priority === 'MEDIUM').length,
        LOW: requests.filter((r) => r.priority === 'LOW').length,
      },
      criticalCount: requests.filter((r) => r.priority === 'CRITICAL' && r.status !== 'COMPLETED').length,
      recentAlerts: requests.filter((r) => r.priority === 'CRITICAL').slice(0, 5),
    };
  },
};

export const userStore = {
  async create(user: AppUser): Promise<AppUser> {
    memUsers.push(user);
    try { await setDoc(doc(db, USR_COL, user.uid), user); } catch {}
    return user;
  },

  async get(uid: string): Promise<AppUser | undefined> {
    try {
      const snap = await getDoc(doc(db, USR_COL, uid));
      if (snap.exists()) return snap.data() as AppUser;
    } catch {
      return memUsers.find((u) => u.uid === uid);
    }
    return memUsers.find((u) => u.uid === uid);
  },

  async getByEmail(email: string): Promise<AppUser | undefined> {
    try {
      const q = query(collection(db, USR_COL), where('email', '==', email));
      const snap = await getDocs(q);
      if (!snap.empty) return snap.docs[0].data() as AppUser;
    } catch {
      return memUsers.find((u) => u.email === email);
    }
    return memUsers.find((u) => u.email === email);
  },

  async getAll(): Promise<AppUser[]> {
    try {
      const snap = await getDocs(collection(db, USR_COL));
      return snap.docs.map((d) => d.data() as AppUser);
    } catch {
      return [...memUsers];
    }
  },

  async updateRole(uid: string, role: UserRole): Promise<void> {
    const mem = memUsers.find((u) => u.uid === uid);
    if (mem) mem.role = role;
    try { await updateDoc(doc(db, USR_COL, uid), { role }); } catch {}
  },

  async remove(uid: string): Promise<void> {
    const idx = memUsers.findIndex((u) => u.uid === uid);
    if (idx >= 0) memUsers.splice(idx, 1);
    try { await deleteDoc(doc(db, USR_COL, uid)); } catch {}
  },
};
