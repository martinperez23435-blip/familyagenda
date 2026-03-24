import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { User } from '@/lib/types/user.types';

export async function getUsers(): Promise<User[]> {
  const q = query(collection(db, 'users'), where('isActive', '==', true));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as User));
}
