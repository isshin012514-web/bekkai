export const DISCOVERY_CONCEPT = {
  definition: '解くべき問題を解くための力',
  lead: '問題はクライアント・上司・環境・作業の中で常に変化する。だからこそ、自分で問題を発見し、転換していく力が核になる。',
  steps: [
    { no: 1, title: '定義・発見', text: '問題を正しく「定義」し「発見」する', icon: '🔍' },
    { no: 2, title: '段取り', text: 'いつまでに・何を・どの順番で行うかを決める', icon: '📋' },
    { no: 3, title: '障壁把握', text: 'そこにどのような障壁があるかを把握する', icon: '🧱' },
    { no: 4, title: '到達点', text: '最終的にどの状態を目指すかを明らかにする', icon: '🏁' },
  ],
  note: '8Mは視点を変えるフレームワーク。8つの窓から問題を見ることで、発見と転換の精度を上げる。',
}

export const MODULES = [
  { id: 'purpose', name: '目的', sub: 'なぜやるのか', icon: '🔥', color: 'purpose', position: 0 },
  { id: 'goal', name: '目標', sub: '理想の状態', icon: '🎯', color: 'goal', position: 1 },
  { id: 'problem', name: '問題', sub: '理想とのギャップ', icon: '⚡', color: 'problem', position: 2 },
  { id: 'past', name: '昔', sub: '過去・先人に学ぶ', icon: '📜', color: 'past', position: 3 },
  { id: 'self', name: '自分', sub: '強み・弱み', icon: '💎', color: 'self', position: 5 },
  { id: 'around', name: '周り', sub: '仲間・時間・場所', icon: '🤝', color: 'around', position: 6 },
  { id: 'market', name: '市場', sub: '顧客・競合', icon: '🌍', color: 'market', position: 7 },
  { id: 'future', name: '未来', sub: '今後の課題', icon: '🚀', color: 'future', position: 8 },
]

// 自分・周り・市場はリソースを把握する3点セット
export const RESOURCE_SET = ['self', 'around', 'market']

export const MODULE_INTRO = {
  purpose: {
    lead: 'なぜやるのかを明確にし、全体の価値を把握する。',
    questions: ['この仕事の全体の価値は何か', 'なぜ自分がやるのか', '誰のための取り組みか'],
  },
  goal: {
    lead: '理想の状態を明記する。社会の役に立つこと、未来にフォーカスする。',
    questions: ['どんな状態になれば成功か', '社会にどう役立つか', '未来からどう見えるか'],
  },
  problem: {
    lead: '目標と現実のギャップを確認し、何が足りないかを噛み砕く。',
    questions: ['要求はスピードか？量か？', 'コストを下げるのか？売上を上げるのか？', '顧客数を増やすのか？価格設定を変えるのか？'],
  },
  past: {
    lead: '過去に問題を解決した人を参考にする。先人の水準と勝ち筋を見極める。',
    questions: ['過去のトップはどの水準か', '異業種に当てはめるとどうか', '規模・範囲・強さ・深さでどう勝ったか'],
  },
  self: {
    lead: 'リソースを把握する3点セットの1つ。自分の強み・弱みを見極める。',
    questions: ['自分の強みは何か', '自分の弱みは何か', 'どの条件で力が出るか'],
    resource: true,
  },
  around: {
    lead: 'リソースを把握する3点セットの1つ。動かせる人・時間・コストを確認する。',
    questions: ['仲間は何人動かせるか', 'コスト・時間はどれくらいかけられるか', '上司からどう見られているか / 会社の構造は'],
    resource: true,
  },
  market: {
    lead: 'リソースを把握する3点セットの1つ。顧客・競合・市場を確認する。',
    questions: ['顧客は誰か', '競合は誰か', '市場のニーズと評価基準は何か'],
    resource: true,
  },
  future: {
    lead: '荒唐無稽でも可能性はゼロではない。未来を構想し、今後の課題を出す。',
    questions: ['この先どんな未来がありうるか', '公的調査・白書・シンクタンクは何を示すか', '次に検証・撤退すべきことは何か'],
  },
}

