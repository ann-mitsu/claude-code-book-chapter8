#!/usr/bin/env node

import { CLI } from './cli/CLI';

/**
 * CLIアプリケーションのエントリーポイント
 */
async function main() {
  try {
    const cli = new CLI();
    await cli.run(process.argv);
  } catch (error) {
    console.error('予期しないエラーが発生しました:', error);
    process.exit(1);
  }
}

main();
