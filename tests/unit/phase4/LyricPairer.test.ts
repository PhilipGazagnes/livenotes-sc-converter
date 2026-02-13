import { LyricPairer } from '../../../src/phase4/LyricPairer';

describe('LyricPairer', () => {
  let pairer: LyricPairer;

  beforeEach(() => {
    pairer = new LyricPairer();
  });

  describe('pair()', () => {
    // Test 4.3.1: Pair single lyric with measures
    it('should pair single lyric with all measures', () => {
      const lyrics = ['First line _4'];
      const measureCount = 4;
      
      const result = pairer.pair(lyrics, measureCount);
      
      expect(result).toEqual([
        { text: 'First line', measures: 4 },
      ]);
    });

    // Test 4.3.2: Pair multiple lyrics with measures
    it('should pair multiple lyrics distributing measures correctly', () => {
      const lyrics = ['First _2', 'Second _2'];
      const measureCount = 4;
      
      const result = pairer.pair(lyrics, measureCount);
      
      expect(result).toEqual([
        { text: 'First', measures: 2 },
        { text: 'Second', measures: 2 },
      ]);
    });

    // Test 4.3.3: Empty lyrics (instrumental section)
    it('should handle empty lyrics for instrumental sections', () => {
      const lyrics: string[] = [];
      const measureCount = 4;
      
      const result = pairer.pair(lyrics, measureCount);
      
      expect(result).toEqual([
        { text: '', measures: 4 },
      ]);
    });

    // Test 4.3.4: Parse measure count from lyric
    it('should correctly parse text and measure count', () => {
      const lyrics = ['This is a line _3'];
      const measureCount = 3;
      
      const result = pairer.pair(lyrics, measureCount);
      
      expect(result).toEqual([
        { text: 'This is a line', measures: 3 },
      ]);
    });

    // Test 4.3.5: Extract info marker
    it('should extract info marker for special handling', () => {
      const lyrics = ['***Solo*** _4'];
      const measureCount = 4;
      
      const result = pairer.pair(lyrics, measureCount);
      
      expect(result).toEqual([
        { text: '***Solo***', measures: 4, isInfo: true },
      ]);
    });

    // Test 4.3.6: Extract musician marker
    it('should extract musician marker for special handling', () => {
      const lyrics = [':::Watch drummer::: _2'];
      const measureCount = 2;
      
      const result = pairer.pair(lyrics, measureCount);
      
      expect(result).toEqual([
        { text: ':::Watch drummer:::', measures: 2, isMusician: true },
      ]);
    });

    // Additional test: Empty lyric line (just timing)
    it('should handle empty lyric line with only timing marker', () => {
      const lyrics = ['_4'];
      const measureCount = 4;
      
      const result = pairer.pair(lyrics, measureCount);
      
      expect(result).toEqual([
        { text: '', measures: 4 },
      ]);
    });

    // Additional test: Multiple lines with different markers
    it('should handle mixed lyric types', () => {
      const lyrics = ['First line _2', '***Bridge*** _1', ':::Solo::: _1'];
      const measureCount = 4;
      
      const result = pairer.pair(lyrics, measureCount);
      
      expect(result).toEqual([
        { text: 'First line', measures: 2 },
        { text: '***Bridge***', measures: 1, isInfo: true },
        { text: ':::Solo:::', measures: 1, isMusician: true },
      ]);
    });
  });
});
