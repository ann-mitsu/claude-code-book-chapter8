/**
 * TaskCLI固有のエラーの基底クラス
 */
export class TaskError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = 'TaskError';
  }
}
