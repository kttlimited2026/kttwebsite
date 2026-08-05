import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Service, Plan, Settings, Booking } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMessage = error instanceof Error ? error.message : String(error);
  const errInfo: FirestoreErrorInfo = {
    error: errMessage,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.warn('Firestore Operation Info: ', JSON.stringify(errInfo));
  // Return message rather than crashing app if offline
  return errMessage;
}

export const dbService = {
  // Services
  async getServices(): Promise<Service[]> {
    const path = 'services';
    try {
      const q = query(collection(db, path));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Service));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, path);
      return [];
    }
  },

  async updateService(service: Service) {
    const path = `services/${service.id}`;
    try {
      await setDoc(doc(db, 'services', service.id), service);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  },

  // Plans
  async getPlans(): Promise<Plan[]> {
    const path = 'plans';
    try {
      const q = query(collection(db, path));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Plan));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, path);
      return [];
    }
  },

  async updatePlan(plan: Plan) {
    const path = `plans/${plan.id}`;
    try {
      await setDoc(doc(db, 'plans', plan.id), plan);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  },

  async deletePlan(id: string) {
    const path = `plans/${id}`;
    try {
      await deleteDoc(doc(db, 'plans', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, path);
    }
  },

  // Settings
  async getSettings(): Promise<Settings | null> {
    const path = 'settings/global';
    try {
      const snap = await getDoc(doc(db, 'settings', 'global'));
      return snap.exists() ? snap.data() as Settings : null;
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, path);
      return null;
    }
  },

  async updateSettings(settings: Settings) {
    const path = 'settings/global';
    try {
      await setDoc(doc(db, 'settings', 'global'), settings);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  },

  // Bookings
  async getBookings(): Promise<Booking[]> {
    const path = 'bookings';
    try {
      const q = query(collection(db, path), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Booking));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, path);
      return [];
    }
  },

  async createBooking(booking: Omit<Booking, 'id' | 'createdAt'>) {
    const path = 'bookings';
    try {
      await addDoc(collection(db, path), {
        ...booking,
        status: 'new',
        createdAt: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, path);
    }
  },

  async updateBookingStatus(id: string, status: string) {
    const path = `bookings/${id}`;
    try {
      await updateDoc(doc(db, 'bookings', id), { status });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, path);
    }
  },

  async deleteBooking(id: string) {
    const path = `bookings/${id}`;
    try {
      await deleteDoc(doc(db, 'bookings', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, path);
    }
  },

  // Real-time listener for admins
  subscribeToBookings(callback: (bookings: Booking[]) => void) {
    const path = 'bookings';
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Booking)));
    }, (e) => {
      handleFirestoreError(e, OperationType.LIST, path);
    });
  }
};
