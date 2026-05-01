import { SongCodeError } from '../errors/SongCodeError';

/**
 * Validates lyric timing markers (_N) when present.
 *
 * Permissive mode: measure counts are optional on each lyric line.
 * - If ALL lyrics in a section have counts → validates that they sum to expected total.
 * - If ANY lyric is missing a count → skips sum validation (measures will be null for those lines).
 */
export class LyricTimingValidator {
  /**
   * Validates lyric timing for a section.
   *
   * Only performs sum validation when every lyric line has a measure count.
   * Partial or absent counts are accepted silently.
   *
   * @param lyrics - Array of raw lyric strings from SectionParser
   * @param totalMeasures - Expected total measure count for the section
   * @throws {SongCodeError} E3.4.3 if a measure count is zero or negative
   * @throws {SongCodeError} E3.4.4 if all lyrics have counts but they don't sum to totalMeasures
   */
  validate(lyrics: string[], totalMeasures: number): void {
    const allHaveCounts = lyrics.every(l => /_\d+$/.test(l));

    if (!allHaveCounts) {
      return; // Permissive: skip validation when some counts are absent
    }

    let sumMeasures = 0;

    for (let i = 0; i < lyrics.length; i++) {
      const lyric = lyrics[i];
      if (!lyric) continue;

      const match = lyric.match(/_(\d+)$/);
      if (!match || !match[1]) continue;

      const measureCount = parseInt(match[1], 10);

      if (isNaN(measureCount) || measureCount <= 0) {
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
