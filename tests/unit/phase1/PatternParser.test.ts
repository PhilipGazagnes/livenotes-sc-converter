/**
 * Test suite for PatternParser
 * 
 * Test Spec: Section 1.3 (Tests 1.3.1-1.3.12)
 * See: https://github.com/PhilipGazagnes/livenotes-documentation/blob/main/songcode/test-suite-specification.md
 */

import { PatternParser } from '../../../src/phase1/PatternParser';
import { SongCodeError } from '../../../src/errors/SongCodeError';

describe('PatternParser', () => {
  let parser: PatternParser;

  beforeEach(() => {
    parser = new PatternParser();
  });

  describe('parse()', () => {
    describe('valid patterns', () => {
      test('1.3.1: Single pattern definition', () => {
        // Arrange
        const content = '$1 C | G | Am | F';

        // Act
        const result = parser.parse(content);

        // Assert
        expect(result).toHaveProperty('1');
        expect(result['1']).toBe('C | G | Am | F');
      });

      test('1.3.2: Multiple pattern definitions', () => {
        // Arrange
        const content = `$1 C | G | Am | F
$2 Dm | G | C`;

        // Act
        const result = parser.parse(content);

        // Assert
        expect(result).toHaveProperty('1');
        expect(result).toHaveProperty('2');
        expect(result['1']).toBe('C | G | Am | F');
        expect(result['2']).toBe('Dm | G | C');
      });

      test('1.3.3: Pattern with extra whitespace', () => {
        // Arrange
        const content = '$1   C  |  G  |  Am  |  F  ';

        // Act
        const result = parser.parse(content);

        // Assert
        expect(result).toHaveProperty('1');
        // Should normalize whitespace
        expect(result['1']).toBe('C | G | Am | F');
      });

      test('1.3.4: Pattern with no spaces around pipes', () => {
        // Arrange
        const content = '$1 C|G|Am|F';

        // Act
        const result = parser.parse(content);

        // Assert
        expect(result).toHaveProperty('1');
        // Should normalize to standard format
        expect(result['1']).toBe('C | G | Am | F');
      });

      test('1.3.5: Pattern with complex chords', () => {
        // Arrange
        const content = '$1 Cmaj7 | G7 | Am7 | Fmaj7';

        // Act
        const result = parser.parse(content);

        // Assert
        expect(result['1']).toBe('Cmaj7 | G7 | Am7 | Fmaj7');
      });

      test('1.3.6: Pattern with empty measures', () => {
        // Arrange
        const content = '$1 C | - | Am | -';

        // Act
        const result = parser.parse(content);

        // Assert
        expect(result['1']).toBe('C | - | Am | -');
      });

      test('1.3.10: Empty pattern block', () => {
        // Arrange
        const content = '';

        // Act
        const result = parser.parse(content);

        // Assert
        expect(result).toEqual({});
      });

      test('1.3.12: Duplicate pattern IDs (last wins)', () => {
        // Arrange
        const content = `$1 C | G
$1 Am | F`;

        // Act
        const result = parser.parse(content);

        // Assert
        expect(result['1']).toBe('Am | F');
      });
    });

    describe('validation errors', () => {
      test('1.3.7: Invalid pattern ID (not a number)', () => {
        // Arrange
        const content = '$A C | G | Am | F';

        // Act & Assert
        expect(() => parser.parse(content)).toThrow(SongCodeError);
        
        try {
          parser.parse(content);
          fail('Should have thrown SongCodeError');
        } catch (error) {
          expect(error).toBeInstanceOf(SongCodeError);
          expect((error as SongCodeError).code).toBe('E1.2.1');
          expect((error as SongCodeError).message.toLowerCase()).toContain('pattern');
        }
      });

      test('1.3.8: Pattern ID zero', () => {
        // Arrange
        const content = '$0 C | G | Am | F';

        // Act & Assert
        expect(() => parser.parse(content)).toThrow(SongCodeError);
        
        try {
          parser.parse(content);
          fail('Should have thrown SongCodeError');
        } catch (error) {
          expect(error).toBeInstanceOf(SongCodeError);
          expect((error as SongCodeError).code).toBe('E1.2.1');
        }
      });

      test('1.3.9: Negative pattern ID', () => {
        // Arrange
        const content = '$-1 C | G | Am | F';

        // Act & Assert
        expect(() => parser.parse(content)).toThrow(SongCodeError);
        
        try {
          parser.parse(content);
          fail('Should have thrown SongCodeError');
        } catch (error) {
          expect(error).toBeInstanceOf(SongCodeError);
          expect((error as SongCodeError).code).toBe('E1.2.1');
        }
      });

      test('1.3.11: Pattern with no content', () => {
        // Arrange
        const content = '$1';

        // Act & Assert
        expect(() => parser.parse(content)).toThrow(SongCodeError);
        
        try {
          parser.parse(content);
          fail('Should have thrown SongCodeError');
        } catch (error) {
          expect(error).toBeInstanceOf(SongCodeError);
          expect((error as SongCodeError).code).toBe('E1.2.2');
          expect((error as SongCodeError).message.toLowerCase()).toContain('empty');
        }
      });
    });
  });
});
