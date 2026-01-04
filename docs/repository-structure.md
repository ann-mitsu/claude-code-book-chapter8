# リポジトリ構造定義書 (Repository Structure Document)

## プロジェクト構造

```
taskcli/
├── src/                      # ソースコード
│   ├── cli/                  # CLIレイヤー
│   ├── services/             # サービスレイヤー
│   ├── storage/              # データレイヤー
│   ├── types/                # 型定義
│   ├── errors/               # エラークラス
│   └── index.ts              # エントリーポイント
├── tests/                    # テストコード
│   ├── unit/                 # ユニットテスト
│   ├── integration/          # 統合テスト
│   └── e2e/                  # E2Eテスト
├── docs/                     # プロジェクトドキュメント
│   ├── ideas/                # アイデア・壁打ちメモ
│   ├── product-requirements.md
│   ├── functional-design.md
│   ├── architecture.md
│   ├── repository-structure.md (本ドキュメント)
│   ├── development-guidelines.md
│   └── glossary.md
├── .steering/                # 作業単位のドキュメント
│   └── [YYYYMMDD]-[task-name]/
│       ├── requirements.md
│       ├── design.md
│       └── tasklist.md
├── .github/                  # GitHub設定
│   └── workflows/            # GitHub Actions
│       └── test.yml
├── dist/                     # ビルド成果物(gitignore)
├── node_modules/             # 依存パッケージ(gitignore)
├── package.json              # npm設定
├── tsconfig.json             # TypeScript設定
├── jest.config.js            # Jest設定
├── .eslintrc.js              # ESLint設定
├── .prettierrc               # Prettier設定
├── .gitignore                # Git除外設定
└── README.md                 # プロジェクト概要
```

## ディレクトリ詳細

### src/ (ソースコードディレクトリ)

#### src/cli/

**役割**: CLIレイヤー - ユーザー入力の受付、バリデーション、結果の表示

**配置ファイル**:
- `CLI.ts`: Commander.jsプログラムの初期化、コマンド登録
- `commands/`: 各コマンドのハンドラー実装
- `formatters/`: 出力の整形(表形式、色付け)
- `prompts/`: 対話型プロンプト(確認、選択)

**命名規則**:
- クラスファイル: PascalCase (例: `CLI.ts`, `TaskFormatter.ts`)
- コマンドハンドラー: camelCase + "Handler"接尾辞 (例: `addTaskHandler.ts`)

**依存関係**:
- 依存可能: `services/`, `types/`, `errors/`
- 依存禁止: `storage/`(サービスレイヤーを経由)

**例**:
```
src/cli/
├── CLI.ts                    # CLIメインクラス
├── commands/
│   ├── addTaskHandler.ts     # task add コマンド
│   ├── listTasksHandler.ts   # task list コマンド
│   ├── showTaskHandler.ts    # task show コマンド
│   ├── startTaskHandler.ts   # task start コマンド
│   ├── doneTaskHandler.ts    # task done コマンド
│   └── deleteTaskHandler.ts  # task delete コマンド
├── formatters/
│   ├── TaskFormatter.ts      # タスク表示の整形
│   └── TableFormatter.ts     # 表形式の整形
└── prompts/
    └── ConfirmPrompt.ts      # 確認プロンプト
```

#### src/services/

**役割**: サービスレイヤー - ビジネスロジック、タスク操作、Git操作

**配置ファイル**:
- `TaskService.ts`: タスクのCRUD操作、ビジネスロジック
- `GitService.ts`: Git操作、ブランチ名生成

**命名規則**:
- クラスファイル: PascalCase + "Service"接尾辞 (例: `TaskService.ts`)

**依存関係**:
- 依存可能: `storage/`, `types/`, `errors/`
- 依存禁止: `cli/`(上位レイヤー)

**例**:
```
src/services/
├── TaskService.ts            # タスク管理サービス
└── GitService.ts             # Git操作サービス
```

#### src/storage/

**役割**: データレイヤー - データの永続化、ファイルI/O

**配置ファイル**:
- `StorageService.ts`: JSONファイルの読み書き、初期化

**命名規則**:
- クラスファイル: PascalCase + "Service"接尾辞 (例: `StorageService.ts`)

**依存関係**:
- 依存可能: `types/`, `errors/`
- 依存禁止: `cli/`, `services/`(上位レイヤー)

**例**:
```
src/storage/
└── StorageService.ts         # ストレージサービス
```

#### src/types/

**役割**: 型定義 - プロジェクト全体で使用する型・インターフェース

