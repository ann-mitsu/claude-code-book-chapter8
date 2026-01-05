import { TaskError } from './TaskError';

/**
 * ストレージエラー
 * ファイルの読み書きに失敗した場合にスローされる
 */
export class StorageError extends TaskError {
  constructor(
    message: string,
    public cause?: Error
  ) {
    super(message, 'STORAGE_ERROR');
    this.name = 'StorageError';
    this.cause = cause;
  }
}
