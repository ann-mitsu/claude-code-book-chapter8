# 技術仕様書 (Architecture Design Document)

## テクノロジースタック

### 言語・ランタイム

| 技術 | バージョン |
|------|-----------|
| Node.js | v24.11.0 (LTS) |
| TypeScript | 5.x |
| npm | 11.x |

**選定理由**:

**Node.js v24.11.0 (LTS)**:
- 2026年4月までの長期サポート保証により、本番環境での安定稼働が期待できる
- 非同期I/O処理に優れ、ファイル操作とGit操作の並行実行が可能
- npmエコシステムが充実しており、CLI開発に必要なライブラリが豊富
- クロスプラットフォーム対応(macOS、Linux、Windows)が標準

**TypeScript 5.x**:
- 静的型付けによりコンパイル時にバグを検出でき、保守性が向上
- IDEの補完機能が強力で、開発効率が高い(特にVSCode)
- チーム開発における型定義の共有により、コードの可読性と品質が担保される
- JSONスキーマとの統合により、データモデルの型安全性を確保

**npm 11.x**:
- Node.js v24.11.0に標準搭載されており、別途インストール不要
- package-lock.jsonによる依存関係の厳密な管理が可能
- セキュリティ監査機能(npm audit)でパッケージの脆弱性を検出

### フレームワーク・ライブラリ

| 技術 | バージョン | 用途 | 選定理由 |
|------|-----------|------|----------|
| Commander.js | ^12.0.0 | CLIフレームワーク | シンプルで学習コストが低い、Gitコマンド風のインターフェースを実現しやすい、豊富な実績 |
| simple-git | ^3.25.0 | Git操作 | Promise対応で非同期処理が容易、APIが直感的、TypeScript型定義が完備 |
| chalk | ^5.3.0 | ターミナル色付け | 軽量で高速、色付けAPIがシンプル、クロスプラットフォーム対応 |
| cli-table3 | ^0.6.5 | 表形式表示 | 柔軟なテーブルレイアウト、Unicode対応、カスタマイズ性が高い |
| inquirer | ^9.2.0 | 対話型プロンプト | 確認プロンプト、選択肢、入力補完をサポート、ユーザビリティが高い |
| date-fns | ^3.0.0 | 日時処理 | 軽量(moment.jsの代替)、Tree-shakable、イミュータブルなAPI |

**P1以降で追加予定**:
| 技術 | バージョン | 用途 | 選定理由 |
|------|-----------|------|----------|
| Octokit | ^3.1.0 | GitHub API | GitHub公式ライブラリ、REST API v3対応、型定義完備 |

### 開発ツール

| 技術 | バージョン | 用途 | 選定理由 |
|------|-----------|------|----------|
| Jest | ^29.7.0 | テストフレームワーク | TypeScript対応、モック機能が充実、カバレッジレポート標準装備 |
| ESLint | ^9.0.0 | リンター | TypeScript対応、カスタムルール作成可能、コード品質の自動チェック |
| Prettier | ^3.2.0 | フォーマッター | コードスタイルの統一、ESLintと連携可能 |
| ts-node | ^10.9.0 | TypeScript実行 | 開発時のTypeScript直接実行、デバッグが容易 |
| nodemon | ^3.0.0 | ホットリロード | ファイル変更を検知して自動再実行、開発効率向上 |

## アーキテクチャパターン

### レイヤードアーキテクチャ

```
┌─────────────────────────┐
│   CLIレイヤー            │ ← ユーザー入力の受付、バリデーション、結果の表示
│   (Commander.js)         │    (CLI, CommandHandlers)
├─────────────────────────┤
│   サービスレイヤー        │ ← ビジネスロジック、タスク操作、Git操作
│   (Business Logic)       │    (TaskService, GitService)
├─────────────────────────┤
│   データレイヤー          │ ← データ永続化、ファイルI/O
│   (Storage)              │    (StorageService)
└─────────────────────────┘
```

#### CLIレイヤー

