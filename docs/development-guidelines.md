# 開発ガイドライン (Development Guidelines)

## コーディング規約

### TypeScript 型定義

**組み込み型の使用**:
```typescript
// ✅ 良い例: 組み込み型を使用
function processTaskList(tasks: Task[]): Map<string, Task> {
  return new Map(tasks.map(task => [task.id.toString(), task]));
}

// ❌ 悪い例: any型を使用
function processTaskList(tasks: any): any {
  return new Map(tasks.map(task => [task.id, task]));
}
```

**型注釈の原則**:
```typescript
// ✅ 良い例: 明示的な型注釈
function createTask(data: CreateTaskInput): Task {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    ...data,
    status: 'open',
    priority: data.priority || 'medium',
    createdAt: now,
    updatedAt: now,
  };
}

// ❌ 悪い例: 型推論に頼りすぎる
function createTask(data) {  // any型になる
  return {
    id: generateId(),
    ...data,
  };
}
```

**インターフェース vs 型エイリアス**:
```typescript
// インターフェース: 拡張可能なオブジェクト型
interface Task {
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

// 型エイリアス: ユニオン型、プリミティブ型
type TaskStatus = 'open' | 'in_progress' | 'completed' | 'archived';
type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
```

### 命名規則

#### 変数・関数

```typescript
// 変数: camelCase、名詞
const taskList: Task[] = [];
const currentTask: Task | null = null;
const isCompleted: boolean = true;

// 関数: camelCase、動詞で始める
function fetchTaskById(id: number): Task | null { }
function validateTaskTitle(title: string): void { }
function calculateTotalTasks(tasks: Task[]): number { }

// Boolean: is, has, should, canで始める
const isValid = true;
const hasUncommittedChanges = false;
const shouldRetry = true;
const canDelete = false;
```

#### クラス・インターフェース

```typescript
// クラス: PascalCase + Service接尾辞
class TaskService { }
class GitService { }
class StorageService { }

// インターフェース: PascalCase
interface Task { }
interface TaskData { }
interface CreateTaskInput { }

// 型エイリアス: PascalCase
type TaskStatus = 'open' | 'in_progress' | 'completed' | 'archived';
```

#### 定数

```typescript
// UPPER_SNAKE_CASE
const MAX_TITLE_LENGTH = 200;
const DEFAULT_PRIORITY: TaskPriority = 'medium';
const TASK_DATA_PATH = '.task/tasks.json';
```

#### ファイル名

```typescript
// クラスファイル: PascalCase
// TaskService.ts
// GitService.ts
// StorageService.ts

// ハンドラーファイル: camelCase + Handler接尾辞
// addTaskHandler.ts
// listTasksHandler.ts

// 型定義: PascalCase
// Task.ts
// Command.ts

// エラークラス: PascalCase + Error接尾辞
// ValidationError.ts
// NotFoundError.ts
```

### コードフォーマット

**インデント**: 2スペース

**行の長さ**: 最大100文字

**例**:
```typescript
// ✅ 良い例: 適切なフォーマット
function createTaskWithDefaults(
  title: string,
  options?: Partial<CreateTaskInput>
): Task {
  return {
    id: generateId(),
    title,
    description: options?.description,
    status: 'open',
    priority: options?.priority || 'medium',
    due: options?.due,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// ❌ 悪い例: 長すぎる行
function createTaskWithDefaults(title: string, options?: Partial<CreateTaskInput>): Task { return { id: generateId(), title, description: options?.description, status: 'open', priority: options?.priority || 'medium', due: options?.due, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }; }
```

### コメント規約

**TSDoc形式**:
```typescript
/**
 * タスクを作成する
 *
 * @param data - 作成するタスクのデータ
 * @returns 作成されたタスク
 * @throws {ValidationError} タイトルが不正な場合
 * @throws {StorageError} ストレージエラーの場合
 *
 * @example
 * ```typescript
 * const task = createTask({
 *   title: '新しいタスク',
 *   priority: 'high'
 * });
 * ```
 */
function createTask(data: CreateTaskInput): Task {
  // 実装
}
```

