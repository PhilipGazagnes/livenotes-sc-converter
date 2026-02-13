/**
 * SectionParser - Brick 4: Parse song sections
 * 
 * Responsible for:
 * - Parsing section names and comments (name!comment)
 * - Parsing patterns (inline chords or pattern references)
 * - Parsing modifiers (_repeat, _cutStart, _cutEnd, _before, _after)
 * - Parsing time overrides (@bpm, @time)
 * - Parsing lyrics (after -- separator)
 * - Returning array of section objects
 */

import { SongCodeError } from '../errors/SongCodeError';

export interface SectionModifier {
  sc: string;
  json: null;
  measures: number;
}

export interface SectionTime {
  bpm?: number;
  numerator?: number;
  denominator?: number;
}

export interface Section {
  name: string;
  comment?: string;
  pattern: string;
  lyrics: string[];
  repeat?: number;
  cutStart?: [number, number];
  cutEnd?: [number, number];
  before?: SectionModifier;
  after?: SectionModifier;
  time?: SectionTime;
}

export class SectionParser {
  /**
   * Parse sections from SongCode content
   * @param content - The sections content
   * @returns Array of Section objects
   */
  parse(content: string): Section[] {
    const sections: Section[] = [];

    if (!content || content.trim() === '') {
      return sections;
    }

    const lines = content.split('\n');
    let i = 0;

    while (i < lines.length) {
      // Skip empty lines and non-section lines (metadata, patterns)
      while (i < lines.length) {
        const line = lines[i];
        if (!line || line.trim() === '') {
          i++;
          continue;
        }
        const trimmed = line.trim();
        // Skip metadata lines
        if (trimmed.startsWith('@')) {
          i++;
          continue;
        }
        // Skip pattern definition lines (both $n and the content line)
        // Pattern definitions have content on the next line (chord sequences)
        // Pattern references (in sections) are followed by -- or other section content
        if (trimmed.startsWith('$')) {
          i++; // Skip the $n line
          // Check if next line is pattern content (chord sequence, not separator or modifier)
          if (i < lines.length) {
            const nextLine = lines[i];
            if (nextLine) {
              const nextTrimmed = nextLine.trim();
              // Pattern content: not empty, not $ or @, not separator (--), not modifier (_)
              const isPatternContent = nextTrimmed && 
                                      !nextTrimmed.startsWith('$') && 
                                      !nextTrimmed.startsWith('@') &&
                                      !nextTrimmed.startsWith('--') &&
                                      !nextTrimmed.startsWith('_');
              if (isPatternContent) {
                i++; // Skip the pattern content line
              }
            }
          }
          continue;
        }
        // Found a potential section start
        break;
      }

      if (i >= lines.length) break;

      // Start of a section - collect all lines until next section or end
      const sectionLines: string[] = [];
      let foundSeparator = false;

      // First line is the section name - validate it doesn't start with invalid chars
      const firstLine = lines[i]!;
      const firstTrimmed = firstLine.trim();
      if (firstTrimmed.startsWith('_') || firstTrimmed.startsWith('--')) {
        throw new SongCodeError('E1.4.2', 'Section name cannot be empty', {
          line: i + 1,
        });
      }

      sectionLines.push(firstLine);
      i++;

      // Collect lines until we find a new section
      while (i < lines.length) {
        const line = lines[i]!;
        const trimmed = line.trim();

        // Track if we've seen the separator
        if (trimmed === '--') {
          foundSeparator = true;
        }

        // Check if this is the start of a new section:
        // - After we've seen the separator
        // - Line is non-empty
        // - Doesn't start with special characters
        // - Previous line was empty (blank line between sections)
        const prevLine = i > 0 ? lines[i - 1] : '';
        const prevEmpty = !prevLine || prevLine.trim() === '';
        
        const looksLikeNewSection =
          foundSeparator &&
          trimmed !== '' &&
          prevEmpty &&
          !trimmed.startsWith('$') &&
          !trimmed.startsWith('@') &&
          !trimmed.startsWith('_') &&
          !trimmed.startsWith('--');

        if (looksLikeNewSection) {
          // This is a new section, don't include this line
          break;
        }

        sectionLines.push(line);
        i++;
      }

      // Parse this section
      const section = this.parseSection(sectionLines.join('\n'));
      sections.push(section);
    }

    return sections;
  }

