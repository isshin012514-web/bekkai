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
// 全64マス（8モジュール×8セル）をサンプルで埋める
const D = '2026-05-22T09:00:00.000Z'
const txt = (id, text, extra = {}) => [{ id, text, created_at: D, ...extra }]
export const DEMO_CELL_ENTRIES = {
  // 目的
  'purpose-why': txt('d1', '学んだことを誰かの役に立つ形にしたい', { reason: '自分が独学で苦労したから' }),
  'purpose-origin': txt('d2', '独学で挫折しかけた時、先輩の一言で救われた'),
  'purpose-anger': txt('d3', '分かりにくい解説で時間を溶かした悔しさ'),
  'purpose-ideal': txt('d4', '「あの人の発信で動けた」と言われる存在'),
  'purpose-value': txt('d5', '誠実さ・等身大であること'),
  'purpose-who': txt('d6', '独学でつまずく初学者'),
  'purpose-mission': txt('d7', '遠回りを減らす道しるべになる'),
  'purpose-passion': txt('d8', '自分の失敗が誰かの近道になる瞬間'),
  // 目標
  'goal-state': txt('d9', '月1本、反応のある発信を継続できている'),
  'goal-number': txt('d10', 'フォロワー1,000人 / 月間PV 1万'),
  'goal-deadline': txt('d11', '半年後（2026年内）'),
  'goal-milestone': txt('d12', '3ヶ月で記事10本'),
  'goal-criteria': txt('d13', '保存・コメントが付くこと'),
  'goal-priority': txt('d14', '量より「続ける仕組み」を優先'),
  'goal-scope': txt('d15', '扱うのは"学びの過程"だけ（網羅しない）'),
  'goal-reward': txt('d16', '達成したら新しい機材を買う'),
  // 問題
  'problem-gap': txt('d17', 'インプットは多いがアウトプットが続かない', { reason: '完璧を求めて出すのが遅れる' }),
  'problem-blocker': txt('d18', '完璧主義で公開前に止まる'),
  'problem-fail': txt('d19', '下書きのまま放置して消してしまう'),
  'problem-root': txt('d20', '「完璧じゃないと出せない」という思い込み', { reason: '過去に雑な発信で批判された' }),
  'problem-pain': txt('d21', '「で、結局どうすれば」で手が止まる'),
  'problem-risk': txt('d22', '反応ゼロでモチベが切れる'),
  'problem-blind': txt('d23', '自分の"普通"が他人には価値かも、に気づけてない'),
  'problem-assumption': txt('d24', '「ちゃんとした人しか発信できない」は本当？'),
  // 昔
  'past-top': txt('d25', '業界トップは"継続"で抜けている'),
  'past-crossover': txt('d26', '営業×発信の掛け算が効いた人がいる'),
  'past-winpath': txt('d27', '小さく出して反応で磨くのが王道'),
  'past-standard': txt('d28', '一次情報＋一枚図解が定番の型'),
  'past-success': txt('d29', '社内勉強会が好評だった'),
  'past-failure': txt('d30', '凝りすぎて公開を逃した企画'),
  'past-pattern': txt('d31', '最初は伸びず、ある点から伸びる（Jカーブ）'),
  'past-lesson': txt('d32', '出さないと何も始まらない'),
  // 自分
  'self-strength': [{ id: 'd33', text: '現場の試行錯誤を等身大で言語化できる', level: 4, detail: '失敗込みで語れて共感されやすい', created_at: D }],
  'self-weakness': [{ id: 'd34', text: '完璧主義で公開が遅い', level: 3, detail: '8割で出す癖をつける', fix: '下書きを翌朝までに必ず公開', created_at: D }],
  'self-can': [{ id: 'd35', text: '複雑な話を図解1枚に落とす', level: 4, detail: '社内資料で評価された', created_at: D }],
  'self-cant': [{ id: 'd36', text: '動画編集が苦手', type: '任せる', action: '外注 or テンプレ活用', created_at: D }],
  'self-condition': txt('d37', '締切と裁量があると燃える'),
  'self-break': txt('d38', '細かい干渉が多いと止まる'),
  'self-others': [{ id: 'd39', from: '先輩', text: '説明がわかりやすいと言われる', created_at: D }],
  'self-compare': [
    { id: 'd40', label: '図解・言語化力', value: '組織内で上位3人くらい', color: 'success', created_at: D },
    { id: 'd41', label: '発信の継続力', value: '日本の発信者の中では中の下', color: 'warning', created_at: D },
  ],
  // 周り
  'around-team': txt('d42', '後輩2人に声がけできる'),
  'around-ally': txt('d43', '同業の友人（壁打ち相手）'),
  'around-time': txt('d44', '平日夜1時間 / 週末3時間'),
  'around-money': txt('d45', '月5,000円まで'),
  'around-tool': txt('d46', 'Notion / Canva / X'),
  'around-commline': txt('d47', 'X と社内Slack'),
  'around-boss': txt('d48', '「発信は良いこと」と理解がある'),
  'around-structure': txt('d49', '副業OKの会社'),
  // 市場
  'market-customer': txt('d50', '独学でつまずく初学者'),
  'market-competitor': txt('d51', '体系的に教える発信者が多い'),
  'market-trend': txt('d52', '短尺・等身大コンテンツが伸びている'),
  'market-need': txt('d53', '「失敗の過程」を知りたい人が多い'),
  'market-evaluation': txt('d54', '保存数・実践報告で測られる'),
  'market-opportunity': txt('d55', '過程実況の発信者が少ない'),
  'market-threat': txt('d56', 'AIで"きれいな解説"が量産される'),
  'market-gap': txt('d57', '「失敗の過程」を見せる発信が少ない'),
  // 未来
  'future-next': txt('d58', '発信の型をつくって量産できるようにする'),
  'future-experiment': txt('d59', '週1で"失敗実況"を試す'),
  'future-grow': txt('d60', '図解力をさらに伸ばす'),
  'future-fix': txt('d61', '公開までの時間を半分にする'),
  'future-quit': txt('d62', '完璧主義をやめる'),
  'future-delegate': txt('d63', '動画編集は人に任せる'),
  'future-bet': txt('d64', '「等身大の失敗実況」に集中投下'),
  'future-vision': txt('d65', '3年後、初学者の定番の道しるべに'),
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
