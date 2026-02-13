/**
 * PatternTransformer - Brick 6: Transform pattern strings to JSON
 * 
 * Responsible for:
 * - Parsing pattern syntax (measures, chords, symbols)
 * - Handling loops ([...])
 * - Handling line breaks (:)
 * - Handling special symbols (%, _, =)
 * - Converting to nested array structure
 * - Counting measures
 */

import { SongCodeError } from '../errors/SongCodeError';
import { ChordParser } from './ChordParser';

export type PatternItem = string | Array<[string, string] | string>;
export type PatternJSON = Array<PatternItem> | null;

export interface TransformResult {
  json: PatternJSON;
  measures: number;
}

export class PatternTransformer {
  private chordParser: ChordParser;

  constructor() {
    this.chordParser = new ChordParser();
  }

  /**
   * Transform a pattern string to JSON structure
   * @param pattern - Pattern string (e.g., "A;G;D", "[A;G]3")
   * @returns TransformResult with json and measure count
   */
  transform(pattern: string): TransformResult {
    if (!pattern || pattern.trim() === '') {
      return { json: null, measures: 0 };
    }

    const trimmed = pattern.trim();
    
    // Check for mismatched brackets
    const openCount = (trimmed.match(/\[/g) || []).length;
    const closeCount = (trimmed.match(/]/g) || []).length;
    
    if (openCount !== closeCount) {
      throw new SongCodeError('E2.1.3', 'Mismatched loop brackets');
    }

    // Parse the pattern
    const json = this.parsePattern(trimmed);
    
    // Count measures
    const measures = this.countMeasures(json);

    return { json, measures };
  }

  /**
   * Parse pattern string into JSON array
   */
  private parsePattern(pattern: string): PatternJSON {
    const result: PatternItem[] = [];
    let i = 0;

    while (i < pattern.length) {
      const char = pattern.charAt(i);

      if (char === '[') {
        // Start of loop
        const { loopContent, endIndex, repeatCount } = this.parseLoop(pattern, i);
        result.push('loopStart');
        result.push(...loopContent);
        result.push(`loopEnd:${repeatCount}`);
        i = endIndex; // Don't skip - let next iteration handle what's after the loop
      } else if (char === ':') {
        // Line break
        result.push('newLine');
        i++;
      } else if (char === ';') {
        // Measure separator (skip)
        i++;
      } else if (char === ' ' || char === '\t' || char === '\n') {
        // Whitespace (skip unless parsing measure content)
        i++;
      } else {
        // Parse measure
        const { measure, endIndex } = this.parseMeasure(pattern, i);
        result.push(measure);
        i = endIndex;
      }
    }

    return result.length > 0 ? result : null;
  }

  /**
   * Parse a loop structure [...]N
   */
  private parseLoop(pattern: string, startIndex: number): {
    loopContent: PatternItem[];
    endIndex: number;
    repeatCount: number;
  } {
    // Find matching close bracket
    let depth = 0;
    let closeIndex = -1;

    for (let i = startIndex; i < pattern.length; i++) {
      if (pattern.charAt(i) === '[') depth++;
      if (pattern.charAt(i) === ']') {
        depth--;
        if (depth === 0) {
          closeIndex = i;
          break;
        }
      }
    }

    if (closeIndex === -1) {
      throw new SongCodeError('E2.1.3', 'Mismatched loop brackets: missing ]');
    }

    // Extract loop content
    const loopStr = pattern.substring(startIndex + 1, closeIndex);
    const loopContent = this.parsePattern(loopStr);

    // Parse repeat count after ]
    let endIndex = closeIndex + 1;
    let repeatStr = '';
    
    while (endIndex < pattern.length && /\d/.test(pattern.charAt(endIndex))) {
      repeatStr += pattern.charAt(endIndex);
      endIndex++;
    }

    if (repeatStr === '') {
      throw new SongCodeError('E2.1.4', 'Loop without repeat count');
    }

    const repeatCount = parseInt(repeatStr, 10);

    return {
      loopContent: loopContent || [],
      endIndex,
      repeatCount
    };
  }

  /**
   * Parse a single measure (until ; or : or [ or end)
   */
  private parseMeasure(pattern: string, startIndex: number): {
    measure: PatternItem;
    endIndex: number;
  } {
    let content = '';
    let i = startIndex;

    // Collect content until delimiter
    while (i < pattern.length) {
      const char = pattern.charAt(i);
      if (char === ';' || char === ':' || char === '[') {
        break;
      }
      content += char;
      i++;
    }

    content = content.trim();

    // Check for special single-character measures
    if (content === '%') {
      return { measure: ['%'], endIndex: i };
    }
    if (content === '_') {
      return { measure: ['_'], endIndex: i };
    }
    if (content === '-') {
      return { measure: ['-'], endIndex: i };
    }

    // Parse chords and removers
    const items = content.split(/\s+/).filter(s => s !== '');
    const measure: Array<[string, string] | string> = [];
    let hasChord = false;

    for (let j = 0; j < items.length; j++) {
      const item = items[j];
      if (!item) continue;

      if (item === '=') {
        // Remover must come after at least one chord
        if (!hasChord) {
          throw new SongCodeError('E2.1.2', 'Remover "=" must be at end of measure after chords');
        }
        measure.push('=');
      } else {
        // Parse as chord
        const chord = this.chordParser.parse(item);
        measure.push(chord);
        hasChord = true;
      }
    }

    return { measure, endIndex: i };
  }

  /**
   * Count total measures in pattern JSON
   */
  private countMeasures(json: PatternJSON): number {
    if (!json) return 0;

    let count = 0;
    let i = 0;

    while (i < json.length) {
      const item = json[i];

      if (typeof item === 'string') {
        if (item === 'loopStart') {
          // Find matching loopEnd and count loop measures
          const loopMeasures: PatternItem[] = [];
          i++;
          
          while (i < json.length && !this.isLoopEnd(json[i])) {
            loopMeasures.push(json[i]!);
            i++;
          }

          // Count measures in loop
          const loopCount = this.countMeasures(loopMeasures);
          
          // Get repeat count from loopEnd
          if (i < json.length && this.isLoopEnd(json[i])) {
            const repeatCount = this.extractRepeatCount(json[i] as string);
            count += loopCount * repeatCount;
          }
        } else if (item !== 'newLine' && !this.isLoopEnd(item)) {
          // Unknown string item, skip
        }
      } else if (Array.isArray(item)) {
        // This is a measure
        count++;
      }

      i++;
    }

    return count;
  }

  private isLoopEnd(item: PatternItem | undefined): boolean {
    return typeof item === 'string' && item.startsWith('loopEnd:');
  }

  private extractRepeatCount(loopEnd: string): number {
    const match = loopEnd.match(/loopEnd:(\d+)/);
    return match ? parseInt(match[1]!, 10) : 1;
  }
}