  /**
   * Parse a single section block
   */
  private parseSection(block: string): Section {
    const lines = block.split('\n');
    let lineIndex = 0;

    // Parse section name (first non-empty line)
    let name = '';
    let comment: string | undefined;

    while (lineIndex < lines.length) {
      const line = lines[lineIndex];
      if (!line) {
        lineIndex++;
        continue;
      }
      
      const trimmed = line.trim();
      if (trimmed === '') {
        lineIndex++;
        continue;
      }

      // Parse name and optional comment
      const nameMatch = trimmed.match(/^([^!]+)(?:!(.+))?$/);
      if (nameMatch) {
        name = nameMatch[1]?.trim() || '';
        comment = nameMatch[2]?.trim();
      }
      lineIndex++;
      break;
    }

    if (!name) {
      throw new SongCodeError('E1.4.2', 'Section name cannot be empty', {
        line: 1,
      });
    }

    // Parse time overrides, pattern, and modifiers
    let pattern = '';
    const time: SectionTime = {};
    let repeat: number | undefined;
    let cutStart: [number, number] | undefined;
    let cutEnd: [number, number] | undefined;
    let before: SectionModifier | undefined;
    let after: SectionModifier | undefined;
    let separatorFound = false;

    while (lineIndex < lines.length) {
      const line = lines[lineIndex];
      if (!line) {
        lineIndex++;
        continue;
      }
      
      const trimmed = line.trim();

      if (trimmed === '') {
        lineIndex++;
        continue;
      }

      // Check for lyric separator
      if (trimmed === '--') {
        separatorFound = true;
        lineIndex++;
        break;
      }

      // Parse @bpm override
      if (trimmed.startsWith('@bpm ')) {
        const bpmStr = trimmed.substring(5).trim();
        time.bpm = parseInt(bpmStr, 10);
        lineIndex++;
        continue;
      }

      // Parse @time override
      if (trimmed.startsWith('@time ')) {
        const timeStr = trimmed.substring(6).trim();
        const match = timeStr.match(/^(\d+)\/(\d+)$/);
        if (match && match[1] && match[2]) {
          time.numerator = parseInt(match[1], 10);
          time.denominator = parseInt(match[2], 10);
        }
        lineIndex++;
        continue;
      }

      // Parse _repeat modifier
      if (trimmed.startsWith('_repeat ')) {
        const value = trimmed.substring(8).trim();
        repeat = parseInt(value, 10);
        lineIndex++;
        continue;
      }

      // Parse _cutStart modifier
      if (trimmed.startsWith('_cutStart ')) {
        const value = trimmed.substring(10).trim();
        cutStart = this.parseCutModifier(value);
        lineIndex++;
        continue;
      }

      // Parse _cutEnd modifier
      if (trimmed.startsWith('_cutEnd ')) {
        const value = trimmed.substring(8).trim();
        cutEnd = this.parseCutModifier(value);
        lineIndex++;
        continue;
      }

      // Parse _before modifier
      if (trimmed.startsWith('_before ')) {
        const value = trimmed.substring(8).trim();
        before = { sc: value, json: null, measures: 0 };
        lineIndex++;
        continue;
      }

      // Parse _after modifier
      if (trimmed.startsWith('_after ')) {
        const value = trimmed.substring(7).trim();
        after = { sc: value, json: null, measures: 0 };
        lineIndex++;
        continue;
      }

      // Otherwise, it must be the pattern
      if (!pattern) {
        pattern = trimmed;
      } else {
        // Multi-line pattern - concatenate with semicolon
        pattern += ';' + trimmed;
      }
      lineIndex++;
      continue;
    }

    if (!separatorFound) {
      throw new SongCodeError('E1.4.1', 'Missing lyric separator "--"', {
        line: lineIndex,
      });
    }

    // Parse lyrics (everything after --)
    const lyrics: string[] = [];
    while (lineIndex < lines.length) {
      const line = lines[lineIndex];
      if (line !== undefined) {
        const trimmed = line.trim();
        if (trimmed !== '') {
          lyrics.push(trimmed);
        }
      }
      lineIndex++;
    }

    // Build section object
    const section: Section = {
      name,
      pattern,
      lyrics,
    };

    if (comment) section.comment = comment;
    if (repeat !== undefined) section.repeat = repeat;
    if (cutStart) section.cutStart = cutStart;
    if (cutEnd) section.cutEnd = cutEnd;
    if (before) section.before = before;
    if (after) section.after = after;
    if (Object.keys(time).length > 0) section.time = time;

    return section;
  }

  /**
   * Parse cut modifier value (e.g., "2" -> [2, 0] or "1-2" -> [1, 2])
   */
  private parseCutModifier(value: string): [number, number] {
    const match = value.match(/^(\d+)(?:-(\d+))?$/);
    if (match) {
      const measures = parseInt(match[1] || '0', 10);
      const beats = match[2] ? parseInt(match[2], 10) : 0;
      return [measures, beats];
    }
    return [0, 0];
  }
}
