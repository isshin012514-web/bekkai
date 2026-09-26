#!/usr/bin/env node
/**
 * bekkai ローカルMCPサーバー（外部依存なし / 通信はstdioのみ）
 *
 * アプリ（localStorage）から書き出した「バックアップJSON」を読み込み、
 * MCPクライアント（Claude Desktop / Claude Code など）に読み取り専用ツールとして公開する。
 *
 * データファイルの探し方（上から順）:
 *   1) --data <path> 引数
 *   2) BEKKAI_DATA 環境変数
 *   3) mcp/data/ · カレントディレクトリ · ~/Downloads · ~/Desktop · ~/bekkai の
 *      bekkai-backup-*.json / bekkai-*.json のうち最も新しいもの
 *
 * 外部へは一切送信しない。ファイルは読むだけで書き換えない。
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { homedir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const SERVER_NAME = 'bekkai-local'
const SERVER_VERSION = '0.1.0'
const PROTOCOL_VERSION = '2025-06-18'

// ---------- ラベル（src/lib/types.ts と対応） ----------

const OUTPUT_TYPE_LABELS = { article: '記事', speech: '発言', product: '成果物', post: '投稿', other: 'その他' }
const INPUT_TYPE_LABELS = { book: '本', article: '記事', video: '動画', dialogue: '対話', other: 'その他' }
const BEKKAI_SCORE_LABELS = { 20: '弱い', 40: 'やや弱', 60: 'やや強', 80: '強い', 100: '核心' }
const SCORE_DETAIL_LABELS = {
  originality: '独自性', communication: '伝達力', practicality: '実用性',
  audience_response: '聴衆の反応', completeness: '完成度',
}
const RISK_LEVEL_LABELS = { low: 'ロー', mid: 'ミドル', high: 'ハイ' }

// ---------- データファイルの解決と読み込み ----------

function parseArgs(argv) {
  const out = {}
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--data' && argv[i + 1]) { out.data = argv[i + 1]; i++ }
    else if (argv[i].startsWith('--data=')) out.data = argv[i].slice('--data='.length)
  }
  return out
}

const ARGS = parseArgs(process.argv.slice(2))

function expandHome(p) {
  return p.startsWith('~') ? path.join(homedir(), p.slice(1)) : p
}

function candidateDirs() {
  return [
    path.join(HERE, 'data'),
    process.cwd(),
    path.join(homedir(), 'Downloads'),
    path.join(homedir(), 'Desktop'),
    path.join(homedir(), 'bekkai'),
  ]
}

/** 候補ディレクトリから最も新しい bekkai-*.json を探す */
function findLatestBackup() {
  const found = []
  for (const dir of candidateDirs()) {
    let names
    try { names = readdirSync(dir) } catch { continue }
    for (const name of names) {
      if (!/^bekkai.*\.json$/i.test(name)) continue
      const full = path.join(dir, name)
      try {
        const st = statSync(full)
        if (st.isFile()) found.push({ file: full, mtimeMs: st.mtimeMs })
      } catch { /* 読めないものは無視 */ }
    }
  }
  found.sort((a, b) => b.mtimeMs - a.mtimeMs)
  return found[0]?.file ?? null
}

function resolveDataFile() {
  const explicit = ARGS.data ?? process.env.BEKKAI_DATA
  if (explicit) {
    const p = path.resolve(expandHome(explicit))
    if (!existsSync(p)) {
      throw new Error(
        `データファイルが見つかりません: ${p}\n` +
        'bekkaiアプリの「データ」画面 →「バックアップを書き出す」でJSONを保存し、そのパスを指定してください。',
      )
    }
    return p
  }
  const latest = findLatestBackup()
  if (!latest) {
    throw new Error(
      'bekkaiのバックアップJSONが見つかりません。\n' +
      'アプリの「データ」画面 →「バックアップを書き出す」で bekkai-backup-YYYY-MM-DD.json を保存し、\n' +
      `次のいずれかに置くか、--data でパスを指定してください:\n${candidateDirs().map((d) => `  - ${d}`).join('\n')}`,
    )
  }
  return latest
}