**インラインコメント**:
```typescript
// ✅ 良い例: なぜそうするかを説明
// IDの衝突を避けるため、nextIdをインクリメント
const newId = taskData.nextId++;

// ❌ 悪い例: 何をしているか(コードを見れば分かる)
// nextIdをインクリメント
const newId = taskData.nextId++;
```

**TODO・FIXME**:
```typescript
// TODO: GitHub Issues連携機能を実装 (P1, Issue #123)
// FIXME: 10,000件以上のタスクでパフォーマンス劣化 (Issue #456)
// HACK: 一時的な回避策、将来的にSQLiteに移行
```

### エラーハンドリング

**カスタムエラークラス**:
```typescript
// エラークラスの定義
class TaskError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'TaskError';
  }
}

class ValidationError extends TaskError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
  }
}

class NotFoundError extends TaskError {
  constructor(resource: string, id: number) {
    super(`${resource} not found: ${id}`, 'NOT_FOUND');
  }
}

class StorageError extends TaskError {
  constructor(message: string, public cause?: Error) {
    super(message, 'STORAGE_ERROR');
    this.cause = cause;
  }
}

class GitError extends TaskError {
  constructor(message: string, public cause?: Error) {
    super(message, 'GIT_ERROR');
    this.cause = cause;
  }
}
```

**エラーハンドリングパターン**:
```typescript
// ✅ 良い例: 適切なエラーハンドリング
async function getTaskById(id: number): Promise<Task> {
  try {
    const taskData = await storageService.load();
    const task = taskData.tasks.find(t => t.id === id);

    if (!task) {
      throw new NotFoundError('Task', id);
    }

    return task;
  } catch (error) {
    if (error instanceof NotFoundError) {
      // 予期されるエラー: 適切に処理
      console.error(`タスクが見つかりません: ${id}`);
      throw error;
    }

    // 予期しないエラー: ラップして上位に伝播
    throw new StorageError('タスクの取得に失敗しました', error as Error);
  }
}

// ❌ 悪い例: エラーを無視
async function getTaskById(id: number): Promise<Task | null> {
  try {
    const taskData = await storageService.load();
    return taskData.tasks.find(t => t.id === id) || null;
  } catch (error) {
    return null; // エラー情報が失われる
  }
}
```

**エラーメッセージ**:
```typescript
// ✅ 良い例: 具体的で解決策を示す
throw new ValidationError(
  `タイトルは1-${MAX_TITLE_LENGTH}文字で入力してください。現在の文字数: ${title.length}`
);

// ❌ 悪い例: 曖昧で役に立たない
throw new Error('Invalid input');
```

### CLI固有の規約

**コマンドハンドラーの設計**:
```typescript
// ✅ 良い例: 単一責務、依存性注入
async function addTaskHandler(
  title: string,
  options: AddTaskOptions,
  services: { taskService: TaskService; formatter: TaskFormatter }
): Promise<void> {
  try {
    // 入力バリデーション
    if (!title || title.trim().length === 0) {
      throw new ValidationError('タイトルは必須です');
    }

    // ビジネスロジック実行
    const task = await services.taskService.createTask({
      title,
      priority: options.priority,
      due: options.due,
    });

    // 結果の表示
    services.formatter.displaySuccess(`タスクを作成しました (ID: ${task.id})`);
    services.formatter.displayTaskDetail(task);
  } catch (error) {
    services.formatter.displayError(error as Error);
    process.exit(1);
  }
}

// ❌ 悪い例: 責務が混在、直接依存
async function addTaskHandler(title: string, options: any): Promise<void> {
  const task = {
    id: Math.random(),
    title,
    status: 'open',
  };
  // ストレージに直接アクセス(レイヤー違反)
  fs.writeFileSync('.task/tasks.json', JSON.stringify(task));
  console.log('Created!'); // フォーマッタを使わない
}
```

