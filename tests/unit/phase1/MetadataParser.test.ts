/**
 * Test suite for MetadataParser
 * 
 * Test Spec: Section 1.2 (Tests 1.2.1-1.2.21)
 * See: https://github.com/PhilipGazagnes/livenotes-documentation/blob/main/songcode/test-suite-specification.md
 */

import { MetadataParser } from '../../../src/phase1/MetadataParser';
import { SongCodeError } from '../../../src/errors/SongCodeError';

describe('MetadataParser', () => {
  let parser: MetadataParser;

  beforeEach(() => {
    parser = new MetadataParser();
  });

  describe('parse()', () => {
    describe('valid metadata', () => {
      test('1.2.1: Valid name metadata', () => {
        // Arrange
        const content = '@name Highway to Hell';

        // Act
        const result = parser.parse(content);

        // Assert
        expect(result.name).toBe('Highway to Hell');
      });

      test('1.2.2: Valid artist metadata', () => {
        // Arrange
        const content = '@artist AC/DC';

        // Act
        const result = parser.parse(content);

        // Assert
        expect(result.artist).toBe('AC/DC');
      });

      test('1.2.3: Valid BPM metadata', () => {
        // Arrange
        const content = '@bpm 120';

        // Act
        const result = parser.parse(content);

        // Assert
        expect(result.bpm).toBe(120);
      });

      test('1.2.6: BPM zero (edge case)', () => {
        // Arrange
        const content = '@bpm 0';

        // Act
        const result = parser.parse(content);

        // Assert
        expect(result.bpm).toBe(0);
      });

      test('1.2.7: Valid time signature 4/4', () => {
        // Arrange
        const content = '@time 4/4';

        // Act
        const result = parser.parse(content);

        // Assert
        expect(result.time).toEqual({ numerator: 4, denominator: 4 });
      });

      test('1.2.8: Valid time signature 3/4', () => {
        // Arrange
        const content = '@time 3/4';

        // Act
        const result = parser.parse(content);

        // Assert
        expect(result.time).toEqual({ numerator: 3, denominator: 4 });
      });

      test('1.2.10: Valid original key', () => {
        // Arrange
        const content = '@original A';

        // Act
        const result = parser.parse(content);

        // Assert
        expect(result.original).toBe('A');
      });

      test('1.2.12: Valid capo position', () => {
        // Arrange
        const content = '@capo 3';

        // Act
        const result = parser.parse(content);

        // Assert
        expect(result.capo).toBe(3);
      });

      test('1.2.15: Valid warning metadata', () => {
        // Arrange
        const content = '@warning Tricky break';

        // Act
        const result = parser.parse(content);

        // Assert
        expect(result.warning).toBe('Tricky break');
      });

      test('1.2.16: Valid end metadata', () => {
        // Arrange
        const content = '@end Fade out';

        // Act
        const result = parser.parse(content);

        // Assert
        expect(result.end).toBe('Fade out');
      });

      test('1.2.19: Duplicate metadata keys (last wins)', () => {
        // Arrange
        const content = '@name Song1\n@name Song2';

        // Act
        const result = parser.parse(content);

        // Assert
        expect(result.name).toBe('Song2');
      });

      test('1.2.21: Empty metadata block', () => {
        // Arrange
        const content = '';

        // Act
        const result = parser.parse(content);

        // Assert
        expect(result).toEqual({});
      });

      test('Multiple valid metadata fields', () => {
        // Arrange
        const content = `@name Test Song
@artist The Band
@bpm 120
@time 4/4
@capo 2`;

        // Act
        const result = parser.parse(content);

        // Assert
        expect(result.name).toBe('Test Song');
        expect(result.artist).toBe('The Band');
        expect(result.bpm).toBe(120);
        expect(result.time).toEqual({ numerator: 4, denominator: 4 });
        expect(result.capo).toBe(2);
      });
    });

    describe('validation errors', () => {
      test('1.2.4: BPM below range', () => {
        // Arrange
        const content = '@bpm -10';

        // Act & Assert
        expect(() => parser.parse(content)).toThrow(SongCodeError);
        
        try {
          parser.parse(content);
          fail('Should have thrown SongCodeError');
        } catch (error) {
          expect(error).toBeInstanceOf(SongCodeError);
          expect((error as SongCodeError).code).toBe('E1.1.2');
          expect((error as SongCodeError).message).toContain('BPM');
        }
      });

      test('1.2.5: BPM above range', () => {
        // Arrange
        const content = '@bpm 500';

        // Act & Assert
        expect(() => parser.parse(content)).toThrow(SongCodeError);
        
        try {
          parser.parse(content);
          fail('Should have thrown SongCodeError');
        } catch (error) {
          expect(error).toBeInstanceOf(SongCodeError);
          expect((error as SongCodeError).code).toBe('E1.1.2');
        }
      });

      test('1.2.9: Invalid time signature denominator', () => {
        // Arrange
        const content = '@time 4/8';

        // Act & Assert
        expect(() => parser.parse(content)).toThrow(SongCodeError);
        
        try {
          parser.parse(content);
          fail('Should have thrown SongCodeError');
        } catch (error) {
          expect(error).toBeInstanceOf(SongCodeError);
          expect((error as SongCodeError).code).toBe('E1.1.3');
          expect((error as SongCodeError).message.toLowerCase()).toContain('time signature');
        }
      });

      test('1.2.11: Invalid original key', () => {
        // Arrange
        const content = '@original X';

        // Act & Assert
        expect(() => parser.parse(content)).toThrow(SongCodeError);
        
        try {
          parser.parse(content);
          fail('Should have thrown SongCodeError');
        } catch (error) {
          expect(error).toBeInstanceOf(SongCodeError);
          expect((error as SongCodeError).code).toBe('E1.1.4');
        }
      });

      test('1.2.13: Capo below range', () => {
        // Arrange
        const content = '@capo 0';

        // Act & Assert
        expect(() => parser.parse(content)).toThrow(SongCodeError);
        
        try {
          parser.parse(content);
          fail('Should have thrown SongCodeError');
        } catch (error) {
          expect(error).toBeInstanceOf(SongCodeError);
          expect((error as SongCodeError).code).toBe('E1.1.5');
          expect((error as SongCodeError).message).toContain('Capo');
        }
      });

      test('1.2.14: Capo above range', () => {
        // Arrange
        const content = '@capo 25';

        // Act & Assert
        expect(() => parser.parse(content)).toThrow(SongCodeError);
        
        try {
          parser.parse(content);
          fail('Should have thrown SongCodeError');
        } catch (error) {
          expect(error).toBeInstanceOf(SongCodeError);
          expect((error as SongCodeError).code).toBe('E1.1.5');
        }
      });

      test('1.2.17: Name too long', () => {
        // Arrange
        const longName = 'A'.repeat(101);
        const content = `@name ${longName}`;

        // Act & Assert
        expect(() => parser.parse(content)).toThrow(SongCodeError);
        
        try {
          parser.parse(content);
          fail('Should have thrown SongCodeError');
        } catch (error) {
          expect(error).toBeInstanceOf(SongCodeError);
          expect((error as SongCodeError).code).toBe('E1.1.1');
          expect((error as SongCodeError).message).toContain('100 characters');
        }
      });

      test('1.2.18: Invalid metadata key', () => {
        // Arrange
        const content = '@invalid value';

        // Act & Assert
        expect(() => parser.parse(content)).toThrow(SongCodeError);
        
        try {
          parser.parse(content);
          fail('Should have thrown SongCodeError');
        } catch (error) {
          expect(error).toBeInstanceOf(SongCodeError);
          expect((error as SongCodeError).code).toBe('E1.1.6');
          expect((error as SongCodeError).message).toContain('Unknown metadata key');
        }
      });
    });
  });
});
