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
   */
  buildContentItem(measures: Measure[], lyrics: string, sectionName: string): PrompterItem {
    return {
      type: 'content',
      style: sectionName.toLowerCase(),
      chords: [{
        repeats: 1,
        pattern: measures,
      }],
      lyrics,
    };
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
