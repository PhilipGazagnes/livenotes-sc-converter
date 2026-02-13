import { Measure, PrompterItem } from '../types';
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

        if (typeof itemA === 'string' || typeof itemB === 'string') {
          if (itemA !== itemB) return false;
        } else if (Array.isArray(itemA) && Array.isArray(itemB)) {
          if (itemA[0] !== itemB[0] || itemA[1] !== itemB[1]) return false;
        } else {
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
    let previousChord: Measure | null = null;

    for (const measure of measures) {
      const newMeasure: Measure = [];
      
      for (const chord of measure) {
        if (chord === '%') {
          // Repeat last chord/measure
          if (previousChord === null) {
            throw new SongCodeError(
              'E4.1.1',
              'Repeat symbol (%) used with no previous chord to repeat',
              { context: `measure: ${JSON.stringify(measure)}` }
            );
          }
          // Add all chords from previous measure
          newMeasure.push(...previousChord);
        } else {
          newMeasure.push(chord);
        }
      }
      
      resolved.push(newMeasure);
      
      // Update previous chord if this measure has real chords
      if (newMeasure.length > 0) {
        previousChord = newMeasure;
      }
    }

    return resolved;
  }
}
