/**
 * Test suite for LyricTransformer
 * 
 * Test Spec: Section 3.5 (Tests 3.5.1-3.5.10)
 * See: https://github.com/PhilipGazagnes/livenotes-documentation/blob/main/songcode/test-suite-specification.md
 */

import { LyricTransformer } from '../../../src/phase3_5/LyricTransformer';

describe('LyricTransformer', () => {
  let transformer: LyricTransformer;

  beforeEach(() => {
    transformer = new LyricTransformer();
  });

  describe('transform()', () => {
    test('3.5.1: Transform single normal lyric', () => {
      // Arrange
      const lyrics = ['First line _4'];

      // Act
      const result = transformer.transform(lyrics);

      // Assert
      expect(result).toEqual([
        { text: 'First line', measures: 4, style: 'normal' },
      ]);
    });

    test('3.5.2: Transform multiple normal lyrics', () => {
      // Arrange
      const lyrics = ['First line _2', 'Second line _2'];

      // Act
      const result = transformer.transform(lyrics);

      // Assert
      expect(result).toEqual([
        { text: 'First line', measures: 2, style: 'normal' },
        { text: 'Second line', measures: 2, style: 'normal' },
      ]);
    });

    test('3.5.3: Transform info marker lyric', () => {
      // Arrange
      const lyrics = ['***Guitar Solo*** _4'];

      // Act
      const result = transformer.transform(lyrics);

      // Assert
      expect(result).toEqual([
        { text: 'Guitar Solo', measures: 4, style: 'info' },
      ]);
    });

    test('3.5.4: Transform musician marker lyric', () => {
      // Arrange
      const lyrics = [':::Watch drummer::: _2'];

      // Act
      const result = transformer.transform(lyrics);

      // Assert
      expect(result).toEqual([
        { text: 'Watch drummer', measures: 2, style: 'musician' },
      ]);
    });

    test('3.5.5: Transform empty lyric line', () => {
      // Arrange
      const lyrics = ['_4'];

      // Act
      const result = transformer.transform(lyrics);

      // Assert
      expect(result).toEqual([
        { text: '', measures: 4, style: 'normal' },
      ]);
    });

    test('3.5.6: Mixed lyric types', () => {
      // Arrange
      const lyrics = [
        'Verse text _2',
        '***Solo*** _2',
        ':::Watch tempo::: _2',
        'Back to verse _2',
      ];

      // Act
      const result = transformer.transform(lyrics);

      // Assert
      expect(result).toHaveLength(4);
      expect(result[0]!.style).toBe('normal');
      expect(result[1]!.style).toBe('info');
      expect(result[2]!.style).toBe('musician');
      expect(result[3]!.style).toBe('normal');
    });

    test('3.5.7: Empty lyrics array (instrumental)', () => {
      // Arrange
      const lyrics: string[] = [];

      // Act
      const result = transformer.transform(lyrics);

      // Assert
      expect(result).toEqual([]);
    });

    test('3.5.8: Lyric with leading/trailing spaces', () => {
      // Arrange
      const lyrics = ['  Spaced text  _4'];

      // Act
      const result = transformer.transform(lyrics);

      // Assert
      expect(result).toEqual([
        { text: 'Spaced text', measures: 4, style: 'normal' },
      ]);
    });

    test('3.5.9: Info marker with special characters', () => {
      // Arrange
      const lyrics = ['***Solo (A minor)*** _4'];

      // Act
      const result = transformer.transform(lyrics);

      // Assert
      expect(result).toEqual([
        { text: 'Solo (A minor)', measures: 4, style: 'info' },
      ]);
    });

    test('3.5.10: Preserve text between markers', () => {
      // Arrange
      const lyrics = ['***Solo***_4']; // No space before marker

      // Act
      const result = transformer.transform(lyrics);

      // Assert
      expect(result).toEqual([
        { text: 'Solo', measures: 4, style: 'info' },
      ]);
    });
  });
});
