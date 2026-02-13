import { PatternJSON, Measure } from '../types';

/**
 * Expands patterns by resolving loops and removing line break markers.
 * 
 * Transformations:
 * - Expands loops: `loopStart ... loopEnd:N` → repeated N times
 * - Removes newLine markers (used for visual formatting in SongCode)
 * - Returns flat array of measures only
 */
export class PatternExpander {
  /**
   * Expands a pattern JSON by resolving loops and removing markers.
   * 
   * @param pattern - Pattern JSON with possible loops and newLine markers
   * @returns Flat array of measures (no loops or markers)
   */
  expand(pattern: PatternJSON): Measure[] {
    const result: Measure[] = [];
    let i = 0;
    
    while (i < pattern.length) {
      const element = pattern[i];
      
      if (element === 'loopStart') {
        // Find matching loopEnd
        const loopContent: Measure[] = [];
        i++; // Move past loopStart
        
        while (i < pattern.length) {
          const item = pattern[i];
          
          if (typeof item === 'string' && item.startsWith('loopEnd:')) {
            // Extract repeat count
            const repeatCount = parseInt(item.split(':')[1] || '1', 10);
            
            // Repeat loop content N times
            for (let j = 0; j < repeatCount; j++) {
              result.push(...loopContent);
            }
            
            i++; // Move past loopEnd
            break;
          } else if (item === 'newLine') {
            // Skip newLine markers inside loop
            i++;
          } else if (typeof item !== 'string' && item !== undefined) {
            // It's a measure
            loopContent.push(item);
            i++;
          } else {
            // Unexpected marker, skip it
            i++;
          }
        }
      } else if (element === 'newLine') {
        // Skip newLine markers
        i++;
      } else if (typeof element !== 'string' && element !== undefined) {
        // It's a measure, add it to result
        result.push(element);
        i++;
      } else {
        // Any other marker (shouldn't happen), skip it
        i++;
      }
    }
    
    return result;
  }
}
