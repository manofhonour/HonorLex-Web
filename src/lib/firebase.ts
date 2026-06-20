import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, GithubAuthProvider, signInWithPopup, signInWithRedirect, signOut } from 'firebase/auth';

// Triple-fallback: Environment Variables -> Hardcoded active profile -> Default sandbox profile
const env = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || 'AIzaSyASxitoEhe26D2TZikejbxVybPYW_poyaE',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'radiant-vortex-s4jp1.firebaseapp.com',
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'radiant-vortex-s4jp1',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || 'radiant-vortex-s4jp1.firebasestorage.app',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '813448772137',
  appId: env.VITE_FIREBASE_APP_ID || '1:813448772137:web:c23750bccdf25bcd173a38',
};

const databaseId = env.VITE_FIREBASE_FIRESTORE_DB_ID || 'ai-studio-ca4a9911-e478-4e04-988c-0b08e640a025';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with the custom databaseId required by the platform
export const db = initializeFirestore(app, {
  databaseId: databaseId,
} as any);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

export { signInWithPopup, signInWithRedirect, signOut };