**責務**:
- ユーザー入力の受付(Commanderによるコマンドパース)
- 入力バリデーション(必須項目、型チェック)
- サービスレイヤーの呼び出し
- 結果の表示(表形式、色付け、エラーメッセージ)
- 対話型プロンプト(確認、選択)

**許可される操作**:
- サービスレイヤー(TaskService、GitService)の呼び出し
- 標準出力への表示(console.log、chalk)
- ユーザー入力の受付(inquirer)

**禁止される操作**:
- データレイヤーへの直接アクセス
- ビジネスロジックの実装
- ファイルI/O

**主要コンポーネント**:
- `CLI`: Commanderプログラムの初期化、コマンド登録
- `CommandHandlers`: 各コマンドの実装(add、list、start、done等)
- `Formatter`: 結果の整形(表形式、色付け)

#### サービスレイヤー

**責務**:
- ビジネスロジックの実装(タスクのCRUD、ステータス管理)
- データ変換(入力データ → タスクオブジェクト)
- バリデーション(タイトル、期限の妥当性チェック)
- Git操作(ブランチ作成、切り替え、ステータス確認)

**許可される操作**:
- データレイヤー(StorageService)の呼び出し
- simple-gitによるGit操作
- ビジネスロジックの実装

**禁止される操作**:
- CLIレイヤーへの依存(console.log等)
- 直接的なファイルI/O(StorageServiceを経由)

**主要コンポーネント**:
- `TaskService`: タスクのCRUD操作、ビジネスロジック
- `GitService`: Git操作、ブランチ名生成

#### データレイヤー

**責務**:
- データの永続化(JSON → ファイル)
- データの読み込み(ファイル → JSON)
- データの初期化(初回実行時)
- データ整合性の検証

**許可される操作**:
- ファイルシステムへのアクセス(fs/promises)
- JSONのパース・シリアライズ

**禁止される操作**:
- ビジネスロジックの実装
- UI表示

**主要コンポーネント**:
- `StorageService`: JSONファイルの読み書き、初期化

### 依存関係の方向

```
CLI → TaskService → StorageService ✅
CLI → GitService                   ✅
TaskService ← CLI                  ❌
StorageService ← TaskService       ❌
```

**原則**: 依存関係は一方向。上位レイヤーから下位レイヤーへのみ。

## データ永続化戦略

### ストレージ方式

| データ種別 | ストレージ | フォーマット | 理由 |
|-----------|----------|-------------|------|
| タスクデータ | ローカルファイル | JSON | シンプル、Gitで管理可能、特別なソフトウェア不要、人間が読める |
| 設定データ(P1以降) | ローカルファイル | JSON | タスクデータと同様の理由 |
| バックアップ(将来) | ローカルファイル | JSON | タスクデータのコピー、復元が容易 |

### ファイル構造

```
.task/
├── tasks.json      # タスクデータ
├── config.json     # 設定(P1以降)
└── backups/        # バックアップ(将来実装)
    ├── tasks.json.20250110_100000.bak
    ├── tasks.json.20250110_110000.bak
    └── tasks.json.20250110_120000.bak
```

### データ形式

**tasks.json**:
```json
{
  "tasks": [
    {
      "id": 1,
      "title": "タスク名",
      "description": "説明",
      "status": "in_progress",
      "priority": "medium",
      "due": "2025-01-20",
      "branch": "feature/task-1-slug",
      "createdAt": "2025-01-10T10:00:00.000Z",
      "updatedAt": "2025-01-10T11:30:00.000Z"
    }
  ],
  "nextId": 2
}
```

### バックアップ戦略(将来実装)

- **頻度**: タスク作成・更新・削除時に自動
- **保存先**: `.task/backups/`ディレクトリ
- **命名規則**: `tasks.json.YYYYMMDD_HHMMSS.bak`
- **世代管理**: 最新5世代を保持、古いものは自動削除
- **復元方法**:
  1. `.task/tasks.json`を削除またはリネーム
  2. `.task/backups/`から最新のバックアップをコピー
  3. `tasks.json`にリネーム

