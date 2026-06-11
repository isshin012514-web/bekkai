// 「今日の問い」— 内省を30秒で促す回転式の問い
export const DAILY_QUESTIONS = [
  '今日、一番時間を使ったことは何？それは「解くべき問題」だった？',
  '最近うまくいかなかったことは？そこから回避できる失敗は？',
  '自分らしいと感じた瞬間は今日あった？',
  '今、一番伸ばしたい力はどれ？そのために今日できる小さな一歩は？',
  '誰かに「すごい」と言われたことは？それはあなたの強みかも。',
  'もし制約が一切なかったら、何を試す？',
  '今日学んだことを1つ、誰かに伝えるなら何と言う？',
  '先週の自分と比べて、何が変わった？',
  '今ある別解を、もっと「自分らしく」するには？',
  '量をこなして質に変えたい取り組みは何？',
  '今日「めんどくさい」と感じたことの裏に、本当の課題は隠れてない？',
  '尊敬する人ならこの状況をどう判断する？',
  '今週、絶対に前に進めたい1つは？',
  '完璧を待って止まっていることは？8割で出すなら何から？',
  'あなたの「優れている」点を1つ、数字で表すと？',
]

/** 日付に基づいて安定的に1問を選ぶ（同じ日は同じ問い） */
export function todaysQuestion(date: Date = new Date()): { index: number; text: string } {
  const start = new Date(date.getFullYear(), 0, 0)
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86400000)
  const index = dayOfYear % DAILY_QUESTIONS.length
  return { index, text: DAILY_QUESTIONS[index] }
}

export function todayKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

/** ISO日時の配列から「今日（または昨日）で途切れていない連続日数」を返す */
export function currentStreak(isoDates: string[]): number {
  const days = new Set<string>()
  for (const iso of isoDates) {
    const d = new Date(iso)
    if (!isNaN(d.getTime())) days.add(todayKey(d))
  }
  if (days.size === 0) return 0
  const today = new Date()
  const yesterday = new Date(today.getTime() - 86400000)
  // 今日も昨日も記録が無ければストリークは途切れている
  if (!days.has(todayKey(today)) && !days.has(todayKey(yesterday))) return 0
  let streak = 0
  const cursor = new Date(today)
  // 今日に記録が無ければ昨日から数え始める
  if (!days.has(todayKey(cursor))) cursor.setTime(cursor.getTime() - 86400000)
  while (days.has(todayKey(cursor))) {
    streak++
    cursor.setTime(cursor.getTime() - 86400000)
  }
  return streak
}
