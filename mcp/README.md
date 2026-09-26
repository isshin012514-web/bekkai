# bekkai ローカルMCPサーバー（第一歩）

bekkai に記録したデータを、**ローカルだけで** AI（Claude Desktop / Claude Code など MCP 対応クライアント）に読ませるための最小構成です。

- 外部サーバーへの送信なし。サーバーはあなたのPC上で動き、読み込むのはローカルのJSONファイルだけ。
- 追加の npm パッケージなし（Node 18+ の標準機能のみ）。
- **読み取り専用**。データファイルを書き換えることはありません。

---

## しくみ

bekkai のデータはブラウザの localStorage にあり、外部のプログラムからは直接読めません。
そこで「アプリからバックアップJSONを書き出す → MCPサーバーがそれを読む」という形にしています。

```
bekkai（ブラウザ / localStorage）
   │  データ画面 →「バックアップを書き出す」
   ▼
bekkai-backup-YYYY-MM-DD.json  （あなたのPC内）
   │  読み取りのみ
   ▼
mcp/bekkai-mcp.mjs （MCPサーバー / stdio）
   │
   ▼
Claude Desktop・Claude Code など
```

ファイルの更新日時が変わると自動で読み直すので、**再エクスポートするだけで最新データになります**（クライアントの再起動は不要）。

---

## 1. データを書き出す

1. bekkai を開く → 下部ナビの「データ」
2. 「バックアップを書き出す」→ `bekkai-backup-YYYY-MM-DD.json` が保存される
3. そのファイルを次のどこかに置く（置き場所を固定しておくと楽です）

| 置き場所 | 備考 |
| --- | --- |
| `<このリポジトリ>/mcp/data/` | おすすめ。`.gitignore` 済みでコミットされません |
| ダウンロードフォルダ（`~/Downloads`） | 書き出したままでOK |
| デスクトップ（`~/Desktop`） / `~/bekkai` | どちらでも可 |

自動探索の対象は `bekkai*.json` で、**複数あれば最も新しいものを使います**。
別の場所に置きたい場合は `--data <パス>` か環境変数 `BEKKAI_DATA` で明示してください。

---

## 2. MCPクライアントに登録する

### Claude Code（このリポジトリで使う場合）

リポジトリ直下の `.mcp.json` に定義済みです。このディレクトリで `claude` を起動し、初回の確認で承認すれば使えます。

```bash
claude
# /mcp で bekkai-local が connected になっているか確認できます
```

どこからでも使いたい場合（ユーザースコープに登録）:

```bash
claude mcp add bekkai-local --scope user -- node /絶対パス/bekkai/mcp/bekkai-mcp.mjs
```

### Claude Desktop

設定ファイルに次を追記します。

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "bekkai-local": {
      "command": "node",
      "args": ["/絶対パス/bekkai/mcp/bekkai-mcp.mjs"],
      "env": {
        "BEKKAI_DATA": "/絶対パス/bekkai/mcp/data/bekkai-backup-2026-09-20.json"
      }
    }
  }
}
```

- `args` は**絶対パス**で書いてください（Claude Desktop の作業ディレクトリは不定です）。
- `BEKKAI_DATA` は省略可。省略すると上記の自動探索が働きます。
- 保存後、Claude Desktop を再起動 → ツール一覧に `bekkai_*` が出れば成功です。

### 動作確認（クライアントなしで単体テスト）

```bash
printf '%s\n' \
  '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"t","version":"1"}}}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"bekkai_status","arguments":{}}}' \
  | npm run --silent mcp
```

`bekkai_status` の結果に読み込んだファイルのパスと件数が出れば正常です。

---

## 3. 使えるツール

| ツール | 内容 |
| --- | --- |
| `bekkai_status` | 読み込んでいるファイル・書き出し日時・各データの件数。まず最初に呼ぶと確実 |
| `bekkai_summary` | 別解力・成長力・発見力・失敗力・実現力を横断した日本語サマリー（壁打ちの前提用） |
| `bekkai_outputs` | アウトプット一覧（観点別スコア・振り返り・他者コメント込み）。`limit` / `since` / `key_only` / `include_detail` |
| `bekkai_inputs` | インプット一覧と学び。`limit` / `since` / `key_only` |
| `bekkai_bekkais` | 別解（自分らしい×優れた×別の）の評価・理由・アイデア・結論。`limit` / `key_only` |
| `bekkai_discovery` | 発見力（自己分析マンダラ）の記入内容。`key` でマス指定 |
| `bekkai_weekly` | 週ごとのIN/OUT件数・平均自己/他者採点・週次目標の達成状況。`weeks` |
| `bekkai_raw` | 正規化後の生JSON（添付画像のbase64は除外）。`section` / `max_chars` |

### 聞き方の例

- 「bekkai のデータを見て、今の強みと課題を3つずつ挙げて」
- 「直近8週の記録から、続いている習慣と止まっている習慣を教えて」
- 「★重要にした別解について、マイナス面の打ち手を一緒に考えて」
- 「他者評価が自己評価より低い観点を探して、次の一手を提案して」

---

## 注意

- 添付画像（base64）はAIに渡しません（トークン節約のため件数のみ）。
- バックアップJSONは個人データです。`mcp/data/*.json` は `.gitignore` 済みですが、他の場所に置く場合もコミット・共有しないよう注意してください。
- このサーバーは読み取り専用です。AIの提案をアプリに反映するのは手入力になります（書き込み対応は次の一歩）。
