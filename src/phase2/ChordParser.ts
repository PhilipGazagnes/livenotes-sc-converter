/**
 * ChordParser - Brick 5: Parse chord notation
 * 
 * Responsible for:
 * - Parsing chord strings (e.g., "Am7", "F#maj7")
 * - Splitting into base chord and extension
 * - Validating chord notation
 * - Returning tuple [base, extension]
 */

import { SongCodeError } from '../errors/SongCodeError';

export type Chord = [string, string];

export class ChordParser {
  // Valid chord roots (note names)
  private static readonly VALID_ROOTS = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G'
  ];

  // Valid accidentals
  private static readonly VALID_ACCIDENTALS = ['#', 'b'];

  /**
   * Parse a chord string into [base, extension]
   * @param chord - The chord string (e.g., "Am7", "F#maj7")
   * @returns Tuple [base, extension]
   */
  parse(chord: string): Chord {
    if (!chord || chord.trim() === '') {
      throw new SongCodeError('E2.1.1', 'Invalid chord notation: empty chord');
    }

    const trimmed = chord.trim();

    // Parse the chord: root + optional accidental + optional 'm' + extension
    // Examples: A, Am, A#, A#m, A7, Am7, Amaj7, A#m7b5
    
    // Extract root (first character must be A-G)
    const root = trimmed.charAt(0);
    if (!ChordParser.VALID_ROOTS.includes(root)) {
      throw new SongCodeError('E2.1.1', `Invalid chord notation: "${chord}" - must start with A-G`);
    }

    let pos = 1;
    let base = root;

    // Check for accidental (# or b)
    if (pos < trimmed.length && ChordParser.VALID_ACCIDENTALS.includes(trimmed.charAt(pos))) {
      base += trimmed.charAt(pos);
      pos++;
    }

    // Check for minor ('m') - but not if followed by 'a' (which would be 'maj')
    if (pos < trimmed.length && trimmed.charAt(pos) === 'm') {
      const nextChar = pos + 1 < trimmed.length ? trimmed.charAt(pos + 1) : '';
      if (nextChar !== 'a') {
        base += 'm';
        pos++;
      }
    }

    // Everything else is the extension
    const extension = pos < trimmed.length ? trimmed.substring(pos) : '';

    return [base, extension];
  }
}
