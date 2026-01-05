import { ConfigService } from '../../services/ConfigService';
import { ConfigKey } from '../../types/Config';
import { ValidationError } from '../../errors';

/**
 * `task config set`コマンドのハンドラー
 * @param key - 設定キー（例: 'user.name'）
 * @param value - 設定値
 * @param configService - ConfigServiceインスタンス
 */
export async function configSetHandler(
  key: string,
  value: string,
  configService: ConfigService
): Promise<void> {
  try {
    // キーのバリデーション（ConfigKey型にキャスト可能か確認）
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

    // ConfigService経由で設定
    configService.setConfigValue(key as ConfigKey, value);

    // 成功メッセージを表示
    console.log(`✓ 設定を保存しました: ${key} = ${value}`);
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error(`エラー: ${error.message}`);
      process.exit(1);
    }
    throw error;
  }
}
