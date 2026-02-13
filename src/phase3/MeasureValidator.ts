import { SongCodeError } from '../errors/SongCodeError';
import { Section } from '../phase1/SectionParser';

/**
 * Validates that section measure counts match lyric measure counts after applying modifiers.
 * 
 * Formula:
 * final_measures = before_measures + (pattern_measures × repeat - cutStart_measures - cutEnd_measures) + after_measures
 * 
 * The final_measures must equal lyric_measures.
 */
export class MeasureValidator {
  /**
   * Validates that a section's pattern measures (after modifiers) match its lyric measures.
   * 
   * @param section - Section object with modifiers
   * @param patternMeasures - Number of measures in the main pattern
   * @param lyricMeasures - Total measures from lyrics (sum of _N markers)
   * @param beforeMeasures - Optional measures from _before pattern
   * @param afterMeasures - Optional measures from _after pattern
   * @throws {SongCodeError} E3.2.1 if measure counts don't match
   */
  validate(
    section: Section,
    patternMeasures: number,
    lyricMeasures: number,
    beforeMeasures: number = 0,
    afterMeasures: number = 0
  ): void {
    // Calculate final measure count after applying all modifiers
    let finalMeasures = patternMeasures;
    
    // Apply _repeat modifier
    if (section.repeat) {
      finalMeasures *= section.repeat;
    }
    
    // Apply _cutStart modifier (subtract measures + beats)
    if (section.cutStart) {
      const [measures, beats] = section.cutStart;
      finalMeasures -= measures;
      // If beats > 0, that represents a partial measure cut, so subtract 1 more
      if (beats > 0) {
        finalMeasures -= 1;
      }
    }
    
    // Apply _cutEnd modifier (subtract measures + beats)
    if (section.cutEnd) {
      const [measures, beats] = section.cutEnd;
      finalMeasures -= measures;
      // If beats > 0, that represents a partial measure cut, so subtract 1 more
      if (beats > 0) {
        finalMeasures -= 1;
      }
    }
    
    // Add _before measures
    finalMeasures += beforeMeasures;
    
    // Add _after measures
    finalMeasures += afterMeasures;
    
    // Check if final measures match lyric measures
    if (finalMeasures !== lyricMeasures) {
      throw new SongCodeError(
        'E3.2.1',
        'Section measure count mismatch',
        {
          context: `Section '${section.name}': expected ${finalMeasures} measures but lyrics have ${lyricMeasures} measures`,
        }
      );
    }
  }
}
