/**
 * PatternParser - Brick 3: Parse pattern definitions
 * 
 * Responsible for:
 * - Parsing pattern definitions (lines starting with $n)
 * - Validating pattern IDs (must be positive integers)
 * - Normalizing pattern content (whitespace around pipes)
 * - Returning a map of pattern ID to pattern content
 */

import { SongCodeError } from '../errors/SongCodeError';

export interface PatternMap {
  [id: string]: string;
}

export class PatternParser {
  /**
   * Parse pattern definitions from SongCode content
   * @param content - The patterns section content
   * @returns PatternMap with pattern ID to content mapping
   */
  parse(content: string): PatternMap {
    const patterns: PatternMap = {};

    if (!content || content.trim() === '') {
      return patterns;
    }

    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;

      const trimmedLine = line.trim();

      // Skip empty lines
      if (trimmedLine === '') continue;

      // Stop when we hit a section (line that doesn't start with $ or @)
      // Section names don't start with special characters
      if (!trimmedLine.startsWith('$') && !trimmedLine.startsWith('@')) {
        // We've hit a section, stop parsing patterns
        break;
      }

      // Skip metadata lines (not patterns)
      if (trimmedLine.startsWith('@')) continue;

      // Parse pattern line - format can be either:
      // $1 A;G;D  (inline)
      // or
      // $1
      // A;G;D    (next line)
      const match = trimmedLine.match(/^\$(\S+)(?:\s+(.+))?$/);
      
      if (!match) {
        throw new SongCodeError(
          'E1.2.1',
          `Invalid pattern format at line ${i + 1}`,
          { line: i + 1 }
        );
      }

      const idStr = match[1];
      let patternContent = match[2]; // May be undefined

      if (!idStr) {
        throw new SongCodeError(
          'E1.2.1',
          `Invalid pattern format at line ${i + 1}`,
          { line: i + 1 }
        );
      }

      // If no inline content, look at next line(s) for multi-line pattern
      if (!patternContent || patternContent.trim() === '') {
        const contentLines: string[] = [];
        // Read all pattern content lines until we hit a blank line or next definition
        while (i + 1 < lines.length) {
          const nextLine = lines[i + 1];
          if (!nextLine || nextLine.trim() === '') {
            // Blank line marks end of pattern
            break;
          }
          const nextTrimmed = nextLine.trim();
          // Stop if we hit another pattern definition, metadata, section marker, modifier, or separator
          if (nextTrimmed.startsWith('$') || 
              nextTrimmed.startsWith('@') ||
              nextTrimmed.startsWith('_') ||
              nextTrimmed.startsWith('--')) {
            break;
          }
          // This is pattern content
          contentLines.push(nextTrimmed);
          i++; // Skip this line since we consumed it
        }
        // Join all content lines with newlines to preserve structure (: line breaks, etc.)
        if (contentLines.length > 0) {
          patternContent = contentLines.join('\n');
        }
      }

      // Validate pattern ID
      const id = this.validatePatternId(idStr, i + 1);

      // Validate pattern content
      if (!patternContent || patternContent.trim() === '') {
        throw new SongCodeError(
          'E1.2.2',
          `Pattern $${id} is empty at line ${i + 1}`,
          { line: i + 1 }
        );
      }

      // Normalize pattern content (whitespace around pipes)
      const normalized = this.normalizePattern(patternContent);

      patterns[id] = normalized;
    }

    return patterns;
  }

  /**
   * Validate pattern ID (must be positive integer)
   */
  private validatePatternId(idStr: string, line: number): string {
    const id = parseInt(idStr, 10);

    // Check if it's a valid number
    if (isNaN(id) || idStr !== id.toString()) {
      throw new SongCodeError(
        'E1.2.1',
        `Pattern ID must be a positive integer, got: $${idStr}`,
        { line }
      );
    }

    // Check if it's positive
    if (id <= 0) {
      throw new SongCodeError(
        'E1.2.1',
        `Pattern ID must be positive, got: $${id}`,
        { line }
      );
    }

    return idStr;
  }

  /**
   * Normalize pattern content:
   * - Collapse multiple spaces to single space
   * - Ensure single space around pipes
   * - Trim leading/trailing whitespace
   */
  private normalizePattern(content: string): string {
    return content
      .split('|')
      .map(segment => segment.trim())
      .filter(segment => segment !== '')
      .join(' | ');
  }
}
