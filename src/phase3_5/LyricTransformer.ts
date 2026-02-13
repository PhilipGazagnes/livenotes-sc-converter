/**
 * Phase 3.5 - Brick 16: LyricTransformer
 * 
 * Responsible for:
 * - Transforming raw lyric strings into structured LyricObject array
 * - Parsing _N measure count markers
 * - Detecting and extracting special style markers (***info***, :::musician:::)
 * - Setting appropriate style: 'normal', 'info', or 'musician'
 * 
 * This bridge phase transforms Phase 1 output (lyrics as string[])
 * into the final structure needed for LivenotesJSON (lyrics as LyricObject[]).
 */

import { LyricObject } from '../types';

export class LyricTransformer {
  /**
   * Transform raw lyric strings into structured LyricObject array
   * 
   * @param lyrics - Raw lyric strings from SectionParser (e.g., ["First line _2", "Second _2"])
   * @returns Array of LyricObject with parsed text, measures, and style
   */
  transform(lyrics: string[]): LyricObject[] {
    if (lyrics.length === 0) {
      return [];
    }

    return lyrics.map(lyric => this.transformLine(lyric));
  }

  /**
   * Transform a single lyric line
   */
  private transformLine(lyric: string): LyricObject {
    // Extract measure count (_N marker at end)
    const measureMatch = lyric.match(/_(\d+)$/);
    if (!measureMatch || !measureMatch[1]) {
      throw new Error(`Lyric line missing measure count: "${lyric}"`);
    }

    const measures = parseInt(measureMatch[1], 10);
    
    // Remove the _N marker from the text
    let text = lyric.substring(0, lyric.length - measureMatch[0].length).trim();

    // Detect style markers
    let style: 'normal' | 'info' | 'musician' = 'normal';

    // Check for info marker: ***text***
    const infoMatch = text.match(/^\*\*\*(.*)\*\*\*$/);
    if (infoMatch) {
      text = infoMatch[1]!.trim();
      style = 'info';
    }

    // Check for musician marker: :::text:::
    const musicianMatch = text.match(/^:::(.*)::: *$/);
    if (musicianMatch) {
      text = musicianMatch[1]!.trim();
      style = 'musician';
    }

    return {
      text,
      measures,
      style,
    };
  }
}