/** mtime が変わっていたら読み直すキャッシュ */
const cache = { file: null, mtimeMs: 0, bundle: null }

function loadBundle() {
  const file = resolveDataFile()
  const st = statSync(file)
  if (cache.file === file && cache.mtimeMs === st.mtimeMs && cache.bundle) {
    return { file, bundle: cache.bundle, mtime: st.mtime }
  }
  let parsed
  try {
    parsed = JSON.parse(readFileSync(file, 'utf8'))
  } catch (e) {
    throw new Error(`JSONの読み込みに失敗しました: ${file}\n${e.message}`)
  }
  const bundle = normalize(parsed)
  cache.file = file
  cache.mtimeMs = st.mtimeMs
  cache.bundle = bundle
  return { file, bundle, mtime: st.mtime }
}

/** 旧形式（outputsが直下）も含めて正規化し、添付base64は落とす */
function normalize(raw) {
  if (!raw || typeof raw !== 'object') throw new Error('バックアップJSONの形式が不正です')
  const growthRaw = raw.growth ?? (Array.isArray(raw.outputs) ? raw : {})
  const strip = (arr) => (Array.isArray(arr) ? arr : []).map((x) => {
    if (!x || typeof x !== 'object') return x
    const { attachments, ...rest } = x
    return Array.isArray(attachments) && attachments.length
      ? { ...rest, attachment_count: attachments.length }
      : rest
  })
  return {
    exported_at: typeof raw.exported_at === 'string' ? raw.exported_at : null,
    growth: {
      outputs: strip(growthRaw.outputs),
      inputs: strip(growthRaw.inputs),
      reviewers: Array.isArray(growthRaw.reviewers) ? growthRaw.reviewers : [],
      roleModels: Array.isArray(growthRaw.roleModels) ? growthRaw.roleModels : [],
      upcomingPeople: Array.isArray(growthRaw.upcomingPeople) ? growthRaw.upcomingPeople : [],
      weeklyGoals: Array.isArray(growthRaw.weeklyGoals) ? growthRaw.weeklyGoals : [],
      actionPlans: Array.isArray(growthRaw.actionPlans) ? growthRaw.actionPlans : [],
      failurePower: growthRaw.failurePower && typeof growthRaw.failurePower === 'object' ? growthRaw.failurePower : {},
      realizationPower: growthRaw.realizationPower && typeof growthRaw.realizationPower === 'object' ? growthRaw.realizationPower : {},
    },
    bekkai: { bekkais: Array.isArray(raw.bekkai?.bekkais) ? raw.bekkai.bekkais : [] },
    discovery: { entries: raw.discovery?.entries && typeof raw.discovery.entries === 'object' ? raw.discovery.entries : {} },
  }
}

// ---------- 小さなユーティリティ ----------

const nz = (v) => (typeof v === 'string' ? v.trim() : '')
const oneLine = (v) => nz(v).replace(/\s*\n+\s*/g, ' / ')

function byNewest(list) {
  return [...list].sort((a, b) => String(b?.created_at ?? '').localeCompare(String(a?.created_at ?? '')))
}

function afterDate(list, since) {
  if (!since) return list
  return list.filter((x) => String(x?.created_at ?? '') >= since)
}

function avg(nums) {
  const v = nums.filter((n) => typeof n === 'number' && !Number.isNaN(n))
  return v.length ? v.reduce((s, n) => s + n, 0) / v.length : null
}

/** 月曜始まりの週キー(yyyy-MM-dd) */
function weekKey(iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return 'unknown'
  const day = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - day)
  return d.toISOString().slice(0, 10)
}

function entryText(e) {
  if (typeof e === 'string') return e
  if (e && typeof e === 'object') return nz(e.text) || nz(e.name) || nz(e.detail)
  return ''
}

function detailLine(detail) {
  if (!detail || typeof detail !== 'object') return ''
  const parts = Object.entries(SCORE_DETAIL_LABELS)
    .filter(([k]) => typeof detail[k] === 'number')
    .map(([k, label]) => `${label}${detail[k]}`)
  return parts.join(' ')
}

// ---------- テキスト生成 ----------

