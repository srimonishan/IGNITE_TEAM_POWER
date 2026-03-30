import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { ServiceRequest, Status, Priority, DashboardStats } from './types';

const COL = 'requests';

const memoryStore: ServiceRequest[] = [];
let useMemory = false;

async function allDocs(domain?: string): Promise<ServiceRequest[]> {
  try {
    const snap = await getDocs(collection(db, COL));
    let results = snap.docs.map((d) => ({ ...d.data(), id: d.id }) as ServiceRequest);
    if (domain) results = results.filter((r) => r.domain === domain);
    return results.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (err) {
    console.warn('Firestore unavailable, using in-memory fallback:', err);
    useMemory = true;
    let results = [...memoryStore];
    if (domain) results = results.filter((r) => r.domain === domain);
    return results.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
}

export const store = {
  async getAll(filters?: {
    status?: Status;
    category?: string;
    priority?: Priority;
    domain?: string;
  }): Promise<ServiceRequest[]> {
    let results = await allDocs(filters?.domain);
    if (filters?.status) results = results.filter((r) => r.status === filters.status);
    if (filters?.category) results = results.filter((r) => r.category === filters.category);
    if (filters?.priority) results = results.filter((r) => r.priority === filters.priority);
    return results;
  },

  async getById(id: string): Promise<ServiceRequest | undefined> {
    try {
      const snap = await getDoc(doc(db, COL, id));
      if (snap.exists()) return { ...snap.data(), id: snap.id } as ServiceRequest;
    } catch {
      return memoryStore.find((r) => r.id === id);
    }
    return undefined;
  },

  async create(request: ServiceRequest): Promise<ServiceRequest> {
    memoryStore.push(request);
    try {
      await setDoc(doc(db, COL, request.id), request);
    } catch (err) {
      console.warn('Firestore write failed, data saved in-memory:', err);
      useMemory = true;
    }
    return request;
  },

  async updateStatus(id: string, status: Status): Promise<ServiceRequest | undefined> {
    const now = new Date().toISOString();
    const mem = memoryStore.find((r) => r.id === id);
    if (mem) {
      mem.status = status;
      mem.updatedAt = now;
    }
    try {
      await updateDoc(doc(db, COL, id), { status, updatedAt: now });
      const snap = await getDoc(doc(db, COL, id));
      if (snap.exists()) return { ...snap.data(), id: snap.id } as ServiceRequest;
    } catch {
      return mem;
    }
    return mem;
  },

  async assign(id: string, assignedTo: string): Promise<ServiceRequest | undefined> {
    const now = new Date().toISOString();
    const mem = memoryStore.find((r) => r.id === id);
    if (mem) {
      mem.assignedTo = assignedTo;
      mem.status = 'ASSIGNED';
      mem.updatedAt = now;
    }
    try {
      await updateDoc(doc(db, COL, id), {
        assignedTo,
        status: 'ASSIGNED',
        updatedAt: now,
      });
      const snap = await getDoc(doc(db, COL, id));
      if (snap.exists()) return { ...snap.data(), id: snap.id } as ServiceRequest;
    } catch {
      return mem;
    }
    return mem;
  },

  async getDashboardStats(domain?: string): Promise<DashboardStats> {
    const requests = await allDocs(domain);
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
      criticalCount: requests.filter(
        (r) => r.priority === 'CRITICAL' && r.status !== 'COMPLETED'
      ).length,
      recentAlerts: requests.filter((r) => r.priority === 'CRITICAL').slice(0, 5),
    };
  },
};
