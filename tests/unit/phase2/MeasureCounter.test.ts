/**
 * Test suite for MeasureCounter
 * 
 * Test Spec: Section 2.3 (Tests 2.3.1-2.3.7)
 * See: https://github.com/PhilipGazagnes/livenotes-documentation/blob/main/songcode/test-suite-specification.md
 */

import { MeasureCounter } from '../../../src/phase2/MeasureCounter';
import { PatternJSON } from '../../../src/phase2/PatternTransformer';

describe('MeasureCounter', () => {
  let counter: MeasureCounter;

  beforeEach(() => {
    counter = new MeasureCounter();
  });

  describe('count()', () => {
    test('2.3.1: Simple pattern count', () => {
      // Arrange
      const pattern: PatternJSON = [[['A', '']], [['G', '']]];

      // Act
      const result = counter.count(pattern);

      // Assert
      expect(result).toBe(2);
    });

    test('2.3.2: Pattern with loop', () => {
      // Arrange
      const pattern: PatternJSON = [
        'loopStart',
        [['A', '']],
        [['G', '']],
        'loopEnd:3'
      ];

      // Act
      const result = counter.count(pattern);

      // Assert
      expect(result).toBe(6); // 2 × 3
    });

    test('2.3.3: Pattern with loop and additional measures', () => {
      // Arrange
      const pattern: PatternJSON = [
        'loopStart',
        [['A', '']],
        [['G', '']],
        'loopEnd:3',
        [['D', '']]
      ];

      // Act
      const result = counter.count(pattern);

      // Assert
      expect(result).toBe(7); // 2 × 3 + 1
    });

    test('2.3.4: Pattern with line break (should not count)', () => {
      // Arrange
      const pattern: PatternJSON = [[['A', '']], 'newLine', [['G', '']]];

      // Act
      const result = counter.count(pattern);

      // Assert
      expect(result).toBe(2); // newLine doesn't count
    });

    test('2.3.5: Empty pattern', () => {
      // Arrange
      const pattern: PatternJSON = null;

      // Act
      const result = counter.count(pattern);

      // Assert
      expect(result).toBe(0);
    });

    test('2.3.6: Pattern with only line breaks', () => {
      // Arrange
      const pattern: PatternJSON = ['newLine', 'newLine'];

      // Act
      const result = counter.count(pattern);

      // Assert
      expect(result).toBe(0);
    });

    test('2.3.7: Complex nested loop', () => {
      // Arrange - Simulate nested measures
      const pattern: PatternJSON = [
        [['A', '']],
        'loopStart',
        [['G', '']],
        [['D', '']],
        'loopEnd:2',
        [['E', '']]
      ];

      // Act
      const result = counter.count(pattern);

      // Assert
      expect(result).toBe(6); // 1 + (2 × 2) + 1 = 6
    });
  });
});
