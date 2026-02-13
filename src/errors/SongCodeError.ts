/**
 * Custom error class for SongCode parsing and validation errors.
 * 
 * Error codes correspond to the error catalog in:
 * https://github.com/PhilipGazagnes/livenotes-documentation/blob/main/songcode/parser-generator-specification.md#comprehensive-error-catalog
 */

export class SongCodeError extends Error {
  /**
   * Error code (e.g., 'E1.1.1', 'E2.1.3')
   */
  public readonly code: string;

  /**
   * Line number where the error occurred (if applicable)
   */
  public readonly line?: number | undefined;

  /**
   * Column number where the error occurred (if applicable)
   */
  public readonly column?: number | undefined;

  /**
   * Additional context about the error
   */
  public readonly context?: string | undefined;

  constructor(
    code: string,
    message: string,
    options?: {
      line?: number;
      column?: number;
      context?: string;
    }
  ) {
    super(message);
    this.name = 'SongCodeError';
    this.code = code;
    this.line = options?.line;
    this.column = options?.column;
    this.context = options?.context;

    // Maintains proper stack trace for where our error was thrown (V8 only)
    const errorConstructor = Error as unknown as { captureStackTrace?: (target: object, constructor: Function) => void };
    if (errorConstructor.captureStackTrace) {
      errorConstructor.captureStackTrace(this, SongCodeError);
    }
  }

  /**
   * Format error message for display
   */
  toString(): string {
    let msg = `[${this.code}] ${this.message}`;
    
    if (this.line !== undefined) {
      msg += ` (line ${this.line}`;
      if (this.column !== undefined) {
        msg += `, column ${this.column}`;
      }
      msg += ')';
    }
    
    if (this.context) {
      msg += `\nContext: ${this.context}`;
    }
    
    return msg;
  }
}
