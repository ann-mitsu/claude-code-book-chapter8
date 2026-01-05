import { ConfigService } from '../../services/ConfigService';

/**
 * `task config list`コマンドのハンドラー
 * @param configService - ConfigServiceインスタンス
 */
export async function configListHandler(
  configService: ConfigService
): Promise<void> {
  try {
    // ConfigService経由で全設定を取得
    const config = configService.loadConfig();

    // 表形式で表示
    console.log('\n設定一覧:\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('ユーザー設定:');
    console.log(`  user.name:    ${config.user.name || '(未設定)'}`);
    console.log(`  user.email:   ${config.user.email || '(未設定)'}`);
    console.log(`  user.github:  ${config.user.github || '(未設定)'}`);
    console.log('\nデフォルト設定:');
    console.log(
      `  defaults.priority: ${config.defaults.priority || '(未設定)'}`
    );
    console.log(`  defaults.sort:     ${config.defaults.sort || '(未設定)'}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (error) {
    console.error(`エラー: ${error}`);
    process.exit(1);
  }
}