export const MODULE_DETAILS = {
  purpose: {
    center: { name: '目的', icon: '🔥' },
    cells: [
      { id: 'why', name: '動機', sub: 'なぜやるのか', icon: '❓' },
      { id: 'origin', name: '原体験', sub: 'きっかけ', icon: '💡' },
      { id: 'anger', name: '怒り・悔しさ', sub: '負の原動力', icon: '😤' },
      { id: 'ideal', name: '理想像', sub: 'こうなりたい', icon: '✨' },
      { id: 'value', name: '価値観', sub: '譲れないもの', icon: '💪' },
      { id: 'who', name: '誰のため', sub: '届けたい相手', icon: '👤' },
      { id: 'mission', name: '使命', sub: '自分の役割', icon: '🏴' },
      { id: 'passion', name: '熱量', sub: '燃える理由', icon: '🔥' },
    ],
  },
  goal: {
    center: { name: '目標', icon: '🎯' },
    cells: [
      { id: 'state', name: '理想状態', sub: 'ゴールの姿', icon: '🏁' },
      { id: 'number', name: '数値目標', sub: 'KPI', icon: '📊' },
      { id: 'deadline', name: '期限', sub: 'いつまでに', icon: '⏰' },
      { id: 'milestone', name: 'マイルストーン', sub: '中間地点', icon: '📍' },
      { id: 'criteria', name: '判断基準', sub: '成功の定義', icon: '✅' },
      { id: 'priority', name: '優先順位', sub: '何を先に', icon: '🔢' },
      { id: 'scope', name: 'スコープ', sub: 'やらないこと', icon: '🚫' },
      { id: 'reward', name: '報酬', sub: '達成したら', icon: '🏆' },
    ],
  },
  problem: {
    center: { name: '問題', icon: '⚡' },
    cells: [
      { id: 'gap', name: 'ギャップ', sub: '理想との差', icon: '📏' },
      { id: 'blocker', name: 'ボトルネック', sub: '詰まっている所', icon: '🧱' },
      { id: 'fail', name: '失敗パターン', sub: '繰り返すミス', icon: '🔄' },
      { id: 'root', name: '根本原因', sub: 'なぜ起きるか', icon: '🌱' },
      { id: 'pain', name: '痛み', sub: '何が辛いか', icon: '💥' },
      { id: 'risk', name: 'リスク', sub: '起きうる最悪', icon: '⚠️' },
      { id: 'blind', name: '盲点', sub: '見えていない', icon: '👁️' },
      { id: 'assumption', name: '思い込み', sub: '疑うべき前提', icon: '🤔' },
    ],
  },
  past: {
    center: { name: '昔', icon: '📜' },
    cells: [
      { id: 'top', name: '過去のトップ', sub: '先人の水準', icon: '👑' },
      { id: 'crossover', name: '異業種転用', sub: '他分野の水準', icon: '🔀' },
      { id: 'winpath', name: '勝ち筋', sub: '規模・範囲・強さ・深さ', icon: '🗺️' },
      { id: 'standard', name: '決まり手', sub: '量か？早さか？', icon: '⚖️' },
      { id: 'success', name: '成功体験', sub: '自分が勝った時', icon: '🏅' },
      { id: 'failure', name: '失敗体験', sub: '自分が負けた時', icon: '💔' },
      { id: 'pattern', name: '行動パターン', sub: '繰り返す癖', icon: '🔁' },
      { id: 'lesson', name: '教訓', sub: '学んだこと', icon: '📕' },
    ],
  },
  self: {
    center: { name: '自分', icon: '💎' },
    cells: [
      { id: 'strength', name: '強み', sub: '武器になる資質', icon: '⚔️' },
      { id: 'weakness', name: '弱み', sub: '失敗を生む癖', icon: '🛡️' },
      { id: 'can', name: 'できること', sub: '再現可能スキル', icon: '✅' },
      { id: 'cant', name: 'できないこと', sub: '学ぶ・任せる', icon: '🔧' },
      { id: 'condition', name: '発動条件', sub: '成果が出る環境', icon: '🟢' },
      { id: 'break', name: '壊れる条件', sub: '失敗する環境', icon: '🔴' },
      { id: 'others', name: '他者視点', sub: '周りからの評価', icon: '👥' },
      { id: 'compare', name: '比較', sub: '組織・日本での順位', icon: '📊' },
    ],
  },
  around: {
    center: { name: '周り', icon: '🤝' },
    cells: [
      { id: 'team', name: '動かせる人', sub: '何人動かせるか', icon: '👥' },
      { id: 'ally', name: '味方・師匠', sub: '頼れる人', icon: '🙌' },
      { id: 'time', name: '時間', sub: 'かけられる時間', icon: '⏳' },
      { id: 'money', name: 'コスト', sub: 'かけられる資金', icon: '💰' },
      { id: 'tool', name: 'ツール', sub: '使える道具', icon: '🔨' },
      { id: 'commline', name: '伝達経路', sub: 'コミュニケーションライン', icon: '🔗' },
      { id: 'boss', name: '上司の視点', sub: 'どう見られているか', icon: '👔' },
      { id: 'structure', name: '会社構造', sub: '組織の仕組み', icon: '🏢' },
    ],
  },
  market: {
    center: { name: '市場', icon: '🌍' },
    cells: [
      { id: 'customer', name: '顧客', sub: '誰が買うか', icon: '🛒' },
      { id: 'competitor', name: '競合', sub: '誰と戦うか', icon: '⚔️' },
      { id: 'trend', name: 'トレンド', sub: '今の流れ', icon: '📈' },
      { id: 'need', name: 'ニーズ', sub: '何が求められる', icon: '🔍' },
      { id: 'evaluation', name: '評価基準', sub: '何で測られる', icon: '📋' },
      { id: 'opportunity', name: '機会', sub: 'チャンスの窓', icon: '🪟' },
      { id: 'threat', name: '脅威', sub: '外部リスク', icon: '⛈️' },
      { id: 'gap', name: '空白地帯', sub: '誰もいない場所', icon: '🏝️' },
    ],
  },
  future: {
    center: { name: '未来', icon: '🚀' },
    cells: [
      { id: 'next', name: '次のアクション', sub: '今すぐやること', icon: '▶️' },
      { id: 'experiment', name: '検証', sub: '試すこと', icon: '🧪' },
      { id: 'grow', name: '伸ばす', sub: '強化ポイント', icon: '💪' },
      { id: 'fix', name: '直す', sub: '改善ポイント', icon: '🔧' },
      { id: 'quit', name: 'やめる', sub: '撤退ライン', icon: '🛑' },
      { id: 'delegate', name: '任せる', sub: '人に渡すこと', icon: '🤲' },
      { id: 'bet', name: '賭ける', sub: '集中投下する所', icon: '🎲' },
      { id: 'vision', name: '長期展望', sub: '3年後の自分', icon: '🔭' },
    ],
  },
}

