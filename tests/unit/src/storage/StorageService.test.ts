import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { StorageService } from '../../../../src/storage/StorageService';
import * as fs from 'fs';

describe('StorageService', () => {
  let service: StorageService;
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

    service = new StorageService();
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

  describe('loadConfig', () => {
    it('正常系: 設定ファイルが存在する場合、内容を読み込む', () => {
      // Given: 設定ファイルを作成
      const config = {
        user: {
          name: '田中太郎',
          email: 'tanaka@example.com',
        },
        defaults: {
          priority: 'medium' as const,
        },
      };
      service.saveConfig(config);

      // When: 設定を読み込む
      const result = service.loadConfig();

      // Then: 正しく読み込まれる
      expect(result).toEqual(config);
    });

    it('ファイル不在時: 初期値を返す', () => {
      // Given: 設定ファイルが存在しない

      // When: 設定を読み込む
      const result = service.loadConfig();

      // Then: 初期値が返される
      expect(result).toEqual({
        user: {},
        defaults: {},
      });
    });
  });

  describe('saveConfig', () => {
    it('正常系: 設定を保存できる', () => {
      // Given: 保存する設定
      const config = {
        user: {
          name: '佐藤花子',
          github: 'sato-hanako',
        },
        defaults: {
          sort: 'created' as const,
        },
      };

      // When: 設定を保存
      service.saveConfig(config);

      // Then: ファイルが作成される
      expect(service.configExists()).toBe(true);

      // And: 内容が正しい
      const saved = service.loadConfig();
      expect(saved).toEqual(config);
    });
  });

  describe('configExists', () => {
    it('設定ファイルが存在する場合はtrueを返す', () => {
      // Given: 設定ファイルを作成
      service.initializeConfig();

      // When/Then
      expect(service.configExists()).toBe(true);
    });

    it('設定ファイルが存在しない場合はfalseを返す', () => {
      // Given: 設定ファイルが存在しない

      // When/Then
      expect(service.configExists()).toBe(false);
    });
  });

  describe('initializeConfig', () => {
    it('初期設定を作成して返す', () => {
      // When: 初期化
      const result = service.initializeConfig();

      // Then: 初期値が返される
      expect(result).toEqual({
        user: {},
        defaults: {},
      });

      // And: ファイルが作成される
      expect(service.configExists()).toBe(true);
    });
  });
});