### データ整合性の保証

**書き込み戦略**:
1. メモリ内でデータを更新
2. 一時ファイル(`.task/tasks.json.tmp`)に書き込み
3. 書き込み成功後、元のファイルとアトミックに置き換え
4. 失敗時はロールバック(元のファイルを保持)

**読み込み時の検証**:
1. JSONパースエラーをキャッチ
2. スキーマ検証(tasks配列、nextIdの存在確認)
3. 破損時は最新のバックアップから復元(バックアップがある場合)

## パフォーマンス要件

### レスポンスタイム

| 操作 | 目標時間 | 測定環境 | 測定方法 |
|------|---------|---------|---------|
| コマンド起動 | 100ms以内 | CPU: Core i5相当、メモリ: 8GB、SSD | CLI起動からプロンプト表示まで |
| タスク作成 | 50ms以内 | 同上 | コマンド実行から完了メッセージまで |
| タスク一覧表示(100件) | 100ms以内 | 同上 | データ読み込みから表示完了まで |
| タスク一覧表示(1000件) | 1秒以内 | 同上 | データ読み込みから表示完了まで |
| Git操作(ブランチ作成) | 500ms以内 | 同上、Git 2.30以上 | task start実行からブランチ切り替えまで |
| 検索(1000件) | 500ms以内 | 同上 | キーワード入力から結果表示まで |

### リソース使用量

| リソース | 上限 | 理由 |
|---------|------|------|
| メモリ | 50MB | CLIツールとして軽量性を重視、大規模データは想定しない |
| CPU | 20% | バックグラウンド実行を想定していないため、高負荷は許容しない |
| ディスク | 100MB | タスクデータ(10,000件で約10MB)、バックアップ(5世代で約50MB)、ログ等 |

### スケーラビリティ目標

| データ量 | 目標レスポンス | 対策 |
|---------|-------------|------|
| 100件 | 100ms | 最適化不要 |
| 1,000件 | 1秒 | インメモリ処理で十分 |
| 10,000件 | 10秒 | アーカイブ機能、SQLite移行検討 |
| 100,000件+ | 対応外 | 警告メッセージ、代替ツールを推奨 |

## セキュリティアーキテクチャ

### データ保護

**ファイルパーミッション**:
```bash
# .task/ディレクトリ: 所有者のみ読み書き実行
chmod 700 ~/.task/

# tasks.json: 所有者のみ読み書き
chmod 600 ~/.task/tasks.json
```

**機密情報管理**:
- GitHub Personal Access Token(P1以降): 環境変数`TASKCLI_GITHUB_TOKEN`に保存
- 平文保存禁止: 認証情報をJSONファイルに保存しない
- キーチェーン連携(将来): macOSのKeychainやWindowsのCredential Managerを利用

### 入力検証

**バリデーション項目**:
- タイトル: 1-200文字、必須
- 期限: ISO 8601形式の日付、オプション
- 優先度: low/medium/high/criticalのいずれか、オプション
- ステータス: open/in_progress/completed/archivedのいずれか、オプション

**実装例**:
```typescript
function validateTitle(title: string): void {
  if (!title || title.trim().length === 0) {
    throw new ValidationError('タイトルは必須です');
  }
  if (title.length > 200) {
    throw new ValidationError('タイトルは200文字以内で入力してください');
  }
}

function validateDueDate(due: string): void {
  const date = new Date(due);
  if (isNaN(date.getTime())) {
    throw new ValidationError('期限はYYYY-MM-DD形式で入力してください');
  }
}
```

**エラーハンドリング**:
- エラーメッセージにスタックトレースを含めない(本番環境)
- エラー内容は具体的だが、システム内部情報は露出しない
- 例: "データファイルが破損しています" (OK)
- 例: "JSON parse error at line 42: unexpected token" (NG - 詳細すぎる)

### コマンドインジェクション対策

**Git操作**:
- simple-gitライブラリを使用(直接的なシェル実行を避ける)
- ブランチ名のサニタイゼーション(英数字とハイフンのみ許可)

