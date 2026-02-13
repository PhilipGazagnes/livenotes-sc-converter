/**
 * Test suite for SectionParser
 * 
 * Test Spec: Section 1.4 (Tests 1.4.1-1.4.20)
 * See: https://github.com/PhilipGazagnes/livenotes-documentation/blob/main/songcode/test-suite-specification.md
 */

import { SectionParser } from '../../../src/phase1/SectionParser';
import { SongCodeError } from '../../../src/errors/SongCodeError';

// Helper to safely access array elements in tests
function getSection(sections: any[], index: number) {
  const section = sections[index];
  expect(section).toBeDefined();
  return section!;
}

describe('SectionParser', () => {
  let parser: SectionParser;

  beforeEach(() => {
    parser = new SectionParser();
  });

  describe('parse()', () => {
    describe('valid sections', () => {
      test('1.4.1: Simple section with inline chords', () => {
        // Arrange
        const content = `Verse
A;G;D;G
--
Lyrics _4`;

        // Act
        const result = parser.parse(content);

        // Assert
        expect(result).toHaveLength(1);
        const section = getSection(result, 0);
        expect(section.name).toBe('Verse');
        expect(section.pattern).toBe('A;G;D;G');
        expect(section.lyrics).toEqual(['Lyrics _4']);
      });

      test('1.4.2: Section with pattern reference', () => {
        // Arrange
        const content = `Verse
$1
--
Lyrics _4`;

        // Act
        const result = parser.parse(content);

        // Assert
        expect(result).toHaveLength(1);
        const section = getSection(result, 0);
        expect(section.name).toBe('Verse');
        expect(section.pattern).toBe('$1');
        expect(section.lyrics).toEqual(['Lyrics _4']);
      });

      test('1.4.3: Section with comment', () => {
        // Arrange
        const content = `Bridge!Slow down
$1
--
Lyrics _4`;

        // Act
        const result = parser.parse(content);

        // Assert
        expect(result).toHaveLength(1);
        const section = getSection(result, 0);
        expect(section.name).toBe('Bridge');
        expect(section.comment).toBe('Slow down');
      });

      test('1.4.4: Section without lyrics', () => {
        // Arrange
        const content = `Intro
$1
--`;

        // Act
        const result = parser.parse(content);

        // Assert
        expect(result).toHaveLength(1);
        const section = getSection(result, 0);
        expect(section.name).toBe('Intro');
        expect(section.lyrics).toEqual([]);
      });

      test('1.4.5: Section with _repeat modifier', () => {
        // Arrange
        const content = `Chorus
$1
_repeat 2
--
Lyrics _4`;

        // Act
        const result = parser.parse(content);

        // Assert
        const section = getSection(result, 0);
        expect(section.repeat).toBe(2);
      });

      test('1.4.6: Section with _cutStart modifier (measures only)', () => {
        // Arrange
        const content = `Verse
$1
_cutStart 2
--
Lyrics _2`;

        // Act
        const result = parser.parse(content);

        // Assert
        const section = getSection(result, 0);
        expect(section.cutStart).toEqual([2, 0]);
      });

      test('1.4.7: Section with _cutStart modifier (measures and beats)', () => {
        // Arrange
        const content = `Verse
$1
_cutStart 1-2
--
Lyrics _2`;

        // Act
        const result = parser.parse(content);

        // Assert
        const section = getSection(result, 0);
        expect(section.cutStart).toEqual([1, 2]);
      });

      test('1.4.8: Section with _cutEnd modifier (measures only)', () => {
        // Arrange
        const content = `Verse
$1
_cutEnd 1
--
Lyrics _3`;

        // Act
        const result = parser.parse(content);

        // Assert
        const section = getSection(result, 0);
        expect(section.cutEnd).toEqual([1, 0]);
      });

      test('1.4.9: Section with _cutEnd modifier (measures and beats)', () => {
        // Arrange
        const content = `Verse
$1
_cutEnd 2-3
--
Lyrics _2`;

        // Act
        const result = parser.parse(content);

        // Assert
        const section = getSection(result, 0);
        expect(section.cutEnd).toEqual([2, 3]);
      });

      test('1.4.10: Section with _before modifier', () => {
        // Arrange
        const content = `Verse
$1
_before Am;D
--
Lyrics _6`;

        // Act
        const result = parser.parse(content);

        // Assert
        const section = getSection(result, 0);
        expect(section.before).toEqual({
          sc: 'Am;D',
          json: null,
          measures: 0,
        });
      });

      test('1.4.11: Section with _after modifier', () => {
        // Arrange
        const content = `Verse
$1
_after G;G
--
Lyrics _6`;

        // Act
        const result = parser.parse(content);

        // Assert
        const section = getSection(result, 0);
        expect(section.after).toEqual({
          sc: 'G;G',
          json: null,
          measures: 0,
        });
      });

      test('1.4.12: Section with multiple modifiers', () => {
        // Arrange
        const content = `Verse
$1
_repeat 2
_cutEnd 1
_before Am
--
Lyrics _6`;

        // Act
        const result = parser.parse(content);

        // Assert
        const section = getSection(result, 0);
        expect(section.repeat).toBe(2);
        expect(section.cutEnd).toEqual([1, 0]);
        expect(section.before).toEqual({
          sc: 'Am',
          json: null,
          measures: 0,
        });
      });

      test('1.4.13: Section with @bpm override', () => {
        // Arrange
        const content = `Bridge
@bpm 140
$1
--
Lyrics _4`;

        // Act
        const result = parser.parse(content);

        // Assert
        const section = getSection(result, 0);
        expect(section.time).toBeDefined();
        expect(section.time?.bpm).toBe(140);
      });

      test('1.4.14: Section with @time override', () => {
        // Arrange
        const content = `Waltz
@time 3/4
$1
--
Lyrics _4`;

        // Act
        const result = parser.parse(content);

        // Assert
        const section = getSection(result, 0);
        expect(section.time).toBeDefined();
        expect(section.time?.numerator).toBe(3);
        expect(section.time?.denominator).toBe(4);
      });

      test('1.4.15: Section with info marker in lyrics', () => {
        // Arrange
        const content = `Solo
$1
--
***Guitar Solo*** _4`;

        // Act
        const result = parser.parse(content);

        // Assert
        const section = getSection(result, 0);
        expect(section.lyrics).toEqual(['***Guitar Solo*** _4']);
      });

      test('1.4.16: Section with musician marker in lyrics', () => {
        // Arrange
        const content = `Break
$1
--
:::Watch drummer::: _2`;

        // Act
        const result = parser.parse(content);

        // Assert
        const section = getSection(result, 0);
        expect(section.lyrics).toEqual([':::Watch drummer::: _2']);
      });

      test('1.4.17: Invalid pattern reference (stored, validated later)', () => {
        // Arrange
        const content = `Verse
$99
--
Lyrics _4`;

        // Act
        const result = parser.parse(content);

        // Assert
        const section = getSection(result, 0);
        expect(section.pattern).toBe('$99');
        // Validation happens in Phase 3
      });

      test('Multiple sections in content', () => {
        // Arrange
        const content = `Verse
$1
--
First verse _4

Chorus
$2
--
Chorus lyrics _4`;

        // Act
        const result = parser.parse(content);

        // Assert
        expect(result).toHaveLength(2);
        const section1 = getSection(result, 0);
        const section2 = getSection(result, 1);
        expect(section1.name).toBe('Verse');
        expect(section2.name).toBe('Chorus');
      });
    });

    describe('validation errors', () => {
      test('1.4.18: Section with inline pattern and no separator (instrumental)', () => {
        // Arrange - instrumental section with inline pattern
        const content = `Verse
A;G;D;A`;

        // Act
        const result = parser.parse(content);

        // Assert - should parse successfully as instrumental section
        expect(result).toHaveLength(1);
        expect(result[0]!.name).toBe('Verse');
        expect(result[0]!.pattern).toBe('A;G;D;A');
        expect(result[0]!.lyrics).toEqual([]);
      });

      test('1.4.19: Empty section name', () => {
        // Arrange
        const content = `
$1
--
Lyrics _4`;

        // Act & Assert
        expect(() => parser.parse(content)).toThrow(SongCodeError);
        
        try {
          parser.parse(content);
          fail('Should have thrown SongCodeError');
        } catch (error) {
          expect(error).toBeInstanceOf(SongCodeError);
          expect((error as SongCodeError).code).toBe('E1.4.2');
          expect((error as SongCodeError).message.toLowerCase()).toContain('section name');
        }
      });

      test('1.4.20: Section with pattern reference and no separator (instrumental)', () => {
        // Arrange - instrumental section with pattern reference
        const content = `Intro
$1`;

        // Act
        const result = parser.parse(content);

        // Assert - should parse successfully as instrumental section
        expect(result).toHaveLength(1);
        expect(result[0]!.name).toBe('Intro');
        expect(result[0]!.pattern).toBe('$1');
        expect(result[0]!.lyrics).toEqual([]);
      });
    });
  });
});