**配置ファイル**:
- `Task.ts`: タスク関連の型定義
- `Command.ts`: コマンド関連の型定義
- `Storage.ts`: ストレージ関連の型定義

**命名規則**:
- インターフェース定義: PascalCase (例: `Task.ts`)
- 型エイリアス定義: PascalCase (例: `TaskStatus.ts`)

**依存関係**:
- 依存可能: なし(完全に独立)
- 依存禁止: すべて(型定義は他に依存しない)

**例**:
```
src/types/
├── Task.ts                   # タスク型定義
├── Command.ts                # コマンド型定義
└── Storage.ts                # ストレージ型定義
```

**Task.ts の例**:
```typescript
export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  due?: string;
  branch?: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'open' | 'in_progress' | 'completed' | 'archived';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface TaskData {
  tasks: Task[];
  nextId: number;
}
```

#### src/errors/

**役割**: エラークラス - カスタムエラーの定義

**配置ファイル**:
- `TaskError.ts`: ベースエラークラス
- `ValidationError.ts`: 入力検証エラー
- `NotFoundError.ts`: タスクが見つからないエラー
- `StorageError.ts`: ストレージエラー
- `GitError.ts`: Git操作エラー

**命名規則**:
- エラークラス: PascalCase + "Error"接尾辞 (例: `ValidationError.ts`)

**依存関係**:
- 依存可能: なし(完全に独立)
- 依存禁止: すべて

**例**:
```
src/errors/
├── TaskError.ts              # ベースエラークラス
├── ValidationError.ts        # 入力検証エラー
├── NotFoundError.ts          # タスク未発見エラー
├── StorageError.ts           # ストレージエラー
└── GitError.ts               # Git操作エラー
```

**TaskError.ts の例**:
```typescript
export class TaskError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'TaskError';
  }
}
```

#### src/index.ts

**役割**: エントリーポイント - CLIアプリケーションの起動

**内容**:
- CLI クラスのインスタンス化
- コマンドライン引数の処理
- エラーハンドリング

**例**:
```typescript
#!/usr/bin/env node
import { CLI } from './cli/CLI';

async function main() {
  try {
    const cli = new CLI();
    await cli.run(process.argv);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

main();
```

### tests/ (テストディレクトリ)

#### tests/unit/

**役割**: ユニットテストの配置 - 単一のクラス・関数のテスト

**構造**:
```
tests/unit/
└── src/                      # srcディレクトリと同じ構造
    ├── services/
    │   ├── TaskService.test.ts
    │   └── GitService.test.ts
    ├── storage/
    │   └── StorageService.test.ts
    └── cli/
        └── formatters/
            └── TaskFormatter.test.ts
```

**命名規則**:
- パターン: `[テスト対象ファイル名].test.ts`
- 例: `TaskService.ts` → `TaskService.test.ts`

**テスト対象**:
- TaskService: タスクCRUD操作、バリデーション
- GitService: ブランチ名生成、Git操作(モック)
- StorageService: データ読み書き(モック)
- Formatter: 表示整形

**モック戦略**:
- `fs/promises`: ファイルI/Oをモック
- `simple-git`: Git操作をモック

#### tests/integration/

**役割**: 統合テストの配置 - 複数のコンポーネントの連携テスト

**構造**:
```
tests/integration/
├── task-crud/
│   └── task-lifecycle.test.ts
├── git-integration/
│   └── branch-operations.test.ts
└── storage/
    └── file-operations.test.ts
```

**命名規則**:
- パターン: `[テストシナリオ].test.ts`
- 例: `task-lifecycle.test.ts`

**テストシナリオ**:
- タスクライフサイクル: 作成 → 開始 → 完了 → 削除
- Git連携: ブランチ作成 → 切り替え → ステータス確認
- ストレージ: 読み込み → 更新 → 保存

#### tests/e2e/

**役割**: E2Eテストの配置 - 実際のCLIコマンド実行テスト

**構造**:
```
tests/e2e/
├── basic-workflow/
│   └── user-workflow.test.ts
├── git-workflow/
│   └── git-integration.test.ts
└── error-handling/
    └── error-cases.test.ts
```

**命名規則**:
- パターン: `[ユーザーシナリオ].test.ts`
- 例: `user-workflow.test.ts`

**テストシナリオ**:
- 基本ワークフロー: `task add` → `task list` → `task done`
- Gitワークフロー: `task start` → Gitブランチ確認 → `task done`
- エラーハンドリング: 存在しないID、空のタイトル等

### docs/ (ドキュメントディレクトリ)

