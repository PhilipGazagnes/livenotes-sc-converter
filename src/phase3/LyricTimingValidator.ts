import { SongCodeError } from '../errors/SongCodeError';

/**
 * Validates that lyric timing markers (_N) are correctly formatted and sum to expected total.
 * 
 * Each lyric line should end with _N where N is the number of measures.
 * Special markers (***info***, :::musician:::) are allowed but still need _N.
 * Empty lines (just _N) are valid for instrumental sections.
 */
export class LyricTimingValidator {
  /**
   * Validates all lyric lines have proper timing markers and sum to total measures.
   * 
   * @param lyrics - Array of lyric lines (each should end with _N)
   * @param totalMeasures - Expected total measure count
   * @throws {SongCodeError} E3.4.1 if lyric line missing measure count
   * @throws {SongCodeError} E3.4.2 if measure count format is invalid
   * @throws {SongCodeError} E3.4.3 if measure count is zero or negative
   * @throws {SongCodeError} E3.4.4 if sum doesn't match total
   */
  validate(lyrics: string[], totalMeasures: number): void {
    let sumMeasures = 0;
    
    for (let i = 0; i < lyrics.length; i++) {
      const lyric = lyrics[i];
      
      // Handle undefined (shouldn't happen but satisfy TypeScript)
      if (!lyric) {
        throw new SongCodeError(
          'E3.4.1',
          'Lyric line missing measure count',
          {
            line: i + 1,
            context: 'Empty lyric line',
          }
        );
      }
      
      // Extract measure count from end of lyric line
      // Pattern: ends with _N where N is a positive integer
      const match = lyric.match(/_(\d+)$/);
      
      if (!match) {
        // Check if there's a _ followed by non-digits (invalid format)
        if (/_[^\d]/.test(lyric) || lyric.endsWith('_')) {
          throw new SongCodeError(
            'E3.4.2',
            'Invalid measure count format',
            {
              line: i + 1,
              context: `Expected positive integer after _: "${lyric}"`,
            }
          );
        }
        
        // Otherwise, missing measure count entirely
        throw new SongCodeError(
          'E3.4.1',
          'Lyric line missing measure count',
          {
            line: i + 1,
            context: `Lyric line must end with _N: "${lyric}"`,
          }
        );
      }
      
      const measureCountStr = match[1];
      
      // Ensure we have the captured group (TypeScript strict check)
      if (!measureCountStr) {
        throw new SongCodeError(
          'E3.4.2',
          'Invalid measure count format',
          {
            line: i + 1,
            context: `Expected positive integer after _: "${lyric}"`,
          }
        );
      }
      
      const measureCount = parseInt(measureCountStr, 10);
      
      // Check if parsing failed (though regex should prevent this)
      if (isNaN(measureCount)) {
        throw new SongCodeError(
          'E3.4.2',
          'Invalid measure count format',
          {
            line: i + 1,
            context: `Expected positive integer after _: "${lyric}"`,
          }
        );
      }
      
      // Check if measure count is zero or negative
      if (measureCount <= 0) {
        throw new SongCodeError(
          'E3.4.3',
          'Measure count must be positive',
          {
            line: i + 1,
            context: `Measure count must be > 0, got ${measureCount} in: "${lyric}"`,
          }
        );
      }
      
      sumMeasures += measureCount;
    }
    
    // Check if sum matches expected total
    if (sumMeasures !== totalMeasures) {
      throw new SongCodeError(
        'E3.4.4',
        'Lyric measure count total does not match expected',
        {
          context: `Expected ${totalMeasures} total measures, but lyrics sum to ${sumMeasures}`,
        }
      );
    }
  }
}