**ファイルパス**:
- ファイルパスは固定(`.task/tasks.json`)
- ユーザー入力をファイルパスに含めない

## スケーラビリティ設計

### データ増加への対応

**想定データ量**: 10,000件のタスク

**パフォーマンス劣化対策**:
1. **インメモリ処理**: タスク数が10,000件以下の場合はJSONファイル全体を読み込み
2. **フィルタリング最適化**: 早期リターン、不要なフィールドの除外
3. **ソート最適化**: JavaScript組み込みのArray.sort()を使用
4. **表示制限**: デフォルトで最新100件のみ表示、`--limit`オプションで上限変更

**アーカイブ戦略**:
- 完了から30日以上経過したタスクを自動アーカイブ(オプション機能)
- アーカイブファイル: `.task/archive/tasks-YYYY.json`(年ごとに分割)
- アーカイブ済みタスクは`task list --all --archived`で表示

**SQLite移行(10,000件超)**:
- タスク数が10,000件を超えた場合、SQLiteへの移行を推奨
- 移行スクリプト: `task migrate --to-sqlite`
- JSONファイルからのインポート機能を提供

### 機能拡張性

**プラグインシステム(P2以降)**:
```
.task/plugins/
├── custom-commands/
│   └── my-command.js
└── hooks/
    └── pre-add.js
```

**設定のカスタマイズ**:
- `.task/config.json`でカスタマイズ可能な項目:
  - デフォルト優先度
  - デフォルトソート順
  - 表示件数
  - 色設定

**API拡張性**:
- TaskServiceとGitServiceをライブラリとして公開(将来)
- 他のCLIツールからインポート可能

## テスト戦略

### ユニットテスト

**フレームワーク**: Jest ^29.7.0

**対象**:
- TaskService: タスクのCRUD操作、ビジネスロジック
- GitService: ブランチ名生成、Git操作(モック)
- StorageService: データの読み書き、バリデーション(モック)

**カバレッジ目標**: 80%以上

**モック戦略**:
- StorageService: ファイルI/Oをモック(jest.mock('fs/promises'))
- simple-git: Git操作をモック(jest.mock('simple-git'))

**テスト例**:
```typescript
describe('TaskService', () => {
  it('should create a task with default values', () => {
    const service = new TaskService(mockStorage);
    const task = service.createTask({ title: 'Test' });

    expect(task.id).toBe(1);
    expect(task.status).toBe('open');
    expect(task.priority).toBe('medium');
  });

  it('should validate title length', () => {
    const service = new TaskService(mockStorage);
    const longTitle = 'a'.repeat(201);

    expect(() => {
      service.createTask({ title: longTitle });
    }).toThrow(ValidationError);
  });
});
```

### 統合テスト

**方法**: 実際のファイルシステムとGitリポジトリを使用

**対象**:
- タスク作成 → 保存 → 読み込み → 更新 → 削除のフロー
- Git操作: ブランチ作成、切り替え、ステータス確認

**テスト環境**:
- 一時ディレクトリ(`/tmp/taskcli-test-xxxxx`)を作成
- テスト後に自動削除

### E2Eテスト

**ツール**: Jest + child_process.exec

**シナリオ**:
1. **基本フロー**:
   ```bash
   task add "Test task"
   task list
   task start 1
   task done 1
   task list
   ```

2. **Gitブランチ連携**:
   ```bash
   git init
   task add "Feature"
   task start 1
   git branch  # feature/task-1-feature が存在
   ```

3. **エラーケース**:
   ```bash
   task show 999  # 存在しないID
   task add ""    # 空のタイトル
   ```

**CI/CD統合**:
- GitHub Actionsでテスト自動実行
- macOS、Linux、Windowsの3環境でテスト

## 技術的制約

### 環境要件

**対応OS**:
- macOS 11.0以上
- Ubuntu 20.04以上(およびDebian系Linux)
- Windows 10以上(Git Bash必須)

