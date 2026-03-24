import { collection, doc, setDoc, deleteDoc, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Feriado, FERIADOS_NACIONALES_2026 } from '@/lib/data/feriados2026';

const COL = 'feriados';

export async function initFeriados(): Promise<void> {
  const snap = await getDocs(collection(db, COL));
  if (snap.size > 0) return;
  await Promise.all(
    FERIADOS_NACIONALES_2026.map((f) =>
      setDoc(doc(db, COL, f.date), { ...f, createdAt: Timestamp.now() })
    )
  );
}

export async function getFeriados(): Promise<Feriado[]> {
  const snap = await getDocs(collection(db, COL));
  return snap.docs.map((d) => d.data() as Feriado);
}

export async function addFeriado(feriado: Feriado): Promise<void> {
  await setDoc(doc(db, COL, feriado.date), { ...feriado, createdAt: Timestamp.now() });
}

export async function deleteFeriado(date: string): Promise<void> {
  await deleteDoc(doc(db, COL, date));
}