**Git操作の安全性**:
```typescript
// ✅ 良い例: 事前チェックとエラーハンドリング
async function startTask(id: number): Promise<void> {
  // Gitリポジトリの存在確認
  const isGitRepo = await gitService.isGitRepository();
  if (!isGitRepo) {
    throw new GitError('Gitリポジトリが見つかりません');
  }

  // 未コミットの変更確認
  const hasUncommitted = await gitService.hasUncommittedChanges();
  if (hasUncommitted) {
    const confirmed = await promptService.confirm(
      '未コミットの変更があります。続行しますか?'
    );
    if (!confirmed) {
      return;
    }
  }

  // ブランチ作成・切り替え
  const branchName = gitService.generateBranchName(id, task.title);
  await gitService.createAndCheckoutBranch(branchName);
}

// ❌ 悪い例: チェックなし
async function startTask(id: number): Promise<void> {
  const branchName = `feature/task-${id}`;
  await exec(`git checkout -b ${branchName}`); // エラーハンドリングなし
}
```

## Git運用ルール

### ブランチ戦略（Git Flow）

**ブランチ構成**:
```
main (本番環境)
└── develop (開発・統合環境)
    ├── feature/task-basic-operations (新機能)
    ├── feature/git-integration (新機能)
    └── fix/task-validation-bug (バグ修正)
```

**運用ルール**:
- **main**: 本番リリース済みの安定版コードのみ。タグでバージョン管理(v1.0.0、v1.1.0等)
- **develop**: 次期リリースに向けた最新の開発コードを統合
- **feature/\*、fix/\***: developから分岐し、作業完了後にPRでdevelopへマージ
- **直接コミット禁止**: すべてのブランチでPRレビューを必須
- **マージ方針**: feature→develop は squash merge、develop→main は merge commit

**ブランチ命名規則**:
```
feature/[機能名]  例: feature/github-integration
fix/[修正内容]    例: fix/task-validation-bug
refactor/[対象]   例: refactor/storage-service
```

### コミットメッセージ規約

**Conventional Commits形式**:
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type一覧**:
- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント
- `style`: コードフォーマット
- `refactor`: リファクタリング
- `test`: テスト追加・修正
- `chore`: ビルド、補助ツール等

**良いコミットメッセージの例**:
```
feat(task): タスクの優先度設定機能を追加

ユーザーがタスクに優先度(高/中/低/緊急)を設定できるようになりました。

実装内容:
- Taskインターフェースにpriorityフィールド追加
- task add コマンドに--priorityオプション追加
- task list コマンドで優先度によるソート機能実装

Closes #123
```

### プルリクエストプロセス

**作成前のチェック**:
- [ ] 全てのテストがパス(`npm test`)
- [ ] Lintエラーがない(`npm run lint`)
- [ ] 型チェックがパス(`npm run typecheck`)
- [ ] 競合が解決されている

**PRテンプレート**:
```markdown
## 変更の種類
- [ ] 新機能 (feat)
- [ ] バグ修正 (fix)
- [ ] リファクタリング (refactor)
- [ ] ドキュメント (docs)

## 変更内容
### 何を変更したか
タスクの優先度設定機能を追加しました。

### なぜ変更したか
ユーザーが重要なタスクを識別しやすくするため。

### どのように変更したか
- Taskインターフェースにpriorityフィールド追加
- CLIに--priorityオプション追加
- 優先度によるソート機能実装

## テスト
### 実施したテスト
- [x] ユニットテスト追加(TaskService.test.ts)
- [x] E2Eテスト追加(priority.test.ts)
- [x] 手動テスト実施

### テスト結果
全テストパス。優先度によるソートが正しく動作することを確認。

## 関連Issue
Closes #123

## レビューポイント
- priorityフィールドの型定義が適切か
- デフォルト値の扱いが妥当か
```