function buildSummary(bundle) {
  const g = bundle.growth
  const L = []
  L.push('以下は bekkai（自己分析アプリ）に記録された私のデータです。強み・課題・次の一手を考える材料として使ってください。')
  if (bundle.exported_at) L.push(`（書き出し日時: ${bundle.exported_at}）`)
  L.push('')

  L.push('## 別解力（自分らしい × 優れた × 別の やり方の掛け合わせ）')
  if (!bundle.bekkai.bekkais.length) L.push('（記録なし）')
  byNewest(bundle.bekkai.bekkais).forEach((x, i) => {
    L.push(`### ${i + 1}. テーマ: ${nz(x.theme) || '無題'}`)
    ;[['自分らしい', x.self], ['優れた', x.excellent], ['別の', x.different]].forEach(([label, a]) => {
      if (!a) return
      const sc = a.score > 0 ? `${BEKKAI_SCORE_LABELS[a.score] ?? a.score}(${a.score})` : '未評価'
      const reason = nz(a.reason) ? ` / 理由: ${oneLine(a.reason)}` : ''
      const ideas = Array.isArray(a.ideas) && a.ideas.length ? ` / アイデア: ${a.ideas.join('、')}` : ''
      L.push(`- ${label}やり方: ${sc}${reason}${ideas}`)
    })
    if (nz(x.downside)) L.push(`- マイナス面と打ち手: ${oneLine(x.downside)}`)
    if (nz(x.conclusion)) L.push(`- 導いた別解: ${oneLine(x.conclusion)}`)
  })
  L.push('')

  L.push('## 成長力（アウトプット / インプット）')
  if (!g.outputs.length) {
    L.push('（アウトプットの記録なし）')
  } else {
    const selfAvg = avg(g.outputs.map((o) => o.self_score))
    const peerAvg = avg(g.outputs.map((o) => o.peer_score))
    L.push(`アウトプット ${g.outputs.length}件 / 平均自己評価 ${selfAvg?.toFixed(1) ?? '—'}` +
      (peerAvg != null ? ` / 平均他者評価 ${peerAvg.toFixed(1)}` : ''))
    byNewest(g.outputs).slice(0, 10).forEach((o) => {
      const peer = o.peer_score != null ? ` / 他者${o.peer_score}` : ''
      L.push(`- [${OUTPUT_TYPE_LABELS[o.type] ?? o.type}] ${nz(o.title)}（自己${o.self_score ?? '—'}${peer}）` +
        (nz(o.self_improve) ? ` 課題: ${oneLine(o.self_improve)}` : ''))
    })
  }
  if (g.inputs.length) {
    L.push(`インプット ${g.inputs.length}件（直近5件）`)
    byNewest(g.inputs).slice(0, 5).forEach((i) => {
      L.push(`- [${INPUT_TYPE_LABELS[i.type] ?? i.type}] ${nz(i.title)}` + (nz(i.learning) ? ` → 学び: ${oneLine(i.learning)}` : ''))
    })
  }
  if (g.roleModels.length) L.push(`ロールモデル: ${g.roleModels.map((r) => nz(r.name)).filter(Boolean).join('、')}`)
  const openGoals = g.weeklyGoals.filter((w) => !w.done)
  if (openGoals.length) L.push(`未達の週次目標: ${openGoals.map((w) => nz(w.goal)).filter(Boolean).join('、')}`)
  L.push('')

  L.push('## 発見力（自己分析マンダラ）')
  const filled = Object.entries(bundle.discovery.entries)
    .map(([k, v]) => [k, (Array.isArray(v) ? v : []).map(entryText).filter(Boolean)])
    .filter(([, texts]) => texts.length)
  if (!filled.length) L.push('（記録なし）')
  filled.forEach(([k, texts]) => L.push(`- ${k}: ${texts.join('、')}`))
  L.push('')

  const fp = bundle.growth.failurePower
  const fpLines = []
  ;(fp.failureList ?? []).slice(0, 5).forEach((f) => {
    fpLines.push(`- 失敗: ${oneLine(f.content)} / 教訓: ${oneLine(f.lesson)} / 回避策: ${oneLine(f.avoidance)}`)
  })
  ;(fp.premortems ?? []).slice(0, 5).forEach((p) => {
    fpLines.push(`- 事前検死: ${oneLine(p.risk)}（発生${RISK_LEVEL_LABELS[p.probability] ?? p.probability} / 影響${RISK_LEVEL_LABELS[p.impact] ?? p.impact}）→ ${oneLine(p.countermeasure)}`)
  })
  ;(fp.declarations ?? []).slice(0, 5).forEach((d) => {
    fpLines.push(`- 成功宣言: ${oneLine(d.content)}（期限 ${nz(d.deadline) || '未設定'} / 結果 ${nz(d.result) || 'pending'}）`)
  })
  if (fpLines.length) { L.push('## 失敗力'); L.push(...fpLines); L.push('') }

  const rp = bundle.growth.realizationPower
  const rpLines = []
  if (nz(rp.confidence)) rpLines.push(`- 自信の根拠: ${oneLine(rp.confidence)}`)
  ;(rp.combinations ?? []).slice(0, 5).forEach((c) => {
    rpLines.push(`- 掛け合わせ: ${oneLine(c.content ?? c.theme ?? '')}（${nz(c.status) || '—'}）`)
  })
  ;(rp.team ?? []).slice(0, 8).forEach((t) => {
    rpLines.push(`- チーム: ${nz(t.name)}${nz(t.role) ? `（${nz(t.role)}）` : ''}`)
  })
  if (rpLines.length) { L.push('## 実現力'); L.push(...rpLines) }

  return L.join('\n').trim()
}

