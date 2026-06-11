import { initializeApp, type FirebaseApp } from 'firebase/app'
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signOut,
  onAuthStateChanged, type Auth, type User,
} from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

/** 必須キーが揃っているか（未設定ならクラウド同期UIは非表示） */
export const isFirebaseConfigured = Boolean(cfg.apiKey && cfg.authDomain && cfg.projectId && cfg.appId)

let app: FirebaseApp | null = null
let authInstance: Auth | null = null
let dbInstance: Firestore | null = null

function ensure() {
  if (!isFirebaseConfigured) throw new Error('Firebase is not configured')
  if (!app) {
    app = initializeApp(cfg as Required<typeof cfg>)
    authInstance = getAuth(app)
    dbInstance = getFirestore(app)
  }
  return { auth: authInstance as Auth, db: dbInstance as Firestore }
}

export function getDb(): Firestore {
  return ensure().db
}

export function signInWithGoogle(): Promise<User> {
  const { auth } = ensure()
  const provider = new GoogleAuthProvider()
  return signInWithPopup(auth, provider).then((r) => r.user)
}

export function signOutUser(): Promise<void> {
  const { auth } = ensure()
  return signOut(auth)
}

/** 認証状態の購読。未設定なら即 null を返して何もしない */
export function onAuth(cb: (user: User | null) => void): () => void {
  if (!isFirebaseConfigured) { cb(null); return () => {} }
  const { auth } = ensure()
  return onAuthStateChanged(auth, cb)
}

export type { User }