**レビュープロセス**:
1. セルフレビュー(コミット前に自分でコードを見直す)
2. 自動テスト実行(GitHub Actions)
3. レビュアーアサイン(最低1名)
4. レビューフィードバック対応
5. 承認後マージ

## テスト戦略

### テストピラミッド

```
       /\
      /E2E\       少 (遅い、高コスト)
     /------\
    / 統合   \     中
   /----------\
  / ユニット   \   多 (速い、低コスト)
 /--------------\
```

**目標比率**:
- ユニットテスト: 70%
- 統合テスト: 20%
- E2Eテスト: 10%

### ユニットテスト

**対象**: 個別の関数・クラス

**カバレッジ目標**: 80%以上

**例**:
```typescript
describe('TaskService', () => {
  describe('createTask', () => {
    it('正常なデータでタスクを作成できる', () => {
      // Given: 準備
      const service = new TaskService(mockStorage);
      const data: CreateTaskInput = {
        title: 'テストタスク',
        priority: 'high',
      };

      // When: 実行
      const result = service.createTask(data);

      // Then: 検証
      expect(result.id).toBeDefined();
      expect(result.title).toBe('テストタスク');
      expect(result.priority).toBe('high');
      expect(result.status).toBe('open');
    });

    it('タイトルが空の場合ValidationErrorをスローする', () => {
      // Given: 準備
      const service = new TaskService(mockStorage);
      const invalidData: CreateTaskInput = { title: '' };

      // When/Then: 実行と検証
      expect(() => {
        service.createTask(invalidData);
      }).toThrow(ValidationError);
    });

    it('タイトルが200文字を超える場合ValidationErrorをスローする', () => {
      // Given: 準備
      const service = new TaskService(mockStorage);
      const longTitle = 'a'.repeat(201);
      const invalidData: CreateTaskInput = { title: longTitle };

      // When/Then: 実行と検証
      expect(() => {
        service.createTask(invalidData);
      }).toThrow(ValidationError);
    });
  });
});
```

### 統合テスト

**対象**: 複数コンポーネントの連携

**例**:
```typescript
describe('Task CRUD', () => {
  it('タスクの作成・取得・更新・削除ができる', () => {
    // 作成
    const created = taskService.createTask({ title: 'テスト' });
    expect(created.id).toBeDefined();

    // 取得
    const found = taskService.getTaskById(created.id);
    expect(found?.title).toBe('テスト');

    // 更新
    const updated = taskService.updateTask(created.id, { title: '更新後' });
    expect(updated.title).toBe('更新後');

    // 削除
    taskService.deleteTask(created.id);
    const deleted = taskService.getTaskById(created.id);
    expect(deleted).toBeNull();
  });
});
```

### E2Eテスト

**対象**: ユーザーシナリオ全体

**例**:
```typescript
describe('タスク管理フロー', () => {
  it('ユーザーがタスクを追加して完了できる', async () => {
    // タスク追加
    const addOutput = await execCLI(['add', '新しいタスク', '--priority', 'high']);
    expect(addOutput).toContain('タスクを作成しました');

    // タスク一覧表示
    const listOutput = await execCLI(['list']);
    expect(listOutput).toContain('新しいタスク');
    expect(listOutput).toContain('high');

    // タスク完了
    const doneOutput = await execCLI(['done', '1']);
    expect(doneOutput).toContain('タスクを完了しました');

    // 完了確認
    const finalListOutput = await execCLI(['list']);
    expect(finalListOutput).toContain('completed');
  });
});
```

### モック・スタブの使用

**原則**:
- 外部依存(ファイルシステム、Git操作)はモック化
- ビジネスロジックは実装を使用

