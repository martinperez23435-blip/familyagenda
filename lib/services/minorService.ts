import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Minor } from '@/lib/types/minor.types';

export async function createMinor(data: Omit<Minor, 'id' | 'createdAt'>) {
  const ref = await addDoc(collection(db, 'minors'), {
    ...data,
    createdAt: Timestamp.now(),
  });
  return ref.id;
}

export async function updateMinor(id: string, data: Partial<Minor>) {
  await updateDoc(doc(db, 'minors', id), data);
}

export async function deleteMinor(id: string) {
  await deleteDoc(doc(db, 'minors', id));
}

export async function getMinors(): Promise<Minor[]> {
  const q = query(
    collection(db, 'minors'),
    where('isActive', '==', true)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Minor));
}
