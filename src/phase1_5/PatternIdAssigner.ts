/**
 * Phase 1.5 - Brick 5: PatternIdAssigner
 * 
 * Responsible for:
 * - Assigning alphabetical IDs (A, B, C...) to unique patterns
 * - Pattern deduplication based on normalized content
 * - Building the patterns object for final output
 * - Updating sections with pattern.id references
 * 
 * This bridge phase transforms Phase 1 output (numeric pattern IDs, inline patterns)
 * into the final structure needed for LivenotesJSON (alphabetical pattern IDs).
 */

import { PatternMap } from '../phase1/PatternParser';
import { Section } from '../phase1/SectionParser';
import { PatternsObject } from '../types';

export interface PatternAssignmentResult {
  patterns: PatternsObject;
  sectionPatternIds: Map<number, string>; // section index -> pattern ID
}

export class PatternIdAssigner {
  /**
   * Assign alphabetical IDs to patterns and build patterns object
   * 
   * @param patternDefinitions - Pattern definitions from PatternParser ($1, $2, etc.)
   * @param sections - Sections from SectionParser
   * @returns Patterns object with alphabetical keys and section->patternId mapping
   */
  assign(patternDefinitions: PatternMap, sections: Section[]): PatternAssignmentResult {
    const patterns: PatternsObject = {};
    const sectionPatternIds = new Map<number, string>();
    const normalizedPatternToId = new Map<string, string>();
    
    let nextLetterId = 'A';

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i]!; // ! because we know i is within bounds
      // Resolve pattern: either inline or $n reference
      let patternContent = section.pattern;
      
      // If pattern is a reference like "$1", resolve it
      const refMatch = patternContent.match(/^\$(\w+)$/);
      if (refMatch && refMatch[1]) {
        const refKey = refMatch[1];
        patternContent = patternDefinitions[refKey] || '';
      }

      // Normalize the pattern
      const normalized = this.normalizePattern(patternContent);

      // Check if we've seen this pattern before
      let patternId = normalizedPatternToId.get(normalized);

      if (!patternId) {
        // New pattern - assign next letter
        patternId = nextLetterId;
        nextLetterId = String.fromCharCode(nextLetterId.charCodeAt(0) + 1);

        // Store in patterns object
        patterns[patternId] = {
          sc: normalized,
          json: null,
          measures: 0,
        };

        // Remember this normalized pattern
        normalizedPatternToId.set(normalized, patternId);
      }

      // Map this section index to its pattern ID
      sectionPatternIds.set(i, patternId);
    }

    return { patterns, sectionPatternIds };
  }

  /**
   * Normalize pattern string for comparison
   * 
   * Rules (from parser-generator-specification.md Step 1.3):
   * 1. Convert tabs to spaces
   * 2. Collapse multiple spaces to single space
   * 3. Convert newlines between measures to `;` separators
   * 4. Preserve explicit `:` line breaks
   * 5. Remove spaces around special characters (`;`, `[`, `]`)
   * 6. Trim leading/trailing whitespace
   */
  private normalizePattern(pattern: string): string {
    if (!pattern) return '';

    let normalized = pattern;

    // 1. Convert tabs to spaces
    normalized = normalized.replace(/\t/g, ' ');

    // 2. Split into lines and process
    const lines = normalized.split('\n');
    const processedLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line === undefined) continue;
      
      const trimmedLine = line.trim();
      
      // Skip empty lines
      if (trimmedLine === '') continue;

      // Check if line is explicit line break marker
      if (trimmedLine === ':') {
        processedLines.push(':');
        continue;
      }

      processedLines.push(trimmedLine);
    }

    // 3. Join lines with `;` or `:` separator
    // If a line is ":", keep it as-is; otherwise join with ";"
    const parts: string[] = [];
    for (let i = 0; i < processedLines.length; i++) {
      const line = processedLines[i];
      if (line === undefined) continue;
      
      if (line === ':') {
        // Add ":" as separator (replace last ";" with ":")
        if (parts.length > 0) {
          parts.push(':');
        }
      } else {
        if (parts.length > 0 && parts[parts.length - 1] !== ':') {
          parts.push(';');
        }
        parts.push(line);
      }
    }
    normalized = parts.join('');

    // 4. Collapse multiple `;` into single
    normalized = normalized.replace(/;+/g, ';');

    // 5. Collapse multiple spaces
    normalized = normalized.replace(/\s+/g, ' ');

    // 6. Remove spaces around special characters
    normalized = normalized.replace(/\s*\[\s*/g, '[');   // Remove space after [
    normalized = normalized.replace(/\s*\]\s*/g, ']');   // Remove space before ]
    normalized = normalized.replace(/\s*;\s*/g, ';');    // Remove space around ;
    normalized = normalized.replace(/\](\d)/g, ']$1');   // Remove space between ] and digit

    // 7. Final trim
    normalized = normalized.trim();

    return normalized;
  }
}