#### docs/ideas/

**役割**: アイデア・壁打ちメモの保存

**配置ファイル**:
- 自由形式のマークダウンファイル
- プロダクト開発前のブレインストーミング成果物

**例**:
```
docs/ideas/
└── initial-requirements.md   # 初期要求仕様(壁打ち成果物)
```

#### docs/(正式版ドキュメント)

**配置ドキュメント**:
- `product-requirements.md`: プロダクト要求定義書
- `functional-design.md`: 機能設計書
- `architecture.md`: アーキテクチャ設計書
- `repository-structure.md`: リポジトリ構造定義書(本ドキュメント)
- `development-guidelines.md`: 開発ガイドライン
- `glossary.md`: 用語集

### .steering/ (ステアリングファイル)

**役割**: 特定の開発作業における「今回何をするか」を定義

**構造**:
```
.steering/
└── [YYYYMMDD]-[task-name]/
    ├── requirements.md       # 今回の作業の要求内容
    ├── design.md             # 変更内容の設計
    └── tasklist.md           # タスクリスト
```

**命名規則**: `20250115-add-user-profile` 形式

**例**:
```
.steering/
├── 20250110-mvp-implementation/
│   ├── requirements.md
│   ├── design.md
│   └── tasklist.md
└── 20250120-github-integration/
    ├── requirements.md
    ├── design.md
    └── tasklist.md
```

**注**: `.steering/`ディレクトリは`.gitignore`に含めるべきか検討(プロジェクトの方針次第)

### .github/ (GitHub設定)

**役割**: GitHub固有の設定ファイル

**配置ファイル**:
- `workflows/test.yml`: CI/CDパイプライン(テスト自動実行)
- `ISSUE_TEMPLATE/`: Issueテンプレート(将来)
- `PULL_REQUEST_TEMPLATE.md`: PRテンプレート(将来)

**例**:
```
.github/
└── workflows/
    └── test.yml              # GitHub Actions設定
```

## ファイル配置規則

### ソースファイル

| ファイル種別 | 配置先 | 命名規則 | 例 |
|------------|--------|---------|-----|
| CLIハンドラー | src/cli/commands/ | camelCase + Handler接尾辞 | addTaskHandler.ts |
| サービスクラス | src/services/ | PascalCase + Service接尾辞 | TaskService.ts |
| ストレージクラス | src/storage/ | PascalCase + Service接尾辞 | StorageService.ts |
| 型定義 | src/types/ | PascalCase | Task.ts |
| エラークラス | src/errors/ | PascalCase + Error接尾辞 | ValidationError.ts |
| フォーマッター | src/cli/formatters/ | PascalCase + Formatter接尾辞 | TaskFormatter.ts |

### テストファイル

| テスト種別 | 配置先 | 命名規則 | 例 |
|-----------|--------|---------|-----|
| ユニットテスト | tests/unit/src/[path]/ | [対象].test.ts | TaskService.test.ts |
| 統合テスト | tests/integration/[feature]/ | [シナリオ].test.ts | task-lifecycle.test.ts |
| E2Eテスト | tests/e2e/[scenario]/ | [ワークフロー].test.ts | user-workflow.test.ts |

### 設定ファイル

| ファイル種別 | 配置先 | 命名規則 |
|------------|--------|---------|
| TypeScript設定 | プロジェクトルート | tsconfig.json |
| Jest設定 | プロジェクトルート | jest.config.js |
| ESLint設定 | プロジェクトルート | .eslintrc.js |
| Prettier設定 | プロジェクトルート | .prettierrc |
| npm設定 | プロジェクトルート | package.json |
| Git除外設定 | プロジェクトルート | .gitignore |

## 命名規則

### ディレクトリ名

**レイヤーディレクトリ**: 複数形、kebab-case
- 例: `services/`, `commands/`, `formatters/`

**機能ディレクトリ**: 単数形、kebab-case
- 例: `task-management/`, `user-authentication/`

**テストディレクトリ**: kebab-case
- 例: `task-crud/`, `git-integration/`

### ファイル名

**クラスファイル**: PascalCase
- 例: `TaskService.ts`, `StorageService.ts`, `CLI.ts`

**関数ファイル**: camelCase
- 例: `formatDate.ts`, `validateEmail.ts`

**ハンドラーファイル**: camelCase + "Handler"接尾辞
- 例: `addTaskHandler.ts`, `listTasksHandler.ts`

**型定義ファイル**: PascalCase
- 例: `Task.ts`, `Command.ts`

