import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ConfigService } from '../../../../src/services/ConfigService';
import { StorageService } from '../../../../src/storage/StorageService';
import { ValidationError } from '../../../../src/errors';
import * as fs from 'fs';

describe('ConfigService', () => {
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

  describe('getConfigValue', () => {
    it('user.nameの値を取得できる', () => {
      // Given: 設定を保存
      service.setConfigValue('user.name', '田中太郎');

      // When: 値を取得
      const result = service.getConfigValue('user.name');

      // Then: 正しい値が返される
      expect(result).toBe('田中太郎');
    });

    it('user.emailの値を取得できる', () => {
      // Given: 設定を保存
      service.setConfigValue('user.email', 'tanaka@example.com');

      // When: 値を取得
      const result = service.getConfigValue('user.email');

      // Then: 正しい値が返される
      expect(result).toBe('tanaka@example.com');
    });

    it('未設定のキーに対してundefinedを返す', () => {
      // Given: 設定が空

      // When: 値を取得
      const result = service.getConfigValue('user.name');

      // Then: undefinedが返される
      expect(result).toBeUndefined();
    });
  });

  describe('setConfigValue', () => {
    it('正常系: user.nameを設定できる', () => {
      // When: 値を設定
      service.setConfigValue('user.name', '佐藤花子');

      // Then: 値が保存される
      const result = service.getConfigValue('user.name');
      expect(result).toBe('佐藤花子');
    });

    it('正常系: defaults.priorityを設定できる', () => {
      // When: 値を設定
      service.setConfigValue('defaults.priority', 'high');

      // Then: 値が保存される
      const result = service.getConfigValue('defaults.priority');
      expect(result).toBe('high');
    });

    it('正常系: defaults.sortを設定できる', () => {
      // When: 値を設定
      service.setConfigValue('defaults.sort', 'created');

      // Then: 値が保存される
      const result = service.getConfigValue('defaults.sort');
      expect(result).toBe('created');
    });

    it('バリデーションエラー: 無効な優先度', () => {
      // When/Then: 無効な値を設定するとエラー
      expect(() => {
        service.setConfigValue('defaults.priority', 'invalid');
      }).toThrow(ValidationError);
    });

    it('バリデーションエラー: 無効なソート順', () => {
      // When/Then: 無効な値を設定するとエラー
      expect(() => {
        service.setConfigValue('defaults.sort', 'invalid');
      }).toThrow(ValidationError);
    });

    it('バリデーションエラー: 無効なメールアドレス', () => {
      // When/Then: 無効な値を設定するとエラー
      expect(() => {
        service.setConfigValue('user.email', 'invalid-email');
      }).toThrow(ValidationError);
    });
  });

  describe('validateConfigValue', () => {
    it('defaults.priorityのバリデーション: 有効な値', () => {
      // Given/When/Then: 有効な優先度はエラーにならない
      expect(() => {
        service.setConfigValue('defaults.priority', 'low');
      }).not.toThrow();

      expect(() => {
        service.setConfigValue('defaults.priority', 'medium');
      }).not.toThrow();

      expect(() => {
        service.setConfigValue('defaults.priority', 'high');
      }).not.toThrow();

      expect(() => {
        service.setConfigValue('defaults.priority', 'critical');
      }).not.toThrow();
    });

    it('defaults.sortのバリデーション: 有効な値', () => {
      // Given/When/Then: 有効なソート順はエラーにならない
      expect(() => {
        service.setConfigValue('defaults.sort', 'created');
      }).not.toThrow();

      expect(() => {
        service.setConfigValue('defaults.sort', 'updated');
      }).not.toThrow();

      expect(() => {
        service.setConfigValue('defaults.sort', 'priority');
      }).not.toThrow();

      expect(() => {
        service.setConfigValue('defaults.sort', 'due');
      }).not.toThrow();
    });
  });
});
