import { useEffect, useRef, useState, useCallback } from 'react'
import {
  isFirebaseConfigured, onAuth, signInWithEmail, signUpWithEmail, resetPassword,
  signOutUser, authErrorMessage, type User,
} from '@/lib/firebase'
import {
  initialSync, startAutoSync, pushBundle, pullBundle,
  resolveUseRemote, resolveUseLocal, getLastSync, clearLastSync,
} from '@/lib/cloud-sync'
import { useSampleView, isAnySampleMode } from '@/stores/sample-view-store'

export type SyncStatus = 'signed-out' | 'syncing' | 'synced' | 'error'

export interface CloudSync {
  configured: boolean
  ready: boolean
  user: User | null
  status: SyncStatus
  lastSync: number
  conflict: boolean
  busy: boolean
  error: string | null
  signInEmail: (email: string, password: string) => Promise<boolean>
  signUpEmail: (email: string, password: string) => Promise<boolean>
  resetPw: (email: string) => Promise<boolean>
  signOutNow: () => Promise<void>
  pushNow: () => Promise<void>
  pullNow: () => Promise<void>
  resolveRemote: () => Promise<void>
  resolveLocal: () => Promise<void>
}

export function useCloudSync(): CloudSync {
  const configured = isFirebaseConfigured
  const [ready, setReady] = useState(!configured)
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<SyncStatus>('signed-out')
  const [lastSync, setLastSyncState] = useState<number>(getLastSync())
  const [conflict, setConflict] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const stopAutoRef = useRef<(() => void) | null>(null)

  const refreshLast = () => setLastSyncState(getLastSync())

  const beginAuto = useCallback((uid: string) => {
    stopAutoRef.current?.()
    stopAutoRef.current = startAutoSync(uid, (s) => { setStatus(s); if (s === 'synced') refreshLast() })
  }, [])

  useEffect(() => {
    if (!configured) return
    const unsub = onAuth(async (u) => {
      setReady(true)
      setUser(u)
      stopAutoRef.current?.()
      stopAutoRef.current = null
      if (!u) { setStatus('signed-out'); return }
      // サインイン時はサンプル表示を解除し、実データで同期する
      useSampleView.getState().exitAll()
      setStatus('syncing')
      try {
        const r = await initialSync(u.uid)
        refreshLast()
        if (r === 'conflict') { setConflict(true); setStatus('synced') }
        else { setConflict(false); setStatus('synced'); beginAuto(u.uid) }
      } catch (e) {
        setStatus('error'); setError(e instanceof Error ? e.message : '同期に失敗しました')
      }
    })
    return () => { unsub(); stopAutoRef.current?.(); stopAutoRef.current = null }
  }, [configured, beginAuto])

  const signInEmail = useCallback(async (email: string, password: string) => {
    setBusy(true); setError(null)
    try { await signInWithEmail(email, password); return true }
    catch (e) { setError(authErrorMessage(e)); return false } finally { setBusy(false) }
  }, [])

  const signUpEmail = useCallback(async (email: string, password: string) => {
    setBusy(true); setError(null)
    try { await signUpWithEmail(email, password); return true }
    catch (e) { setError(authErrorMessage(e)); return false } finally { setBusy(false) }
  }, [])

  const resetPw = useCallback(async (email: string) => {
    setBusy(true); setError(null)
    try { await resetPassword(email); return true }
    catch (e) { setError(authErrorMessage(e)); return false } finally { setBusy(false) }
  }, [])

  const signOutNow = useCallback(async () => {
    setBusy(true)
    try { stopAutoRef.current?.(); stopAutoRef.current = null; clearLastSync(); await signOutUser(); setStatus('signed-out'); refreshLast() }
    catch (e) { setError(e instanceof Error ? e.message : 'ログアウトに失敗しました') } finally { setBusy(false) }
  }, [])

  const pushNow = useCallback(async () => {
    if (!user) return
    if (isAnySampleMode()) { setError('サンプル表示中は同期できません。各タブで「Myデータ」に戻してください'); return }
    setBusy(true); setStatus('syncing'); setError(null)
    try { await pushBundle(user.uid); refreshLast(); setStatus('synced') }
    catch (e) { setStatus('error'); setError(e instanceof Error ? e.message : 'アップロードに失敗しました') } finally { setBusy(false) }
  }, [user])

  const pullNow = useCallback(async () => {
    if (!user) return
    if (isAnySampleMode()) { setError('サンプル表示中は同期できません。各タブで「Myデータ」に戻してください'); return }
    setBusy(true); setStatus('syncing'); setError(null)
    try { await pullBundle(user.uid); refreshLast(); setStatus('synced') }
    catch (e) { setStatus('error'); setError(e instanceof Error ? e.message : '取得に失敗しました') } finally { setBusy(false) }
  }, [user])

  const resolveRemote = useCallback(async () => {
    if (!user) return
    setBusy(true)
    try { await resolveUseRemote(user.uid); refreshLast(); setConflict(false); setStatus('synced'); beginAuto(user.uid) }
    catch (e) { setError(e instanceof Error ? e.message : '取得に失敗しました') } finally { setBusy(false) }
  }, [user, beginAuto])

  const resolveLocal = useCallback(async () => {
    if (!user) return
    setBusy(true)
    try { await resolveUseLocal(user.uid); refreshLast(); setConflict(false); setStatus('synced'); beginAuto(user.uid) }
    catch (e) { setError(e instanceof Error ? e.message : 'アップロードに失敗しました') } finally { setBusy(false) }
  }, [user, beginAuto])

  return {
    configured, ready, user, status, lastSync, conflict, busy, error,
    signInEmail, signUpEmail, resetPw, signOutNow, pushNow, pullNow, resolveRemote, resolveLocal,
  }
}