function buildWeekly(bundle, weeks) {
  const g = bundle.growth
  const map = new Map()
  const bucket = (k) => {
    if (!map.has(k)) map.set(k, { week: k, outputs: [], inputs: [], goals: [] })
    return map.get(k)
  }
  g.outputs.forEach((o) => bucket(weekKey(o.created_at)).outputs.push(o))
  g.inputs.forEach((i) => bucket(weekKey(i.created_at)).inputs.push(i))
  g.weeklyGoals.forEach((w) => bucket(nz(w.week) || weekKey(w.created_at)).goals.push(w))

  const rows = [...map.values()]
    .filter((r) => r.week !== 'unknown')
    .sort((a, b) => b.week.localeCompare(a.week))
    .slice(0, weeks)

  if (!rows.length) return '週次に集計できる記録がまだありません。'

  const L = ['# 週次サマリー（月曜始まり / 新しい週が上）', '']
  rows.forEach((r) => {
    const selfAvg = avg(r.outputs.map((o) => o.self_score))
    const peerAvg = avg(r.outputs.map((o) => o.peer_score))
    const doneGoals = r.goals.filter((w) => w.done).length
    L.push(`## ${r.week} の週`)
    L.push(`- OUT ${r.outputs.length}件 / IN ${r.inputs.length}件`)
    L.push(`- 自己評価 平均 ${selfAvg?.toFixed(1) ?? '—'} / 他者評価 平均 ${peerAvg?.toFixed(1) ?? '—'}`)
    if (r.goals.length) L.push(`- 週次目標 ${doneGoals}/${r.goals.length} 達成: ${r.goals.map((w) => `${w.done ? '✓' : '×'}${nz(w.goal)}`).join('、')}`)
    r.outputs.forEach((o) => L.push(`  - [${OUTPUT_TYPE_LABELS[o.type] ?? o.type}] ${nz(o.title)}（自己${o.self_score ?? '—'}${o.peer_score != null ? ` / 他者${o.peer_score}` : ''}）`))
    L.push('')
  })
  return L.join('\n').trim()
}

