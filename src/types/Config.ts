// ユーザープロフィール設定
export interface UserProfile {
  name?: string; // ユーザー名
  email?: string; // メールアドレス
  github?: string; // GitHubユーザー名
}

// デフォルト設定
export interface DefaultSettings {
  priority?: TaskPriority; // デフォルト優先度
  sort?: SortOrder; // デフォルトソート順
}

// 設定全体
export interface Config {
  user: UserProfile;
  defaults: DefaultSettings;
}

// 設定キーのパス型
export type ConfigKey =
  | 'user.name'
  | 'user.email'
  | 'user.github'
  | 'defaults.priority'
  | 'defaults.sort';

// タスク優先度（Task.tsから参照予定、当面は直接定義）
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

// ソート順
export type SortOrder = 'created' | 'updated' | 'priority' | 'due';
