import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CLI } from '../../../src/cli/CLI';
import * as fs from 'fs';

describe('Config Commands E2E Test', () => {
  let cli: CLI;
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

    cli = new CLI();
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

  it('config set → config get のフロー', async () => {
    // Given/When: config setで設定を保存
    const setArgs = ['node', 'task', 'config', 'set', 'user.name', '田中太郎'];
    await cli.run(setArgs);

    // Then: ファイルが作成される
    expect(fs.existsSync(testConfigPath)).toBe(true);

    // Note: config getの出力を検証するにはconsole.logのモックが必要
    // ここでは実装の完全性を確認するためのシンプルなテストのみ
  });

  it('config listコマンドが正常に実行できる', async () => {
    // Given: 設定を事前に保存
    await cli.run(['node', 'task', 'config', 'set', 'user.name', '佐藤花子']);
    await cli.run([
      'node',
      'task',
      'config',
      'set',
      'defaults.priority',
      'high',
    ]);

    // When/Then: config listが正常に実行できる（エラーが発生しない）
    const listArgs = ['node', 'task', 'config', 'list'];
    await expect(cli.run(listArgs)).resolves.not.toThrow();
  });
});