function formatOutputs(list, includeDetail) {
  if (!list.length) return '該当するアウトプットはありません。'
  const L = []
  list.forEach((o) => {
    L.push(`## ${nz(o.title) || '無題'}`)
    L.push(`- 種類: ${OUTPUT_TYPE_LABELS[o.type] ?? o.type} / 記録日: ${String(o.created_at ?? '').slice(0, 10)}${o.is_key ? ' / ★重要' : ''}`)
    L.push(`- 自己評価: ${o.self_score ?? '—'}${o.peer_score != null ? ` / 他者評価: ${o.peer_score}` : ''}`)
    if (includeDetail) {
      const sd = detailLine(o.self_score_detail)
      const pd = detailLine(o.peer_score_detail)
      if (sd) L.push(`- 自己（観点別）: ${sd}`)
      if (pd) L.push(`- 他者（観点別）: ${pd}`)
      if (nz(o.audience)) L.push(`- 誰に向けて: ${oneLine(o.audience)}`)
      if (nz(o.audience_reaction)) L.push(`- 反応: ${oneLine(o.audience_reaction)}`)
      if (nz(o.self_good)) L.push(`- できたこと: ${oneLine(o.self_good)}`)
      if (nz(o.self_improve)) L.push(`- できなかったこと: ${oneLine(o.self_improve)}`)
      if (nz(o.peer_note)) L.push(`- 他者コメント: ${oneLine(o.peer_note)}`)
      if (nz(o.memo)) L.push(`- メモ: ${oneLine(o.memo)}`)
    }
    L.push('')
  })
  return L.join('\n').trim()
}

function formatInputs(list) {
  if (!list.length) return '該当するインプットはありません。'
  return list.map((i) => {
    const head = `- [${INPUT_TYPE_LABELS[i.type] ?? i.type}] ${nz(i.title) || '無題'}（${String(i.created_at ?? '').slice(0, 10)}）${i.is_key ? ' ★' : ''}`
    return nz(i.learning) ? `${head}\n  学び: ${oneLine(i.learning)}` : head
  }).join('\n')
}

function formatBekkais(list) {
  if (!list.length) return '別解の記録はまだありません。'
  const L = []
  list.forEach((x) => {
    L.push(`## ${nz(x.theme) || '無題'}${x.is_key ? ' ★' : ''}`)
    ;[['自分らしいやり方', x.self], ['優れたやり方', x.excellent], ['別のやり方', x.different]].forEach(([label, a]) => {
      if (!a) return
      const sc = a.score > 0 ? `${BEKKAI_SCORE_LABELS[a.score] ?? a.score}(${a.score})` : '未評価'
      L.push(`- ${label}: ${sc}`)
      if (nz(a.reason)) L.push(`  理由: ${oneLine(a.reason)}`)
      if (Array.isArray(a.ideas) && a.ideas.length) L.push(`  アイデア: ${a.ideas.join('、')}`)
    })
    if (nz(x.downside)) L.push(`- マイナス面と打ち手: ${oneLine(x.downside)}`)
    if (nz(x.conclusion)) L.push(`- 導いた別解: ${oneLine(x.conclusion)}`)
    L.push('')
  })
  return L.join('\n').trim()
}

// ---------- ツール定義 ----------

