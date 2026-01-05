import { ConfigService } from '../services/ConfigService';
import { StorageService } from '../storage/StorageService';
import { configSetHandler } from './commands/configSetHandler';
import { configGetHandler } from './commands/configGetHandler';
import { configListHandler } from './commands/configListHandler';

/**
 * CLIメインクラス（簡易版）
 * 将来的にCommander.jsで拡張予定
 */
export class CLI {
  private configService: ConfigService;

  constructor() {
    const storage = new StorageService();
    this.configService = new ConfigService(storage);
  }

  /**
   * CLIを実行する
   * @param args - コマンドライン引数
   */
  async run(args: string[]): Promise<void> {
    const [command, subcommand, ...rest] = args.slice(2);

    if (command === 'config') {
      if (subcommand === 'set') {
        const [key, value] = rest;
        if (!key || !value) {
          console.error('使い方: task config set <key> <value>');
          process.exit(1);
        }
        await configSetHandler(key, value, this.configService);
      } else if (subcommand === 'get') {
        const [key] = rest;
        if (!key) {
          console.error('使い方: task config get <key>');
          process.exit(1);
        }
        await configGetHandler(key, this.configService);
      } else if (subcommand === 'list') {
        await configListHandler(this.configService);
      } else {
        console.error('使い方: task config <set|get|list>');
        process.exit(1);
      }
    } else {
      console.error('未実装のコマンドです:', command);
      process.exit(1);
    }
  }
}
