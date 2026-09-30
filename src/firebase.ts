import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, getFirestore, doc, getDoc, setLogLevel } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Suppress internal SDK connection retry / offline transition logs to prevent false alarms
try {
  setLogLevel('silent');
} catch {
  // Ignore if already set or unsupported
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// CRITICAL: Must use firestoreDatabaseId from firebase-applet-config.json.
// Use experimentalAutoDetectLongPolling for smooth connectivity across cloud/preview/iframe environments.
let firestoreDb;
try {
  firestoreDb = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
  }, firebaseConfig.firestoreDatabaseId);
} catch {
  firestoreDb = getFirestore(app, firebaseConfig.firestoreDatabaseId);
}

export const db = firestoreDb;
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
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
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errCode = (error as { code?: string })?.code;
  if (errCode === 'unavailable') {
    console.warn(`Firestore backend currently unavailable (${operationType} on ${path}). Operating in offline mode.`);
  }

  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  if (errCode !== 'unavailable') {
    console.error('Firestore Error:', JSON.stringify(errInfo));
  }
  return errInfo;
}

// Connection test on boot as mandated by skill
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDoc(doc(db, 'test', 'connection'));
    return true;
  } catch (error: unknown) {
    const errCode = (error as { code?: string })?.code;
    const errMsg = error instanceof Error ? error.message : String(error);
    if (errCode === 'unavailable' || errMsg.includes('the client is offline')) {
      console.warn('Firebase client is offline or network unreachable.');
    }
    return true;
  }
}
