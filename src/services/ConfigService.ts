import { Config, ConfigKey, TaskPriority, SortOrder } from '../types/Config';
import { StorageService } from '../storage/StorageService';
import { ValidationError } from '../errors';

/**
 * 設定の読み込み・保存・バリデーションを担当するサービスクラス
 */
export class ConfigService {
  constructor(private storage: StorageService) {}

  /**
   * 設定全体を読み込む
   * @returns 設定オブジェクト
   */
  loadConfig(): Config {
    return this.storage.loadConfig();
  }

  /**
   * 設定を保存する
   * @param config - 保存する設定オブジェクト
   */
  saveConfig(config: Config): void {
    this.storage.saveConfig(config);
  }

  /**
   * ドット記法でキーの値を取得
   * @param key - 設定キー（例: 'user.name'）
   * @returns 設定値（未設定の場合はundefined）
   */
  getConfigValue(key: ConfigKey): string | undefined {
    const config = this.loadConfig();
    const value = this.getNestedValue(
      config as unknown as Record<string, unknown>,
      key
    );
    return value !== undefined ? String(value) : undefined;
  }

  /**
   * ドット記法でキーの値を設定
   * @param key - 設定キー（例: 'user.name'）
   * @param value - 設定値
   * @throws {ValidationError} バリデーションに失敗した場合
   */
  setConfigValue(key: ConfigKey, value: string): void {
    // バリデーション
    this.validateConfigValue(key, value);

    // 現在の設定を読み込み
    const config = this.loadConfig();

    // ネストされた値を設定
    this.setNestedValue(
      config as unknown as Record<string, unknown>,
      key,
      value
    );

    // 保存
    this.saveConfig(config);
  }

  /**
   * 設定値のバリデーション
   * @param key - 設定キー
   * @param value - 設定値
   * @throws {ValidationError} バリデーションに失敗した場合
   */
  private validateConfigValue(key: ConfigKey, value: string): void {
    if (key === 'defaults.priority') {
      const validPriorities: TaskPriority[] = [
        'low',
        'medium',
        'high',
        'critical',
      ];
      if (!validPriorities.includes(value as TaskPriority)) {
        throw new ValidationError(
          `優先度は low/medium/high/critical のいずれかを指定してください: ${value}`
        );
      }
    }

    if (key === 'defaults.sort') {
      const validSortOrders: SortOrder[] = [
        'created',
        'updated',
        'priority',
        'due',
      ];
      if (!validSortOrders.includes(value as SortOrder)) {
        throw new ValidationError(
          `ソート順は created/updated/priority/due のいずれかを指定してください: ${value}`
        );
      }
    }

    if (key === 'user.email' && value) {
      // 簡易的なメールアドレス検証
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        throw new ValidationError(
          `有効なメールアドレスを入力してください: ${value}`
        );
      }
    }
  }

  /**
   * ドット記法のキーからネストされたオブジェクトの値を取得
   * @param obj - 対象オブジェクト
   * @param path - ドット区切りのパス（例: 'user.name'）
   * @returns 値（存在しない場合はundefined）
   */
  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    const keys = path.split('.');
    let current: unknown = obj;

    for (const key of keys) {
      if (current === undefined || current === null) {
        return undefined;
      }
      current = (current as Record<string, unknown>)[key];
    }

    return current;
  }

  /**
   * ドット記法のキーでネストされたオブジェクトの値を設定
   * @param obj - 対象オブジェクト
   * @param path - ドット区切りのパス（例: 'user.name'）
   * @param value - 設定する値
   */
  private setNestedValue(
    obj: Record<string, unknown>,
    path: string,
    value: unknown
  ): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    let current: Record<string, unknown> = obj;

    // 最後のキーの手前まで辿る
    for (const key of keys) {
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key] as Record<string, unknown>;
    }

    // 最後のキーに値を設定
    current[lastKey] = value;
  }
}
