import * as fs from 'fs';
import * as path from 'path';
import { Config } from '../types/Config';
import { StorageError } from '../errors';

/**
 * データの永続化を担当するサービスクラス
 */
export class StorageService {
  private readonly configPath: string = '.task/config.json';

  /**
   * 設定ファイルを読み込む
   * @returns 設定オブジェクト
   * @throws {StorageError} ファイルの読み込みに失敗した場合
   */
  loadConfig(): Config {
    try {
      if (!this.configExists()) {
        return this.initializeConfig();
      }

      const data = fs.readFileSync(this.configPath, 'utf-8');
      const config = JSON.parse(data) as Config;
      return config;
    } catch (error) {
      throw new StorageError(
        '設定ファイルの読み込みに失敗しました',
        error as Error
      );
    }
  }

  /**
   * 設定ファイルを保存する
   * @param config - 保存する設定オブジェクト
   * @throws {StorageError} ファイルの保存に失敗した場合
   */
  saveConfig(config: Config): void {
    try {
      // ディレクトリが存在しない場合は作成
      const dir = path.dirname(this.configPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // JSON形式で保存
      const data = JSON.stringify(config, null, 2);
      fs.writeFileSync(this.configPath, data, 'utf-8');
    } catch (error) {
      throw new StorageError(
        '設定ファイルの保存に失敗しました',
        error as Error
      );
    }
  }

  /**
   * 設定ファイルが存在するか確認
   * @returns ファイルが存在する場合はtrue
   */
  configExists(): boolean {
    try {
      return fs.existsSync(this.configPath);
    } catch {
      return false;
    }
  }

  /**
   * 設定ファイルを初期化
   * @returns 初期化された設定オブジェクト
   */
  initializeConfig(): Config {
    const defaultConfig: Config = {
      user: {},
      defaults: {},
    };

    this.saveConfig(defaultConfig);
    return defaultConfig;
  }
}
