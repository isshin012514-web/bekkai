import { doc, getDoc, setDoc } from 'firebase/firestore'
import { getDb } from '@/lib/firebase'
import { exportAll, importAll } from '@/lib/data-bundle'
import { useGrowthStore } from '@/stores/growth-store'
import { useBekkaiStore } from '@/stores/bekkai-store'
import { useEntriesStore } from '@/discovery/stores/entries-store'

const LAST_SYNC_KEY = 'cloud-last-sync-ms'

// リモート取り込み中はローカル変更→自動pushのループを止める
let applyingRemote = false

function userDoc(uid: string) {
  return doc(getDb(), 'users', uid)
}

export function getLastSync(): number {
  try { return Number(localStorage.getItem(LAST_SYNC_KEY) || 0) } catch { return 0 }
}
function setLastSync(ms: number) {
  try { localStorage.setItem(LAST_SYNC_KEY, String(ms)) } catch { /* noop */ }
}
export function clearLastSync() {
  try { localStorage.removeItem(LAST_SYNC_KEY) } catch { /* noop */ }
}

/** この端末に何かしらデータが入っているか */
export function localHasData(): boolean {
  const b = exportAll('')
  const g = b.growth
  const growthHas =
    g.outputs.length > 0 || g.inputs.length > 0 || g.roleModels.length > 0 ||
    g.upcomingPeople.length > 0 ||
    (g.failurePower && Object.values(g.failurePower).some((v) => Array.isArray(v) && v.length > 0)) ||
    (g.realizationPower && (g.realizationPower.combinations.length > 0 || g.realizationPower.quantityQualities.length > 0 || g.realizationPower.team.length > 0 || !!g.realizationPower.confidence?.trim()))
  const discoveryHas = Object.values(b.discovery.entries ?? {}).some((v) => Array.isArray(v) && v.length > 0)
  const bekkaiHas = b.bekkai.bekkais.length > 0
  return Boolean(growthHas || discoveryHas || bekkaiHas)
}

/** ローカル全データをクラウドへ保存 */
export async function pushBundle(uid: string): Promise<number> {
  const bundle = exportAll(new Date().toISOString())
  const ms = Date.now()
  await setDoc(userDoc(uid), { bundle, updatedAtMs: ms }, { merge: true })
  setLastSync(ms)
  return ms
}

/** クラウドのデータをローカルへ復元 */
export async function pullBundle(uid: string): Promise<number | null> {
  const snap = await getDoc(userDoc(uid))
  if (!snap.exists()) return null
  const data = snap.data() as { bundle?: unknown; updatedAtMs?: number }
  if (!data.bundle) return null
  applyingRemote = true
  try { importAll(data.bundle) } finally { applyingRemote = false }
  const ms = data.updatedAtMs ?? Date.now()
  setLastSync(ms)
  return ms
}

export type InitialSyncResult = 'pushed' | 'pulled' | 'conflict'

/**
 * サインイン直後の同期。
 * - リモートが無ければローカルをアップロード
 * - 未同期端末(lastSync=0)にローカルデータがあり、リモートも存在 → 競合（UIで選択）
 * - それ以外はリモートが新しければ取得、古ければアップロード（最終更新優先）
 */
export async function initialSync(uid: string): Promise<InitialSyncResult> {
  const snap = await getDoc(userDoc(uid))
  if (!snap.exists()) { await pushBundle(uid); return 'pushed' }
  const remoteMs = (snap.data() as { updatedAtMs?: number }).updatedAtMs ?? 0
  const lastMs = getLastSync()
  if (lastMs === 0 && localHasData()) return 'conflict'
  if (remoteMs > lastMs) { await pullBundle(uid); return 'pulled' }
  await pushBundle(uid)
  return 'pushed'
}

/** 競合時：リモート優先で取り込む */
export async function resolveUseRemote(uid: string): Promise<void> { await pullBundle(uid) }
/** 競合時：この端末優先で上書き */
export async function resolveUseLocal(uid: string): Promise<void> { await pushBundle(uid) }

/**
 * 各ストアの変更を購読し、デバウンスしてクラウドへ自動push。
 * 返り値で購読解除。
 */
export function startAutoSync(uid: string, onStatus: (s: 'syncing' | 'synced' | 'error') => void): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined
  const trigger = () => {
    if (applyingRemote) return
    if (timer) clearTimeout(timer)
    timer = setTimeout(async () => {
      onStatus('syncing')
      try { await pushBundle(uid); onStatus('synced') } catch { onStatus('error') }
    }, 1500)
  }
  const unsubs = [
    useGrowthStore.subscribe(trigger),
    useBekkaiStore.subscribe(trigger),
    useEntriesStore.subscribe(trigger),
  ]
  return () => { if (timer) clearTimeout(timer); unsubs.forEach((u) => u()) }
}
