# claude-code-book-chapter8

本リポジトリは技術評論社より発行されている[「実践Claude Code入門 - 現場で活用するためのAIコーディングの思考法」](https://www.amazon.co.jp/dp/4297153548)のサンプルコードを管理するGitHubリポジトリです。

リポジトリ内のコード・プロンプトに関する詳細な解説は、書籍をご覧ください。

書籍の内容に関するご質問、不備のご指摘については以下のリポジトリのイシューよりお願いいたします。

https://github.com/GenerativeAgents/claude-code-book

## 注意事項

本リポジトリの内容は読者からのフィードバックを受けて、より性能の良いプロンプトに変更されることがあります。差分は随時書籍に反映されますが、お手元の版との差分があることをご承知おきください。

## 使い方

### 1. リポジトリのクローン

```bash
git clone [このリポジトリ] claude-code-book-chapter8
cd claude-code-book-chapter8
```

### 2. Dev Container経由で開く

Visual Studio Codeで「Reopen in Container」を選択すると、自動的に次のように環境構築が行われます。

- Node.js LTS環境の構築
- npm installの実行
- Claude Codeの最新版インストール

※ Dev Containerを利用する際は、事前にDockerのインストールが必要です。

## コマンドリファレンス

### `task config` コマンド

ユーザープロフィールや設定を管理するためのコマンドです。

#### 設定値の保存

```bash
task config set <key> <value>
```

**使用例:**
```bash
task config set user.name "田中太郎"
task config set user.email "tanaka@example.com"
task config set user.github "tanaka-taro"
task config set defaults.priority high
task config set defaults.sort created
```

**設定可能なキー:**
- `user.name`: ユーザー名
- `user.email`: メールアドレス（形式チェックあり）
- `user.github`: GitHubユーザー名
- `defaults.priority`: デフォルトの優先度（`low`, `medium`, `high`, `critical`）
- `defaults.sort`: デフォルトのソート順（`created`, `updated`, `priority`, `due`）

#### 設定値の取得

```bash
task config get <key>
```

**使用例:**
```bash
task config get user.name
# 出力: 田中太郎
```

#### 設定一覧の表示

```bash
task config list
```

**使用例:**
```bash
task config list
```

**出力例:**
```
設定一覧:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ユーザー設定:
  user.name:    田中太郎
  user.email:   tanaka@example.com
  user.github:  tanaka-taro

デフォルト設定:
  defaults.priority: high
  defaults.sort:     created
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**設定ファイル:**
設定は `.task/config.json` に JSON 形式で保存されます。