const TOOLS = [
  {
    name: 'bekkai_status',
    description: '読み込んでいるbekkaiバックアップJSONの場所・書き出し日時・各データの件数を返す。まず最初にこれを呼ぶとよい。',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    handler: ({ file, bundle, mtime }) => {
      const g = bundle.growth
      return [
        '# bekkai ローカルMCP 状態',
        `- データファイル: ${file}`,
        `- ファイル更新日時: ${mtime.toISOString()}`,
        `- アプリ書き出し日時: ${bundle.exported_at ?? '（不明）'}`,
        `- アウトプット: ${g.outputs.length}件 / インプット: ${g.inputs.length}件`,
        `- 別解: ${bundle.bekkai.bekkais.length}件`,
        `- 発見力（記入済みマス）: ${Object.values(bundle.discovery.entries).filter((v) => Array.isArray(v) && v.length).length}`,
        `- 週次目標: ${g.weeklyGoals.length}件（未達 ${g.weeklyGoals.filter((w) => !w.done).length}件）`,
        `- ロールモデル: ${g.roleModels.length}件 / 会いたい人: ${g.upcomingPeople.length}件`,
        '',
        'データが古い場合は、アプリの「データ」画面から再度バックアップを書き出すと自動で読み直します。',
      ].join('\n')
    },
  },
  {
    name: 'bekkai_summary',
    description: '別解力・成長力・発見力・失敗力・実現力を横断した日本語サマリー。壁打ちや助言の前提として全体像を把握するのに使う。',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    handler: ({ bundle }) => buildSummary(bundle),
  },
  {
    name: 'bekkai_outputs',
    description: 'アウトプット記録の一覧（新しい順）。自己採点・他者採点・振り返りを含めて読める。',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'integer', minimum: 1, maximum: 200, description: '最大件数（既定20）' },
        since: { type: 'string', description: 'この日付以降のみ（YYYY-MM-DD）' },
        key_only: { type: 'boolean', description: '★重要フラグのみ' },
        include_detail: { type: 'boolean', description: '観点別スコアや振り返り本文も含める（既定true）' },
      },
      additionalProperties: false,
    },
    handler: ({ bundle }, args) => {
      let list = byNewest(bundle.growth.outputs)
      if (args.key_only) list = list.filter((o) => o.is_key)
      list = afterDate(list, args.since)
      return formatOutputs(list.slice(0, args.limit ?? 20), args.include_detail !== false)
    },
  },
  {
    name: 'bekkai_inputs',
    description: 'インプット記録（本・記事・動画・対話など）の一覧と、そこから得た学び。',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'integer', minimum: 1, maximum: 300, description: '最大件数（既定30）' },
        since: { type: 'string', description: 'この日付以降のみ（YYYY-MM-DD）' },
        key_only: { type: 'boolean', description: '★重要フラグのみ' },
      },
      additionalProperties: false,
    },
    handler: ({ bundle }, args) => {
      let list = byNewest(bundle.growth.inputs)
      if (args.key_only) list = list.filter((i) => i.is_key)
      list = afterDate(list, args.since)
      return formatInputs(list.slice(0, args.limit ?? 30))
    },
  },
  {
    name: 'bekkai_bekkais',
    description: '別解（自分らしい × 優れた × 別の やり方）の記録。各軸の評価・理由・アイデア・導いた別解まで読める。',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'integer', minimum: 1, maximum: 100, description: '最大件数（既定10）' },
        key_only: { type: 'boolean', description: '★重要フラグのみ' },
      },
      additionalProperties: false,
    },
    handler: ({ bundle }, args) => {
      let list = byNewest(bundle.bekkai.bekkais)
      if (args.key_only) list = list.filter((x) => x.is_key)
      return formatBekkais(list.slice(0, args.limit ?? 10))
    },
  },
  {
    name: 'bekkai_discovery',
    description: '発見力（自己分析マンダラ）の記入内容。keyを指定するとそのマスだけ返す。',
    inputSchema: {
      type: 'object',
      properties: { key: { type: 'string', description: 'マスのキー（例: purpose, goal, problem, self, market）' } },
      additionalProperties: false,
    },
    handler: ({ bundle }, args) => {
      const entries = Object.entries(bundle.discovery.entries)
        .map(([k, v]) => [k, (Array.isArray(v) ? v : []).map(entryText).filter(Boolean)])
        .filter(([k, texts]) => texts.length && (!args.key || k === args.key))
      if (!entries.length) return args.key ? `「${args.key}」には記録がありません。` : '発見力の記録はまだありません。'
      return entries.map(([k, texts]) => `## ${k}\n${texts.map((t) => `- ${t}`).join('\n')}`).join('\n\n')
    },
  },
  {
    name: 'bekkai_weekly',
    description: '週ごと（月曜始まり）のIN/OUT件数・平均自己採点・平均他者採点・週次目標の達成状況。習慣の波を見るのに使う。',
    inputSchema: {
      type: 'object',
      properties: { weeks: { type: 'integer', minimum: 1, maximum: 52, description: '遡る週数（既定8）' } },
      additionalProperties: false,
    },
    handler: ({ bundle }, args) => buildWeekly(bundle, args.weeks ?? 8),
  },
  {
    name: 'bekkai_raw',
    description: '正規化後の生データ（JSON）。添付画像のbase64は除外済み。細かい分析や集計をしたいときに使う。',
    inputSchema: {
      type: 'object',
      properties: {
        section: {
          type: 'string',
          enum: ['all', 'outputs', 'inputs', 'bekkais', 'discovery', 'weeklyGoals', 'actionPlans', 'failurePower', 'realizationPower', 'people'],
          description: '取り出す部分（既定all）',
        },
        max_chars: { type: 'integer', minimum: 500, maximum: 200000, description: '出力の最大文字数（既定40000）' },
      },
      additionalProperties: false,
    },
    handler: ({ bundle }, args) => {
      const g = bundle.growth
      const pick = {
        all: bundle,
        outputs: g.outputs,
        inputs: g.inputs,
        bekkais: bundle.bekkai.bekkais,
        discovery: bundle.discovery.entries,
        weeklyGoals: g.weeklyGoals,
        actionPlans: g.actionPlans,
        failurePower: g.failurePower,
        realizationPower: g.realizationPower,
        people: { reviewers: g.reviewers, roleModels: g.roleModels, upcomingPeople: g.upcomingPeople },
      }[args.section ?? 'all']
      const max = args.max_chars ?? 40000
      const json = JSON.stringify(pick, null, 2)
      return json.length <= max
        ? json
        : `${json.slice(0, max)}\n\n… （${json.length}文字のうち先頭${max}文字のみ。section や max_chars で絞り込んでください）`
    },
  },
]

