import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ConfigService } from '../../../src/services/ConfigService';
import { StorageService } from '../../../src/storage/StorageService';
import * as fs from 'fs';

describe('Config CRUD Integration Test', () => {
  let service: ConfigService;
  let storage: StorageService;
  const testConfigPath = '.task/config.json';

  beforeEach(() => {
    // テスト前にクリーンアップ
    try {
      if (fs.existsSync(testConfigPath)) {
        fs.unlinkSync(testConfigPath);
      }
      if (fs.existsSync('.task')) {
        fs.rmdirSync('.task');
      }
    } catch {
      // エラーを無視
    }

    storage = new StorageService();
    service = new ConfigService(storage);
  });

  afterEach(() => {
    // テスト後にクリーンアップ
    try {
      if (fs.existsSync(testConfigPath)) {
        fs.unlinkSync(testConfigPath);
      }
      if (fs.existsSync('.task')) {
        fs.rmdirSync('.task');
      }
    } catch {
      // エラーを無視
    }
  });

  it('設定の保存 → 読み込み → 取得のフロー', () => {
    // Given/When: 複数の設定を保存
    service.setConfigValue('user.name', '田中太郎');
    service.setConfigValue('user.email', 'tanaka@example.com');
    service.setConfigValue('user.github', 'tanaka-taro');
    service.setConfigValue('defaults.priority', 'high');
    service.setConfigValue('defaults.sort', 'created');

    // Then: 全ての設定が正しく取得できる
    expect(service.getConfigValue('user.name')).toBe('田中太郎');
    expect(service.getConfigValue('user.email')).toBe('tanaka@example.com');
    expect(service.getConfigValue('user.github')).toBe('tanaka-taro');
    expect(service.getConfigValue('defaults.priority')).toBe('high');
    expect(service.getConfigValue('defaults.sort')).toBe('created');

    // And: ファイルが作成されている
    expect(storage.configExists()).toBe(true);

    // And: 再度読み込んでも同じ値が取得できる
    const newService = new ConfigService(storage);
    expect(newService.getConfigValue('user.name')).toBe('田中太郎');
  });

  it('設定ファイルが正しいJSON形式で保存されている', () => {
    // Given/When: 設定を保存
    service.setConfigValue('user.name', '佐藤花子');
    service.setConfigValue('defaults.priority', 'medium');

    // Then: ファイルの内容が正しいJSON
    const data = fs.readFileSync(testConfigPath, 'utf-8');
    const config = JSON.parse(data);

    expect(config).toEqual({
      user: {
        name: '佐藤花子',
      },
      defaults: {
        priority: 'medium',
      },
    });
  });
});
