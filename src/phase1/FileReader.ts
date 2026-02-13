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

import { SongCodeError } from '../errors/SongCodeError';

export class FileReader {
  /**
   * Read and validate file content
   * 
   * @param content - Raw file content
   * @returns Validated and normalized content
   * @throws {SongCodeError} E0.2 - Invalid UTF-8 encoding
   */
  read(content: string): string {
    // Validate UTF-8: Check for null bytes
    if (content.includes('\0')) {
      throw new SongCodeError(
        'E0.2',
        'Invalid UTF-8 encoding: file contains null bytes'
      );
    }

    // Validate UTF-8: Check for lone surrogate pairs (invalid UTF-16/UTF-8)
    // In JavaScript strings, valid surrogates come in pairs (high + low)
    // We need to detect LONE surrogates which indicate invalid encoding
    // High surrogates: U+D800 to U+DBFF
    // Low surrogates: U+DC00 to U+DFFF
    for (let i = 0; i < content.length; i++) {
      const code = content.charCodeAt(i);
      
      // Check for high surrogate
      if (code >= 0xd800 && code <= 0xdbff) {
        // High surrogate must be followed by low surrogate
        const nextCode = i + 1 < content.length ? content.charCodeAt(i + 1) : -1;
        if (nextCode < 0xdc00 || nextCode > 0xdfff) {
          throw new SongCodeError(
            'E0.2',
            'Invalid UTF-8 encoding: file contains invalid character sequences'
          );
        }
        // Skip the low surrogate in next iteration
        i++;
      }
      // Check for lone low surrogate (should never appear without high surrogate)
      else if (code >= 0xdc00 && code <= 0xdfff) {
        throw new SongCodeError(
          'E0.2',
          'Invalid UTF-8 encoding: file contains invalid character sequences'
        );
      }
    }

    // Normalize line endings: Convert CRLF to LF
    const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    return normalized;
  }
}