**エラーファイル**: PascalCase + "Error"接尾辞
- 例: `ValidationError.ts`, `NotFoundError.ts`

### テストファイル名

- パターン: `[テスト対象].test.ts`
- 例: `TaskService.test.ts`, `task-lifecycle.test.ts`

## 依存関係のルール

### レイヤー間の依存

```
CLIレイヤー (src/cli/)
    ↓ (OK)
サービスレイヤー (src/services/)
    ↓ (OK)
データレイヤー (src/storage/)
```

**許可される依存**:
- `cli/` → `services/` ✅
- `cli/` → `types/` ✅
- `cli/` → `errors/` ✅
- `services/` → `storage/` ✅
- `services/` → `types/` ✅
- `services/` → `errors/` ✅
- `storage/` → `types/` ✅
- `storage/` → `errors/` ✅

**禁止される依存**:
- `storage/` → `services/` ❌
- `storage/` → `cli/` ❌
- `services/` → `cli/` ❌
- `types/` → すべて ❌(型定義は他に依存しない)
- `errors/` → すべて ❌(エラークラスは他に依存しない)

### モジュール間の依存

**循環依存の禁止**:
```typescript
// ❌ 悪い例: 循環依存
// services/TaskService.ts
import { GitService } from './GitService';

export class TaskService {
  constructor(private gitService: GitService) {}
}

// services/GitService.ts
import { TaskService } from './TaskService';  // 循環依存

export class GitService {
  constructor(private taskService: TaskService) {}
}
```

**解決策**: 依存の方向を統一
```typescript
// ✅ 良い例: 一方向の依存
// services/TaskService.ts
import { GitService } from './GitService';

export class TaskService {
  constructor(private gitService: GitService) {}
}

// services/GitService.ts
// TaskServiceに依存しない

export class GitService {
  // 独立したサービス
}
```

## スケーリング戦略

### 機能の追加

**小規模機能**: 既存ディレクトリに配置
```
src/services/
├── TaskService.ts            # 既存
└── SubtaskService.ts         # 新規追加(小規模)
```

**中規模機能**: レイヤー内にサブディレクトリを作成
```
src/services/
├── task/
│   ├── TaskService.ts
│   ├── SubtaskService.ts
│   └── TaskCategoryService.ts
└── user/
    ├── UserService.ts
    └── UserAuthService.ts
```

**大規模機能**: 独立したモジュールとして分離
```
src/
├── modules/
│   ├── task-management/
│   │   ├── services/
│   │   ├── storage/
│   │   └── types/
│   └── github-integration/
│       ├── services/
│       └── types/
├── cli/
├── services/
└── storage/
```

### ファイルサイズの管理

**ファイル分割の目安**:
- 1ファイル: 300行以下を推奨
- 300-500行: リファクタリングを検討
- 500行以上: 分割を強く推奨

**分割方法**:
```typescript
// 悪い例: TaskService.ts (800行)
export class TaskService {
  // CRUD操作
  // バリデーション
  // ソート・フィルタリング
  // 通知処理
}

// 良い例: 責務ごとに分割
// TaskService.ts (200行) - CRUD操作
// TaskValidator.ts (150行) - バリデーション
// TaskFilter.ts (100行) - ソート・フィルタリング
```

## 除外設定

### .gitignore

```
# 依存関係
node_modules/

# ビルド成果物
dist/
*.tsbuildinfo

# 環境変数
.env
.env.local

# ログ
*.log
npm-debug.log*

# OS固有
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/

# テストカバレッジ
coverage/

# 一時ファイル
*.tmp
.task/  # ユーザーデータ(開発時のテスト用)
```

### .prettierignore, .eslintignore

```
# ビルド成果物
dist/

# 依存関係
node_modules/

# ステアリングファイル(自動生成)
.steering/

# テストカバレッジ
coverage/

# 設定ファイル
*.config.js
```

## エントリーポイントとビルド

### package.json の設定

```json
{
  "name": "taskcli",
  "version": "1.0.0",
  "main": "dist/index.js",
  "bin": {
    "task": "dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "ts-node src/index.ts",
    "test": "jest",
    "test:unit": "jest tests/unit",
    "test:integration": "jest tests/integration",
    "test:e2e": "jest tests/e2e",
    "lint": "eslint src tests --ext .ts",
    "format": "prettier --write \"src/**/*.ts\" \"tests/**/*.ts\""
  }
}
```

### tsconfig.json の設定

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

---

**最終更新日**: 2025-01-03
**バージョン**: 1.0
**作成者**: Claude Code