/**
 * セル項目の初期データ。
 * 本番では空（ユーザーが自分で書き込む）。デモ用サンプルを入れたい場合は
 * `${moduleId}-${cellId}` をキーに配列を追加する（文字列 or 構造化オブジェクト）。
 */
export const CELL_ENTRIES = {}

/**
 * デモ用のサンプル入力。`${moduleId}-${cellId}` をキーに、entries-store と同じ
 * オブジェクト形（{ id, text, created_at, reason? } / self は level/detail 付き）で持つ。
 */
export const DEMO_CELL_ENTRIES = {
  'purpose-why': [
    { id: 'd-pw1', text: '学んだことを誰かの役に立つ形にしたい', reason: '自分が独学で苦労した経験があるから', created_at: '2026-05-20T09:00:00.000Z' },
  ],
  'purpose-ideal': [
    { id: 'd-pi1', text: '「あの人の発信で動けた」と言われる存在', created_at: '2026-05-20T09:00:00.000Z' },
  ],
  'goal-state': [
    { id: 'd-gs1', text: '月1本、反応のある発信を継続できている', created_at: '2026-05-21T09:00:00.000Z' },
  ],
  'problem-gap': [
    { id: 'd-pg1', text: 'インプットは多いがアウトプットが続かない', reason: '完璧を求めて出すのが遅れる', created_at: '2026-05-21T09:00:00.000Z' },
  ],
  'self-strength': [
    { id: 'd-ss1', text: '現場の試行錯誤を等身大で言語化できる', level: 4, detail: '失敗込みで語れるので共感されやすい', created_at: '2026-05-22T09:00:00.000Z' },
  ],
  'self-weakness': [
    { id: 'd-sw1', text: '完璧主義で着手・公開が遅い', level: 3, detail: '8割で出す癖をつける', fix: '下書きを翌日までに必ず公開', created_at: '2026-05-22T09:00:00.000Z' },
  ],
  'market-customer': [
    { id: 'd-mc1', text: '自分と同じく独学でつまずいている初学者', created_at: '2026-05-23T09:00:00.000Z' },
  ],
  'future-next': [
    { id: 'd-ft1', text: '発信の型をつくって量産できるようにする', created_at: '2026-05-24T09:00:00.000Z' },
  ],
  // ── 各モジュールを一通りサンプルで埋める ──
  'goal-number': [
    { id: 'd-gn1', text: 'フォロワー1,000人 / 月間PV 1万', created_at: '2026-05-21T09:10:00.000Z' },
  ],
  'goal-deadline': [
    { id: 'd-gd1', text: '半年後（2026年内）', created_at: '2026-05-21T09:20:00.000Z' },
  ],
  'problem-root': [
    { id: 'd-pr1', text: '「完璧じゃないと出せない」という思い込み', reason: '過去に雑な発信で批判された経験', created_at: '2026-05-21T09:30:00.000Z' },
  ],
  'past-origin': [
    { id: 'd-po1', text: '独学で挫折しかけた時、先輩の一言で救われた', created_at: '2026-05-19T09:00:00.000Z' },
  ],
  'self-can': [
    { id: 'd-sc1', text: '複雑な話を図解1枚に落とす', level: 4, detail: '社内資料で評価された', created_at: '2026-05-22T09:30:00.000Z' },
  ],
  'self-compare': [
    { id: 'd-scm1', label: '図解・言語化力', value: '組織内で上位3人くらい', color: 'success', created_at: '2026-05-22T10:00:00.000Z' },
    { id: 'd-scm2', label: '発信の継続力', value: '日本の発信者の中では中の下', color: 'warning', created_at: '2026-05-22T10:05:00.000Z' },
  ],
  'around-ally': [
    { id: 'd-aa1', text: '同業の友人（壁打ち相手）', created_at: '2026-05-23T09:00:00.000Z' },
  ],
  'around-time': [
    { id: 'd-at1', text: '平日夜1時間 / 週末3時間', created_at: '2026-05-23T09:10:00.000Z' },
  ],
  'market-competitor': [
    { id: 'd-mco1', text: '体系的に教える発信者が多い（自分は"過程"で差別化）', created_at: '2026-05-23T09:20:00.000Z' },
  ],
  'market-gap': [
    { id: 'd-mg1', text: '「失敗の過程」を見せる発信が少ない', created_at: '2026-05-23T09:30:00.000Z' },
  ],
  'future-bet': [
    { id: 'd-fb1', text: '「等身大の失敗実況」スタイルに集中投下', created_at: '2026-05-24T09:10:00.000Z' },
  ],
}

