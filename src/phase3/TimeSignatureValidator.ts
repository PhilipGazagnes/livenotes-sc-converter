import { SongCodeError } from '../errors/SongCodeError';
import { TimeSignature, Measure } from '../types';

/**
 * Validates that measures have valid chord counts for their time signature.
 * 
 * Rules from specification:
 * - beats_per_position = time_signature_numerator / position_count
 * - This division must result in an integer (E3.1.1)
 * - Each `=` remover removes exactly beats_per_position beats
 * - measure_beats = numerator - (remover_count × beats_per_position)
 * - measure_beats must be > 0 (E3.1.2)
 */
export class TimeSignatureValidator {
  /**
   * Validates a single measure against a time signature.
   * 
   * @param measure - Array of chords (tuples), removers (=), and symbols (_, %)
   * @param timeSignature - Time signature {numerator, denominator}
   * @throws {SongCodeError} E3.1.1 if position count doesn't evenly divide beats
   * @throws {SongCodeError} E3.1.2 if removers eliminate all beats
   */
  validate(measure: Measure, timeSignature: TimeSignature): void {
    const totalBeats = timeSignature.numerator;
    const positionCount = measure.length;
    
    // Count removers first
    let removerCount = 0;
    for (const item of measure) {
      const isRemover = item === '=';
      if (isRemover) {
        removerCount++;
      }
    }
    
    // If we have removers and beats don't evenly divide, check if removers
    // would eliminate all beats based on non-remover positions
    if (removerCount > 0 && totalBeats % positionCount !== 0) {
      const nonRemoverCount = positionCount - removerCount;
      if (nonRemoverCount > 0) {
        const beatsPerNonRemover = totalBeats / nonRemoverCount;
        const beatsRemoved = removerCount * beatsPerNonRemover;
        
        // If removers would eliminate all or more beats, prioritize E3.1.2
        if (beatsRemoved >= totalBeats) {
          throw new SongCodeError(
            'E3.1.2',
            'Invalid measure: removers eliminate all beats',
            { 
              context: `${removerCount} removers would remove ${beatsRemoved} beats from ${totalBeats}-beat measure` 
            }
          );
        }
      }
    }
    
    // Check if beats evenly divide by position count
    if (totalBeats % positionCount !== 0) {
      throw new SongCodeError(
        'E3.1.1',
        'Invalid chord positions: chords must evenly divide beats in measure',
        { 
          context: `${totalBeats} beats cannot be evenly divided by ${positionCount} chord positions` 
        }
      );
    }
    
    // Calculate beats per position (only reached if division is valid)
    const beatsPerPosition = totalBeats / positionCount;
    
    // Calculate remaining beats after removals
    const beatsRemoved = removerCount * beatsPerPosition;
    const beatsRemaining = totalBeats - beatsRemoved;
    
    // Check if all beats are removed
    if (beatsRemaining <= 0) {
      throw new SongCodeError(
        'E3.1.2',
        'Invalid measure: removers eliminate all beats',
        { 
          context: `${removerCount} removers remove ${beatsRemoved} beats from ${totalBeats}-beat measure` 
        }
      );
    }
  }
}
