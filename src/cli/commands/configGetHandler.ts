import { ConfigService } from '../../services/ConfigService';
import { ConfigKey } from '../../types/Config';
import { ValidationError } from '../../errors';

/**
 * `task config get`コマンドのハンドラー
 * @param key - 設定キー（例: 'user.name'）
 * @param configService - ConfigServiceインスタンス
 */
export async function configGetHandler(
  key: string,
  configService: ConfigService
): Promise<void> {
  try {
    // キーのバリデーション
    const validKeys: ConfigKey[] = [
      'user.name',
      'user.email',
      'user.github',
      'defaults.priority',
      'defaults.sort',
    ];

    if (!validKeys.includes(key as ConfigKey)) {
      throw new ValidationError(`無効な設定キーです: ${key}`);
    }

    // ConfigService経由で取得
    const value = configService.getConfigValue(key as ConfigKey);

    // 値を表示
    if (value !== undefined) {
      console.log(value);
    } else {
      console.log(`設定されていません: ${key}`);
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error(`エラー: ${error.message}`);
      process.exit(1);
    }
    throw error;
  }
}