/**
 * 自己採点の観点（bekkai の SELF_SCORE_CRITERIA に準拠）。
 * 各観点は 0〜10（0.5刻み）で採点し、総合スコアは平均を0.5刻みに丸める。
 */
export const SCORE_CRITERIA = [
  { key: 'originality', label: '独自性', hint: '自分なりの視点・希少性はあるか' },
  { key: 'communication', label: '伝達力', hint: 'わかりやすく伝えられたか' },
  { key: 'practicality', label: '実用性', hint: '相手にとって価値ある内容だったか' },
  { key: 'audience_response', label: '聴衆の反応', hint: '相手の反応・手応えはどうだったか' },
  { key: 'completeness', label: '完成度', hint: '準備・仕上がりは十分だったか' },
]

/**
 * セル種別ごとの自己採点観点。
 * 「強み」を“聴衆の反応”で測るような意味的ズレを避けるため、項目の性質に
 * 合った観点セットを使い分ける。各観点は 0〜10（0.5刻み）。
 * - strength: 武器としての強みを評価
 * - weakness: 弱みの深刻さ・対処可能性を評価
 * - output: bekkaiアウトプット相当（既存の SCORE_CRITERIA と同義）
 * - generic: それ以外の項目（仮説・観察）の確からしさ・重要度を評価
 */
