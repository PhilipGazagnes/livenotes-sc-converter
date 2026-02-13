/**
 * Test suite for ChordParser
 * 
 * Test Spec: Section 2.1 (Tests 2.1.1-2.1.14)
 * See: https://github.com/PhilipGazagnes/livenotes-documentation/blob/main/songcode/test-suite-specification.md
 */

import { ChordParser } from '../../../src/phase2/ChordParser';
import { SongCodeError } from '../../../src/errors/SongCodeError';

describe('ChordParser', () => {
  let parser: ChordParser;

  beforeEach(() => {
    parser = new ChordParser();
  });

  describe('parse()', () => {
    describe('valid chords', () => {
      test('2.1.1: Simple major chord', () => {
        // Arrange
        const input = 'A';

        // Act
        const result = parser.parse(input);

        // Assert
        expect(result).toEqual(['A', '']);
      });

      test('2.1.2: Simple minor chord', () => {
        // Arrange
        const input = 'Am';

        // Act
        const result = parser.parse(input);

        // Assert
        expect(result).toEqual(['Am', '']);
      });

      test('2.1.3: Sharp major chord', () => {
        // Arrange
        const input = 'F#';

        // Act
        const result = parser.parse(input);

        // Assert
        expect(result).toEqual(['F#', '']);
      });

      test('2.1.4: Sharp minor chord', () => {
        // Arrange
        const input = 'C#m';

        // Act
        const result = parser.parse(input);

        // Assert
        expect(result).toEqual(['C#m', '']);
      });

      test('2.1.5: Flat major chord', () => {
        // Arrange
        const input = 'Bb';

        // Act
        const result = parser.parse(input);

        // Assert
        expect(result).toEqual(['Bb', '']);
      });

      test('2.1.6: Flat minor chord', () => {
        // Arrange
        const input = 'Ebm';

        // Act
        const result = parser.parse(input);

        // Assert
        expect(result).toEqual(['Ebm', '']);
      });

      test('2.1.7: Chord with seventh', () => {
        // Arrange
        const input = 'G7';

        // Act
        const result = parser.parse(input);

        // Assert
        expect(result).toEqual(['G', '7']);
      });

      test('2.1.8: Minor chord with seventh', () => {
        // Arrange
        const input = 'Am7';

        // Act
        const result = parser.parse(input);

        // Assert
        expect(result).toEqual(['Am', '7']);
      });

      test('2.1.9: Chord with sus4', () => {
        // Arrange
        const input = 'Dsus4';

        // Act
        const result = parser.parse(input);

        // Assert
        expect(result).toEqual(['D', 'sus4']);
      });

      test('2.1.10: Chord with complex extension', () => {
        // Arrange
        const input = 'Cmaj7sus4';

        // Act
        const result = parser.parse(input);

        // Assert
        expect(result).toEqual(['C', 'maj7sus4']);
      });

      test('2.1.11: Sharp minor with extension', () => {
        // Arrange
        const input = 'F#m7b5';

        // Act
        const result = parser.parse(input);

        // Assert
        expect(result).toEqual(['F#m', '7b5']);
      });

      test('2.1.14: All valid base chords', () => {
        // Test major chords
        const majorChords = ['A', 'A#', 'Ab', 'B', 'Bb', 'C', 'C#', 'D', 'Db', 'D#', 'E', 'Eb', 'F', 'F#', 'G', 'Gb', 'G#'];
        
        for (const chord of majorChords) {
          const result = parser.parse(chord);
          expect(result).toEqual([chord, '']);
        }

        // Test minor chords
        const minorChords = ['Am', 'A#m', 'Abm', 'Bm', 'Bbm', 'Cm', 'C#m', 'Dm', 'Dbm', 'D#m', 'Em', 'Ebm', 'Fm', 'F#m', 'Gm', 'Gbm', 'G#m'];
        
        for (const chord of minorChords) {
          const result = parser.parse(chord);
          expect(result).toEqual([chord, '']);
        }
      });
    });

    describe('validation errors', () => {
      test('2.1.12: Invalid chord base', () => {
        // Arrange
        const input = 'X';

        // Act & Assert
        expect(() => parser.parse(input)).toThrow(SongCodeError);
        
        try {
          parser.parse(input);
          fail('Should have thrown SongCodeError');
        } catch (error) {
          expect(error).toBeInstanceOf(SongCodeError);
          expect((error as SongCodeError).code).toBe('E2.1.1');
          expect((error as SongCodeError).message.toLowerCase()).toContain('chord');
        }
      });

      test('2.1.13: Invalid chord with number', () => {
        // Arrange
        const input = 'H7';

        // Act & Assert
        expect(() => parser.parse(input)).toThrow(SongCodeError);
        
        try {
          parser.parse(input);
          fail('Should have thrown SongCodeError');
        } catch (error) {
          expect(error).toBeInstanceOf(SongCodeError);
          expect((error as SongCodeError).code).toBe('E2.1.1');
        }
      });
    });
  });
});