// ---------- MCP（JSON-RPC over stdio） ----------

function send(msg) {
  process.stdout.write(`${JSON.stringify(msg)}\n`)
}

function result(id, value) { send({ jsonrpc: '2.0', id, result: value }) }
function failure(id, code, message) { send({ jsonrpc: '2.0', id, error: { code, message } }) }

function handle(msg) {
  const { id, method, params } = msg
  const isRequest = id !== undefined && id !== null

  switch (method) {
    case 'initialize':
      return result(id, {
        protocolVersion: typeof params?.protocolVersion === 'string' ? params.protocolVersion : PROTOCOL_VERSION,
        capabilities: { tools: {} },
        serverInfo: { name: SERVER_NAME, version: SERVER_VERSION },
        instructions:
          'bekkai（自己分析アプリ）のローカルデータを読むサーバー。全体像は bekkai_summary、' +
          '読み込み状況は bekkai_status、細かい分析は bekkai_raw を使う。読み取り専用。',
      })

    case 'notifications/initialized':
    case 'initialized':
      return

    case 'ping':
      return result(id, {})

    case 'tools/list':
      return result(id, {
        tools: TOOLS.map(({ name, description, inputSchema }) => ({ name, description, inputSchema })),
      })

    case 'resources/list':
      return result(id, { resources: [] })

    case 'prompts/list':
      return result(id, { prompts: [] })

    case 'tools/call': {
      const tool = TOOLS.find((t) => t.name === params?.name)
      if (!tool) return failure(id, -32602, `未知のツール: ${params?.name}`)
      try {
        const text = tool.handler(loadBundle(), params?.arguments ?? {})
        return result(id, { content: [{ type: 'text', text }] })
      } catch (e) {
        return result(id, { content: [{ type: 'text', text: `エラー: ${e.message}` }], isError: true })
      }
    }

    default:
      if (isRequest) return failure(id, -32601, `未対応のメソッド: ${method}`)
  }
}

let buffer = ''
process.stdin.setEncoding('utf8')
process.stdin.on('data', (chunk) => {
  buffer += chunk
  let nl
  while ((nl = buffer.indexOf('\n')) >= 0) {
    const line = buffer.slice(0, nl).trim()
    buffer = buffer.slice(nl + 1)
    if (!line) continue
    let msg
    try {
      msg = JSON.parse(line)
    } catch {
      send({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'JSONの解析に失敗しました' } })
      continue
    }
    try {
      handle(msg)
    } catch (e) {
      if (msg?.id !== undefined && msg?.id !== null) failure(msg.id, -32603, e.message)
      else process.stderr.write(`[bekkai-mcp] ${e.message}\n`)
    }
  }
})
process.stdin.on('end', () => process.exit(0))
