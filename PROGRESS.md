# bekkai 進捗メモ

最終更新: 2026-05-30

---

## アプリ概要

**bekkai** — 個人の成長を記録・振り返るPWAアプリ  
URL: https://bekkai.vercel.app  
技術スタック: React + TypeScript + Vite + Zustand + Tailwind CSS  
デプロイ: Vercel（自動CI/CDなし、手動 `npx vercel --prod`）

---

## 現在実装済みの機能

### ホーム画面
- 週次サマリー（IN件数 / OUT件数 / 自己採点 / 他者採点）
- 週間目標表示（チェックで削除アニメーション付き）
- アクションボタン（インプット記録 → アウトプット記録 → 自己採点 → 採点依頼 → FB入力）
  - 採点依頼ボタン: 未採点のアウトプットが0件のとき無効化
- 成長サイクル表示（INPUT→OUTPUT→採点→次の打手）

### 記録セクション（統合済み）
- IN / OUT / すべて / ★重要 のタブ切り替え
- アウトプット: 展開すると「詳細 / 自己採点 / FB」タブで切り替え
  - FBタブ: 自己vs他者のレーダーチャート表示
- インプット: 展開で詳細表示、IN→OUTボタン付き
- 各記録の削除（2ステップ確認 + トースト通知）
- 重要フラグ（★）

### 週次レポートモーダル
- **週ナビゲーション（← 週 →）**: 過去の週を遡って振り返れる
- 励ましメッセージ（成績に応じて自動生成）
- 成績カード（アウトプット / インプット / 自己採点 / 他者採点）
- IN/OUTバランスバー
- 選択週 vs 前週 比較バー
- **自己 vs 他者 平均比較**（FBがある週のみ表示）
- 観点別レーダーチャート（週平均）
- アウトプット別スコアバー
- 今週の目標管理（追加・完了チェック・削除）

### その他
- ロールモデル管理
- 会いたい人リスト（質問メモ付き）
- データエクスポート / インポート（JSON）

---

## データ保存方式

**localStorage**（キー: `bekkai-growth-store`）

- ブラウザ / デバイスごとに独立して保存
- 他人と共有してもデータは混ざらない
- 同一人物が別デバイスで使う場合はエクスポート/インポートで手動移行

---

## 保留中: スマホアプリ化（App Store / Google Play配布）

### 現状
- Capacitorインストール済み（`@capacitor/core`, `@capacitor/ios`, `@capacitor/android`）
- Androidプロジェクト生成済み（`/android/`）
- iOSプロジェクトは生成済み（`/ios/`）だが pod install 未完了（Xcode待ち）

### 必要なコスト
| 項目 | 費用 |
|------|------|
| Apple Developer Program | $99 / 年（約¥14,000） |
| Google Play Console | $25 一回（約¥3,500） |
| Xcode | 無料（Mac App Store） |
| Android Studio | 無料 |

### 次のアクションプラン（準備できたら実行）

#### STEP 1: Xcodeインストール（Mac App Storeから）
- 約7GB、30分〜1時間
- インストール後、初回起動して追加ツールのインストールを完了させる

#### STEP 2: iOSプロジェクトをXcodeで開く
```bash
cd /Users/issin/クロード/bekkai
npm run cap:ios
# → Xcodeが自動で開く
```

#### STEP 3: Apple Developer登録
- https://developer.apple.com/programs/
- 登録後、XcodeにApple IDを追加（Xcode → Settings → Accounts）

#### STEP 4: Xcodeでビルド設定
- Bundle Identifier: `com.bekkai.app`（他アプリと被る場合は変更）
- Team: 登録したApple Developerアカウントを選択
- 実機テスト → App Store Connect提出

#### STEP 5: Android（別途）
- Android Studio インストール: https://developer.android.com/studio
- Google Play Console登録: https://play.google.com/console
```bash
npm run cap:android
# → Android Studioが自動で開く
```

#### STEP 6: アプリ更新時の手順（毎回）
```bash
npm run cap:sync   # ビルド + iOS/Android両方に同期
# または個別に
npm run cap:ios    # iOS用
npm run cap:android # Android用
```

---

## 将来的な検討事項

- **マルチデバイス同期**: Supabase等のバックエンド導入が必要
- **複数人での利用**: ユーザー認証（Auth）の追加
- **プッシュ通知**: `@capacitor/push-notifications` で実装可能

---

## 次に実装すべき機能（優先度高）

### 「次の打ち手（翌週アクションプラン）」機能

詳細仕様: `specs/next-action-plan.md`

#### 概要
成長サイクルの最後のピースとして、フィードバック後に「翌週の行動計画」を作れる機能。
振り返りで終わらせず、来週どう動くかまでアプリ内で設計できるようにする。

#### 主な要素
- **改善テーマ**: 今週の反省から1つのテーマを設定（例: 商談の質問力）
- **翌週目標**: 行動レベルで1〜3件（達成可否が明確なもの）
- **IF-THENルール**: 実行ハードルを下げる行動トリガー（複数登録可）
- **AI支援**: フィードバック内容から目標・IF-THENを自動提案

#### 成長サイクルの完成形
```
INPUT → OUTPUT → 採点 → フィードバック → 次の打ち手 → INPUTへ戻る
```

#### データ構造（Zustandストアに追加）
```ts
growthActionPlan: {
  theme: string
  goals: string[]
  ifThenRules: { if: string; then: string }[]
  createdAt: string
}
```

#### UX方針
ADHD傾向のユーザーでも実行しやすいよう、目標は小さく具体的に。
IF-THENルールで「やる気に依存しない」行動設計を実現する。
