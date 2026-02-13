/**
 * Test suite for PatternTransformer
 * 
 * Test Spec: Section 2.2 (Tests 2.2.1-2.2.18)
 * See: https://github.com/PhilipGazagnes/livenotes-documentation/blob/main/songcode/test-suite-specification.md
 */

import { PatternTransformer } from '../../../src/phase2/PatternTransformer';
import { SongCodeError } from '../../../src/errors/SongCodeError';

describe('PatternTransformer', () => {
  let transformer: PatternTransformer;

  beforeEach(() => {
    transformer = new PatternTransformer();
  });

  describe('transform()', () => {
    describe('valid patterns', () => {
      test('2.2.1: Simple pattern - one chord', () => {
        // Arrange
        const input = 'A';

        // Act
        const result = transformer.transform(input);

        // Assert
        expect(result.json).toEqual([[['A', '']]]);
      });

      test('2.2.2: Simple pattern - multiple measures', () => {
        // Arrange
        const input = 'A;G;D;G';

        // Act
        const result = transformer.transform(input);

        // Assert
        expect(result.json).toEqual([
          [['A', '']],
          [['G', '']],
          [['D', '']],
          [['G', '']]
        ]);
      });

      test('2.2.3: Multiple chords in one measure', () => {
        // Arrange
        const input = 'A D';

        // Act
        const result = transformer.transform(input);

        // Assert
        expect(result.json).toEqual([[['A', ''], ['D', '']]]);
      });

      test('2.2.4: Multiple chords and multiple measures', () => {
        // Arrange
        const input = 'A D;G C';

        // Act
        const result = transformer.transform(input);

        // Assert
        expect(result.json).toEqual([
          [['A', ''], ['D', '']],
          [['G', ''], ['C', '']]
        ]);
      });

      test('2.2.5: Pattern with repeat symbol', () => {
        // Arrange
        const input = 'A;%';

        // Act
        const result = transformer.transform(input);

        // Assert
        expect(result.json).toEqual([[['A', '']], [['%']]]);
      });

      test('2.2.6: Pattern with silence', () => {
        // Arrange
        const input = 'A;_';

        // Act
        const result = transformer.transform(input);

        // Assert
        expect(result.json).toEqual([[['A', '']], [['_']]]);
      });

      test('2.2.7: Pattern with remover', () => {
        // Arrange
        const input = 'A =';

        // Act
        const result = transformer.transform(input);

        // Assert
        expect(result.json).toEqual([[['A', ''], ['=']]]);
      });

      test('2.2.8: Pattern with multiple removers', () => {
        // Arrange
        const input = 'A = =';

        // Act
        const result = transformer.transform(input);

        // Assert
        expect(result.json).toEqual([[['A', ''], ['='], ['=']]]);
      });

      test('2.2.9: Simple loop', () => {
        // Arrange
        const input = '[A;G]3';

        // Act
        const result = transformer.transform(input);

        // Assert
        expect(result.json).toEqual([
          'loopStart',
          [['A', '']],
          [['G', '']],
          'loopEnd:3'
        ]);
      });

      test('2.2.10: Nested content after loop', () => {
        // Arrange
        const input = '[A;G]2;D';

        // Act
        const result = transformer.transform(input);

        // Assert
        expect(result.json).toEqual([
          'loopStart',
          [['A', '']],
          [['G', '']],
          'loopEnd:2',
          [['D', '']]
        ]);
      });

      test('2.2.11: Line break with :', () => {
        // Arrange
        const input = 'A;G:D;E';

        // Act
        const result = transformer.transform(input);

        // Assert
        expect(result.json).toEqual([
          [['A', '']],
          [['G', '']],
          'newLine',
          [['D', '']],
          [['E', '']]
        ]);
      });

      test('2.2.12: Complex pattern with loop and line break', () => {
        // Arrange
        const input = '[A;G;%;A]3:A;G;%;E;%';

        // Act
        const result = transformer.transform(input);

        // Assert
        expect(result.json).toEqual([
          'loopStart',
          [['A', '']],
          [['G', '']],
          [['%']],
          [['A', '']],
          'loopEnd:3',
          'newLine',
          [['A', '']],
          [['G', '']],
          [['%']],
          [['E', '']],
          [['%']]
        ]);
      });

      test('2.2.17: Empty pattern', () => {
        // Arrange
        const input = '';

        // Act
        const result = transformer.transform(input);

        // Assert
        expect(result.json).toBeNull();
        expect(result.measures).toBe(0);
      });

      test('2.2.18: Pattern with only whitespace', () => {
        // Arrange
        const input = '   ';

        // Act
        const result = transformer.transform(input);

        // Assert
        expect(result.json).toBeNull();
        expect(result.measures).toBe(0);
      });
    });

    describe('validation errors', () => {
      test('2.2.13: Loop without repeat count', () => {
        // Arrange
        const input = '[A;G]';

        // Act & Assert
        expect(() => transformer.transform(input)).toThrow(SongCodeError);
        
        try {
          transformer.transform(input);
          fail('Should have thrown SongCodeError');
        } catch (error) {
          expect(error).toBeInstanceOf(SongCodeError);
          expect((error as SongCodeError).code).toBe('E2.1.4');
          expect((error as SongCodeError).message.toLowerCase()).toContain('loop');
        }
      });

      test('2.2.14: Mismatched loop brackets - missing close', () => {
        // Arrange
        const input = '[A;G';

        // Act & Assert
        expect(() => transformer.transform(input)).toThrow(SongCodeError);
        
        try {
          transformer.transform(input);
          fail('Should have thrown SongCodeError');
        } catch (error) {
          expect(error).toBeInstanceOf(SongCodeError);
          expect((error as SongCodeError).code).toBe('E2.1.3');
          expect((error as SongCodeError).message.toLowerCase()).toContain('bracket');
        }
      });

      test('2.2.15: Mismatched loop brackets - missing open', () => {
        // Arrange
        const input = 'A;G]3';

        // Act & Assert
        expect(() => transformer.transform(input)).toThrow(SongCodeError);
        
        try {
          transformer.transform(input);
          fail('Should have thrown SongCodeError');
        } catch (error) {
          expect(error).toBeInstanceOf(SongCodeError);
          expect((error as SongCodeError).code).toBe('E2.1.3');
        }
      });

      test('2.2.16: Remover not at end of measure', () => {
        // Arrange
        const input = '= A';

        // Act & Assert
        expect(() => transformer.transform(input)).toThrow(SongCodeError);
        
        try {
          transformer.transform(input);
          fail('Should have thrown SongCodeError');
        } catch (error) {
          expect(error).toBeInstanceOf(SongCodeError);
          expect((error as SongCodeError).code).toBe('E2.1.2');
          expect((error as SongCodeError).message.toLowerCase()).toContain('remover');
        }
      });
    });
  });
});