export const SCORE_CRITERIA_SETS = {
  strength: [
    { key: 'reproducibility', label: '再現性', hint: '意図して再現できるか' },
    { key: 'uniqueness', label: '独自性', hint: '他者と差がつく強みか' },
    { key: 'impact', label: '成果貢献', hint: '成果に直結するか' },
    { key: 'growth', label: '伸びしろ', hint: 'さらに伸ばせるか' },
    { key: 'awareness', label: '自覚度', hint: '根拠を持って自覚できているか' },
  ],
  weakness: [
    { key: 'impact', label: '影響度', hint: '成果への悪影響の大きさ' },
    { key: 'frequency', label: '頻度', hint: 'どれくらい繰り返すか' },
    { key: 'controllability', label: '対策可能性', hint: '対策で抑えられるか' },
    { key: 'awareness', label: '自覚度', hint: '兆候に気づけるか' },
    { key: 'urgency', label: '緊急度', hint: '今すぐ手を打つべきか' },
  ],
  output: SCORE_CRITERIA,
  generic: [
    { key: 'certainty', label: '確からしさ', hint: '事実・根拠に裏づけられているか' },
    { key: 'importance', label: '重要度', hint: '問題解決にとって重要か' },
    { key: 'specificity', label: '具体性', hint: '行動に落とせるほど具体的か' },
    { key: 'evidence', label: '根拠の強さ', hint: '裏づけは十分か' },
    { key: 'urgency', label: '緊急度', hint: '今すぐ向き合うべきか' },
  ],
}

/**
 * 項目（モジュール×セル）に対して使う採点観点セットのキーを返す。
 * 保存済みスコアには criteria_set としてこのキーを記録し、表示時に同じ観点で描画する。
 */
export function scoreSetKeyForCell(moduleId, cellId) {
  if (moduleId === 'self' && cellId === 'strength') return 'strength'
  if (moduleId === 'self' && cellId === 'weakness') return 'weakness'
  return 'generic'
}

/**
 * bekkai「記録」アプリのアウトプット（根拠として引用する候補）。
 *
 * 後で実データと同期する想定の「つなぎ目」。ホスト側が
 * <DiscoveryApp data={{ BEKKAI_OUTPUTS: [...] }} /> で同期済みの
 * アウトプット配列を注入すれば、この既定サンプルが置き換わる。
 * 形は bekkai の Output 型（id / title / type / self_score / created_at …）に準拠。
 */
export const BEKKAI_OUTPUTS = []

/**
 * Bundled default dataset for the 発見力8M module.
 * A host application can pass a partial override of this shape into
 * <DiscoveryApp data={...} /> (or the DataProvider) to drive the UI
 * with its own content. Any omitted key falls back to these defaults.
 */
export const DEFAULT_DATA = {
  DISCOVERY_CONCEPT,
  MODULES,
  RESOURCE_SET,
  MODULE_INTRO,
  MODULE_DETAILS,
  CELL_ENTRIES,
  SCORE_CRITERIA,
  SCORE_CRITERIA_SETS,
  BEKKAI_OUTPUTS,
}
