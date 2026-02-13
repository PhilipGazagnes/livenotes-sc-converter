/**
 * Phase 1 - Brick 1: FileReader
 * 
 * Responsible for reading and validating SongCode file content.
 * - Validates UTF-8 encoding
 * - Normalizes line endings (CRLF → LF)
 * - Rejects files with null bytes
 * 
 * Test Spec: Section 1.1 (Tests 1.1.1-1.1.7)
 */

export class FileReader {
  /**
   * Read and validate file content
   * 
   * @param content - Raw file content
   * @returns Validated and normalized content
   * @throws {SongCodeError} E0.2 - Invalid UTF-8 encoding
   */
  read(content: string): string {
    // TODO: Implement UTF-8 validation
    // TODO: Normalize line endings to LF
    // TODO: Check for null bytes
    
    throw new Error('Not implemented yet');
  }
}
