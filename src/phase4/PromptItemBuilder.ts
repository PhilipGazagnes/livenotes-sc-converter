import { Measure, PrompterItem, ChordPosition } from '../types';
import { SongCodeError } from '../errors/SongCodeError';

/**
 * Phase 4 - Brick 14: PromptItemBuilder
 * 
 * Builds final prompter items from stacked measures and paired lyrics.
 * Handles tempo changes, content items, and % repeat symbol resolution.
 */
export class PromptItemBuilder {
  /**
   * Build a tempo change item
   */
  buildTempoItem(bpm: number, timeSignature: [number, number]): PrompterItem {
    return {
      type: 'tempo',
      bpm,
      time: `${timeSignature[0]}/${timeSignature[1]}`,
    };
  }

  /**
   * Build a content item with chords and lyrics
   * Implements Substep 4.3.6: Pattern Optimization Algorithm
   */
  buildContentItem(
    measures: Measure[], 
    lyrics: string, 
    isInfo?: boolean, 
    isMusician?: boolean
  ): PrompterItem {
    // Determine style based on lyric type
    let style = 'default';
    let cleanedLyrics = lyrics;
    
    if (isInfo) {
      style = 'info';
      // Strip *** markers from lyrics text
      cleanedLyrics = lyrics.replace(/^\*\*\*|\*\*\*$/g, '');
    } else if (isMusician) {
      style = 'musicianInfo';
      // Strip ::: markers from lyrics text
      cleanedLyrics = lyrics.replace(/^:::|:::$/g, '');
    }

    // Apply pattern optimization (Substep 4.3.6)
    const optimized = this.optimizePattern(measures);

    return {
      type: 'content',
      style,
      chords: [{
        repeats: optimized.repeats,
        pattern: optimized.pattern,
      }],
      lyrics: cleanedLyrics,
    };
  }

  /**
   * Optimize pattern by detecting repetitions
   * Substep 4.3.6: Pattern Optimization Algorithm
   * 
   * Algorithm:
   * while pattern.length is even AND pattern.length > 1:
   *   first_half = pattern[0...length/2]
   *   second_half = pattern[length/2...end]
   *   if first_half equals second_half:
   *     pattern = first_half
   *     repeats = repeats * 2
   *   else:
   *     break
   */
  private optimizePattern(measures: Measure[]): { repeats: number; pattern: Measure[] } {
    let repeats = 1;
    let pattern = measures;

    while (pattern.length > 1 && pattern.length % 2 === 0) {
      const halfLength = pattern.length / 2;
      const firstHalf = pattern.slice(0, halfLength);
      const secondHalf = pattern.slice(halfLength);

      // Check if both halves are equal
      if (this.arraysEqual(firstHalf, secondHalf)) {
        pattern = firstHalf;
        repeats = repeats * 2;
      } else {
        break;
      }
    }

    return { repeats, pattern };
  }

  /**
   * Deep equality check for measure arrays
   */
  private arraysEqual(a: Measure[], b: Measure[]): boolean {
    if (a.length !== b.length) return false;

    for (let i = 0; i < a.length; i++) {
      const measureA = a[i];
      const measureB = b[i];
      
      if (!measureA || !measureB) return false;
      if (measureA.length !== measureB.length) return false;

      for (let j = 0; j < measureA.length; j++) {
        const itemA = measureA[j];
        const itemB = measureB[j];

        // Both are strings (special symbols)
        if (typeof itemA === 'string' && typeof itemB === 'string') {
          if (itemA !== itemB) return false;
        }
        // Both are arrays (chords)
        else if (Array.isArray(itemA) && Array.isArray(itemB)) {
          if (itemA.length !== itemB.length) return false;
          if (itemA[0] !== itemB[0]) return false;
          if (itemA.length === 2 && itemA[1] !== itemB[1]) return false;
        }
        // One is string, one is array - not equal
        else {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Resolve % repeat symbols to previous chord
   * Error E4.1.1: % symbol with no previous chord to repeat
   */
  resolveRepeatSymbols(measures: Measure[]): Measure[] {
    const resolved: Measure[] = [];
    let previousMeasure: Measure | null = null;

    for (const measure of measures) {
      const newMeasure: Measure = [];
      let previousChordInMeasure: ChordPosition | null = null;
      
      for (const chord of measure) {
        // Check if this is a repeat symbol
        const isRepeatSymbol = chord === '%';
        
        if (isRepeatSymbol) {
          // In a multi-position measure, repeat the previous chord position
          // In a single-position measure, this shouldn't happen as % is already resolved
          if (previousChordInMeasure !== null) {
            // Multi-position: repeat last chord in this measure
            newMeasure.push(previousChordInMeasure);
          } else if (previousMeasure !== null && previousMeasure.length > 0) {
            // Single-position or first position: repeat entire previous measure
            newMeasure.push(...previousMeasure);
          } else {
            throw new SongCodeError(
              'E4.1.1',
              'Repeat symbol (%) used with no previous chord to repeat',
              { context: `measure: ${JSON.stringify(measure)}` }
            );
          }
        } else {
          newMeasure.push(chord);
          previousChordInMeasure = chord;
        }
      }
      
      resolved.push(newMeasure);
      
      // Update previous measure
      if (newMeasure.length > 0) {
        previousMeasure = newMeasure;
      }
    }

    return resolved;
  }
}
