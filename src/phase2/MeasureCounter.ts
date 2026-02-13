/**
 * MeasureCounter - Brick 7: Count measures in pattern JSON
 * 
 * Responsible for:
 * - Counting total measures in a pattern
 * - Handling loops (multiply by repeat count)
 * - Ignoring line breaks
 * - Returning measure count
 */

import { PatternJSON, PatternItem } from './PatternTransformer';

export class MeasureCounter {
  /**
   * Count total measures in pattern JSON
   * @param json - Pattern JSON structure
   * @returns Total number of measures
   */
  count(json: PatternJSON): number {
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
          const loopCount = this.count(loopMeasures);
          
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