**例**:
```typescript
// ファイルシステムをモック化
jest.mock('fs/promises');

// simple-gitをモック化
jest.mock('simple-git');

describe('GitService', () => {
  it('ブランチ名を正しく生成する', () => {
    // Gitモックは不要(ブランチ名生成は純粋関数)
    const service = new GitService();
    const branchName = service.generateBranchName(1, 'ユーザー認証機能の実装');

    expect(branchName).toBe('feature/task-1-');
  });
});
```

## コードレビュー基準

### レビューポイント

**機能性**:
- [ ] 要件を満たしているか
- [ ] エッジケースが考慮されているか(空文字、null、大量データ等)
- [ ] エラーハンドリングが適切か

**可読性**:
- [ ] 命名が明確か(変数、関数、クラス)
- [ ] コメントが適切か(複雑なロジックの説明)
- [ ] 関数が単一責務を持っているか

**保守性**:
- [ ] 重複コードがないか
- [ ] レイヤー分離が守られているか
- [ ] 変更の影響範囲が限定的か

**パフォーマンス**:
- [ ] 不要な計算がないか
- [ ] 適切なデータ構造を使っているか(Map vs Array)
- [ ] ループが最適化されているか

**セキュリティ**:
- [ ] 入力検証が適切か
- [ ] 機密情報がハードコードされていないか
- [ ] コマンドインジェクション対策がされているか

### レビューコメントの書き方

**建設的なフィードバック**:
```markdown
## ✅ 良い例
この実装だと、タスク数が増えた時にO(n²)の時間計算量になります。
Mapを使うとO(n)に改善できます:

```typescript
const taskMap = new Map(tasks.map(t => [t.id, t]));
const result = ids.map(id => taskMap.get(id));
```

## ❌ 悪い例
この書き方は良くないです。
```

**優先度の明示**:
- `[必須]`: 修正必須(セキュリティ、バグ等)
- `[推奨]`: 修正推奨(パフォーマンス、可読性等)
- `[提案]`: 検討してほしい(代替実装等)
- `[質問]`: 理解のための質問

**例**:
```markdown
[必須] セキュリティ: ファイルパスの検証が不足しています
[推奨] パフォーマンス: ループ内でのファイル読み込みを避けましょう
[提案] 可読性: この関数をさらに小さく分割できませんか?
[質問] この処理の意図を教えてください
```

## 開発環境セットアップ

### 必要なツール

| ツール | バージョン | インストール方法 |
|--------|-----------|-----------------|
| Node.js | 24.11.0 LTS | https://nodejs.org/ または nvm |
| Git | 2.30以上 | https://git-scm.com/ |
| npm | 11.x | Node.jsに標準搭載 |
| TypeScript | 5.x | `npm install -g typescript` |

### セットアップ手順

```bash
# 1. リポジトリのクローン
git clone https://github.com/username/taskcli.git
cd taskcli

# 2. 依存関係のインストール
npm install

# 3. ビルド
npm run build

# 4. ローカルでCLIを実行
npm run dev -- add "テストタスク"

# 5. テスト実行
npm test

# 6. リントチェック
npm run lint

# 7. 型チェック
npm run typecheck
```

### 推奨開発ツール

**エディタ**: Visual Studio Code

**VSCode拡張機能**:
- ESLint: dbaeumer.vscode-eslint
- Prettier: esbenp.prettier-vscode
- TypeScript: ms-vscode.vscode-typescript-next
- Jest: Orta.vscode-jest

**設定(`.vscode/settings.json`)**:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

### npm scripts

```json
{
  "scripts": {
    "dev": "ts-node src/index.ts",
    "build": "tsc",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src tests --ext .ts",
    "lint:fix": "eslint src tests --ext .ts --fix",
    "format": "prettier --write \"src/**/*.ts\" \"tests/**/*.ts\"",
    "typecheck": "tsc --noEmit"
  }
}
```

---

**最終更新日**: 2025-01-03
**バージョン**: 1.0
**作成者**: Claude Code
