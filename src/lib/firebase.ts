import { initializeApp, type FirebaseApp } from 'firebase/app'
import {
  getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword,
  sendPasswordResetEmail, signOut, onAuthStateChanged, type Auth, type User,
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

export function signInWithEmail(email: string, password: string): Promise<User> {
  const { auth } = ensure()
  return signInWithEmailAndPassword(auth, email.trim(), password).then((r) => r.user)
}

export function signUpWithEmail(email: string, password: string): Promise<User> {
  const { auth } = ensure()
  return createUserWithEmailAndPassword(auth, email.trim(), password).then((r) => r.user)
}

export function resetPassword(email: string): Promise<void> {
  const { auth } = ensure()
  return sendPasswordResetEmail(auth, email.trim())
}

/** Firebase Auth のエラーコードを日本語メッセージに変換 */
export function authErrorMessage(e: unknown): string {
  const code = e && typeof e === 'object' && 'code' in e ? String((e as { code: unknown }).code) : ''
  switch (code) {
    case 'auth/invalid-email': return 'メールアドレスの形式が正しくありません'
    case 'auth/missing-password': return 'パスワードを入力してください'
    case 'auth/weak-password': return 'パスワードは6文字以上にしてください'
    case 'auth/email-already-in-use': return 'このメールは既に登録済みです。ログインしてください'
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found': return 'メールアドレスまたはパスワードが違います'
    case 'auth/too-many-requests': return '試行回数が多すぎます。しばらくしてからお試しください'
    case 'auth/network-request-failed': return 'ネットワークエラーです。接続を確認してください'
    case 'auth/operation-not-allowed':
    case 'auth/configuration-not-found': return 'メール/パスワード認証が未有効です。Firebaseコンソール → Authentication → Sign-in method で「メール/パスワード」を有効化してください'
    default: return e instanceof Error ? e.message : '認証に失敗しました'
  }
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
