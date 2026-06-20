import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  updateDoc, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

export interface SavedOutput {
  id: string;
  timestamp: string;
  type: 'polisher' | 'auditor' | 'scanner' | 'copilot';
  label: string;
  data: any;
  title: string;
  notes?: string;
  createdAt?: any;
}

/**
 * Saves a scientific output to Firestore for a specific authenticated user.
 */
export async function saveOutput(
  userId: string, 
  payload: {
    type: 'polisher' | 'auditor' | 'scanner' | 'copilot';
    label: string;
    data: any;
    title: string;
    notes?: string;
  }
) {
  try {
    const colRef = collection(db, 'users', userId, 'saved_outputs');
    const now = new Date();
    const timeStr = now.toLocaleDateString('tr-TR') + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const docData = {
      timestamp: timeStr,
      type: payload.type,
      label: payload.label,
      data: payload.data,
      title: payload.title,
      notes: payload.notes || '',
      createdAt: serverTimestamp()
    };
    
    const docRef = await addDoc(colRef, docData);
    return { id: docRef.id, ...docData };
  } catch (err) {
    console.error('Firestore save failed:', err);
    throw err;
  }
}

/**
 * Retrieves all saved outputs of an authenticated user, ordered by creation time.
 */
export async function fetchSavedOutputs(userId: string): Promise<SavedOutput[]> {
  try {
    const colRef = collection(db, 'users', userId, 'saved_outputs');
    const q = query(colRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    const items: SavedOutput[] = [];
    snapshot.forEach((d) => {
      const data = d.data();
      items.push({
        id: d.id,
        timestamp: data.timestamp || '',
        type: data.type,
        label: data.label,
        data: data.data,
        title: data.title || 'Adsız Kayıt',
        notes: data.notes || '',
        createdAt: data.createdAt
      });
    });
    return items;
  } catch (err) {
    console.error('Firestore fetch failed, running secondary logic to fallback:', err);
    // Dynamic query fallback if index is not ready yet
    const colRef = collection(db, 'users', userId, 'saved_outputs');
    const snapshot = await getDocs(colRef);
    const items: SavedOutput[] = [];
    snapshot.forEach((d) => {
      const data = d.data();
      items.push({
        id: d.id,
        timestamp: data.timestamp || '',
        type: data.type,
        label: data.label,
        data: data.data,
        title: data.title || 'Adsız Kayıt',
        notes: data.notes || '',
        createdAt: data.createdAt
      });
    });
    // client-side sort
    return items.sort((a, b) => b.id.localeCompare(a.id));
  }
}

/**
 * Deletes an output from Firestore.
 */
export async function deleteSavedOutput(userId: string, outputId: string) {
  try {
    const docRef = doc(db, 'users', userId, 'saved_outputs', outputId);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('Firestore delete failed:', err);
    throw err;
  }
}

/**
 * Edits details of an output in Firestore.
 */
export async function updateSavedOutput(
  userId: string, 
  outputId: string, 
  updates: { title: string; notes?: string }
) {
  try {
    const docRef = doc(db, 'users', userId, 'saved_outputs', outputId);
    await updateDoc(docRef, {
      title: updates.title,
      notes: updates.notes || ''
    });
  } catch (err) {
    console.error('Firestore update failed:', err);
    throw err;
  }
}
