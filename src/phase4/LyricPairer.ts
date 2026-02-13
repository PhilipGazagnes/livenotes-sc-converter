/**
 * Represents a parsed lyric with its measure count and special markers.
 */
export interface LyricPair {
  text: string;
  measures: number;
  isInfo?: boolean;
  isMusician?: boolean;
}

/**
 * Pairs lyrics with their measure counts.
 * 
 * Extracts text, measure count (_N), and special markers:
 * - ***text***: Info marker (instrumental, solo, etc.)
 * - :::text:::: Musician marker (watch drummer, guitar enters, etc.)
 */
export class LyricPairer {
  /**
   * Pairs lyrics with measure counts.
   * 
   * @param lyrics - Array of lyric lines (each ending with _N)
   * @param measureCount - Total measure count (for validation)
   * @returns Array of lyric pairs with text and measure count
   */
  pair(lyrics: string[], measureCount: number): LyricPair[] {
    // Handle empty lyrics (instrumental section)
    if (lyrics.length === 0) {
      return [{ text: '', measures: measureCount }];
    }
    
    const pairs: LyricPair[] = [];
    
    for (const lyric of lyrics) {
      // Extract measure count from end: _N
      const match = lyric.match(/_(\d+)$/);
      
      if (!match) {
        // This shouldn't happen if validation passed
        continue;
      }
      
      const measures = parseInt(match[1] || '0', 10);
      
      // Remove _N from end to get text
      const text = lyric.substring(0, lyric.length - match[0].length).trim();
      
      // Check for special markers
      const isInfo = /^\*\*\*.*\*\*\*$/.test(text);
      const isMusician = /^:::.*:::$/.test(text);
      
      const pair: LyricPair = {
        text,
        measures,
      };
      
      if (isInfo) {
        pair.isInfo = true;
      }
      
      if (isMusician) {
        pair.isMusician = true;
      }
      
      pairs.push(pair);
    }
    
    return pairs;
  }
}
