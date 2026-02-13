import { PromptItemBuilder } from '../../../src/phase4/PromptItemBuilder';
import { Measure } from '../../../src/types';
import { SongCodeError } from '../../../src/errors/SongCodeError';

describe('PromptItemBuilder', () => {
  let builder: PromptItemBuilder;

  beforeEach(() => {
    builder = new PromptItemBuilder();
  });

  describe('buildTempoItem()', () => {
    // Test 4.4.1: Build tempo item
    it('should build tempo change item', () => {
      const result = builder.buildTempoItem(140, [4, 4]);
      
      expect(result).toEqual({
        type: 'tempo',
        bpm: 140,
        time: '4/4',
      });
    });
  });

  describe('buildContentItem()', () => {
    // Test 4.4.2: Build content item with chords and lyrics (default style)
    it('should build content item with chords and lyrics', () => {
      const measures: Measure[] = [[['A', '']]];
      const lyric = 'First line';
      
      const result = builder.buildContentItem(measures, lyric);
      
      expect(result.type).toBe('content');
      if (result.type === 'content') {
        expect(result.style).toBe('default');
        expect(result.chords).toEqual([{
          repeats: 1,
          pattern: [[['A', '']]],
        }]);
        expect(result.lyrics).toBe('First line');
      }
    });

    // Test 4.4.3: Build content item with empty lyrics
    it('should build content item with empty lyrics', () => {
      const measures: Measure[] = [[['A', '']]];
      const lyric = '';
      
      const result = builder.buildContentItem(measures, lyric);
      
      expect(result.type).toBe('content');
      if (result.type === 'content') {
        expect(result.style).toBe('default');
        expect(result.lyrics).toBe('');
      }
    });

    // Test 4.4.3b: Build content item with info marker
    it('should build content item with info style', () => {
      const measures: Measure[] = [[['A', '']]];
      const lyric = 'Solo';
      
      const result = builder.buildContentItem(measures, lyric, true, false);
      
      expect(result.type).toBe('content');
      if (result.type === 'content') {
        expect(result.style).toBe('info');
        expect(result.lyrics).toBe('Solo');
      }
    });

    // Test 4.4.3c: Build content item with musician marker
    it('should build content item with musicianInfo style', () => {
      const measures: Measure[] = [[['A', '']]];
      const lyric = 'Watch drummer';
      
      const result = builder.buildContentItem(measures, lyric, false, true);
      
      expect(result.type).toBe('content');
      if (result.type === 'content') {
        expect(result.style).toBe('musicianInfo');
        expect(result.lyrics).toBe('Watch drummer');
      }
    });
  });

  describe('resolveRepeatSymbols()', () => {
    // Test 4.4.4: Resolve % symbol to previous chord
    it('should resolve % to previous chord', () => {
      const measures: Measure[] = [
        [['A', '']],
        [['%']],
      ];
      
      const result = builder.resolveRepeatSymbols(measures);
      
      expect(result).toEqual([
        [['A', '']],
        [['A', '']],
      ]);
    });

    // Test 4.4.5: Resolve multiple % symbols
    it('should resolve multiple % symbols to same previous chord', () => {
      const measures: Measure[] = [
        [['A', '']],
        [['%']],
        [['%']],
        [['D', '']],
      ];
      
      const result = builder.resolveRepeatSymbols(measures);
      
      expect(result).toEqual([
        [['A', '']],
        [['A', '']],
        [['A', '']],
        [['D', '']],
      ]);
    });

    // Test 4.4.6: % at start with no previous chord (error)
    it('should throw error when % appears at start with no previous chord', () => {
      const measures: Measure[] = [[['%']]];
      
      expect(() => builder.resolveRepeatSymbols(measures)).toThrow(SongCodeError);
      try {
        builder.resolveRepeatSymbols(measures);
      } catch (error) {
        expect(error).toBeInstanceOf(SongCodeError);
        expect((error as SongCodeError).code).toBe('E4.1.1');
        expect((error as SongCodeError).message).toContain('no previous chord');
      }
    });

    // Additional test: Measure with mixed % and chords
    it('should handle measure with both chords and % symbol', () => {
      const measures: Measure[] = [
        [['A', ''], ['G', '']],
        [['%'], ['D', '']],
      ];
      
      const result = builder.resolveRepeatSymbols(measures);
      
      expect(result).toEqual([
        [['A', ''], ['G', '']],
        [['A', ''], ['G', ''], ['D', '']],
      ]);
    });

    // Additional test: No % symbols (unchanged)
    it('should return measures unchanged when no % symbols present', () => {
      const measures: Measure[] = [
        [['A', '']],
        [['G', '']],
      ];
      
      const result = builder.resolveRepeatSymbols(measures);
      
      expect(result).toEqual(measures);
    });
  });
});
