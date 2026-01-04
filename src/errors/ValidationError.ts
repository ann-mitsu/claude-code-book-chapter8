import { TaskError } from './TaskError';

/**
 * 入力検証エラー
 * ユーザー入力がビジネスルールに違反した場合にスローされる
 */
export class ValidationError extends TaskError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}