**最小スペック**:
- CPU: 1GHz以上
- メモリ: 2GB以上(推奨: 8GB)
- ディスク: 100MB以上の空き容量
- Git: 2.30以上
- Node.js: 18以上(推奨: 24 LTS)

**必要な外部依存**:
- Git(ブランチ連携機能を使用する場合)
- GitHub CLI(P1以降、GitHub連携を使用する場合)

### パフォーマンス制約

**制約事項**:
- タスク数10,000件以上では動作が遅くなる可能性
- 大規模リポジトリ(1GB以上)ではGit操作が3秒以上かかる可能性
- ネットワーク遅延によりGitHub API操作が遅延する可能性(P1以降)

**対策**:
- 警告メッセージを表示("タスク数が多いため、動作が遅くなる可能性があります")
- アーカイブ機能を推奨
- キャッシュ機構の導入(将来)

### セキュリティ制約

**制約事項**:
- ファイルパーミッションの設定はUNIX系OSのみ(Windowsは未対応)
- GitHub Tokenの暗号化保存は未実装(環境変数に平文保存)

**対策**:
- Windowsでは警告メッセージを表示
- 将来的にキーチェーン連携を実装

## 依存関係管理

### 主要ライブラリ

| ライブラリ | 用途 | バージョン管理方針 | 理由 |
|-----------|------|-------------------|------|
| commander | CLIフレームワーク | ^12.0.0 | マイナーバージョンアップは互換性あり |
| simple-git | Git操作 | ^3.25.0 | マイナーバージョンアップは互換性あり |
| chalk | 色付け | 5.3.0 | v6でESM onlyになるため固定 |
| cli-table3 | 表形式表示 | ^0.6.5 | マイナーバージョンアップは互換性あり |
| inquirer | 対話型プロンプト | ^9.2.0 | マイナーバージョンアップは互換性あり |
| date-fns | 日時処理 | ^3.0.0 | マイナーバージョンアップは互換性あり |

### 開発依存関係

| ライブラリ | 用途 | バージョン管理方針 | 理由 |
|-----------|------|-------------------|------|
| typescript | TypeScript | ~5.3.0 | パッチバージョンのみ自動更新 |
| jest | テスト | ^29.7.0 | マイナーバージョンアップは互換性あり |
| eslint | リンター | ^9.0.0 | マイナーバージョンアップは互換性あり |
| prettier | フォーマッター | ^3.2.0 | マイナーバージョンアップは互換性あり |

### セキュリティ監査

**方針**:
- `npm audit`を週次で実行(GitHub Actions)
- 脆弱性が発見された場合は即座に対応
- Critical/Highの脆弱性は24時間以内にパッチ適用
- Medium以下は1週間以内に対応

**Dependabot設定**:
- GitHub Dependabotを有効化
- セキュリティパッチは自動でPR作成
- メジャーバージョンアップは手動レビュー

### バージョン固定方針

**固定すべきケース**:
- 破壊的変更のリスクがある(例: chalk v5 → v6)
- APIが大きく変更される可能性がある

**自動更新を許可するケース**:
- パッチバージョンのみの更新(~)
- マイナーバージョンまでの更新(^)で、semverに従っている

## デプロイメント戦略

### 配布方法

**npm公開**:
- パッケージ名: `@username/taskcli`
- レジストリ: npmjs.com
- グローバルインストール: `npm install -g @username/taskcli`

**バイナリ配布(将来)**:
- pkg等でバイナリ化
- GitHub Releasesで配布

### CI/CD

**GitHub Actions**:
```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
        node: [18, 20, 24]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
      - run: npm ci
      - run: npm test
      - run: npm run lint
```

**リリースフロー**:
1. バージョン番号を更新(`npm version patch/minor/major`)
2. CHANGELOG.mdを更新
3. mainブランチにマージ
4. GitHub Actionsで自動テスト
5. テスト成功後、npm publishを実行
6. GitHub Releaseを作成

---

**最終更新日**: 2025-01-03
**バージョン**: 1.0
**作成者**: Claude Code
