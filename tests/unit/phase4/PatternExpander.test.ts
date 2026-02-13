import { PatternExpander } from '../../../src/phase4/PatternExpander';
import { PatternJSON } from '../../../src/types';

describe('PatternExpander', () => {
  let expander: PatternExpander;

  beforeEach(() => {
    expander = new PatternExpander();
  });

  describe('expand()', () => {
    // Test 4.1.1: Expand simple pattern (no loops)
    it('should return pattern unchanged when no loops present', () => {
      const input: PatternJSON = [
        [['A', '']],
        [['G', '']],
      ];
      
      const result = expander.expand(input);
      
      expect(result).toEqual([
        [['A', '']],
        [['G', '']],
      ]);
    });

    // Test 4.1.2: Expand pattern with loop
    it('should expand loop by repeat count', () => {
      const input: PatternJSON = [
        'loopStart',
        [['A', '']],
        [['G', '']],
        'loopEnd:3',
      ];
      
      const result = expander.expand(input);
      
      expect(result).toEqual([
        [['A', '']],
        [['G', '']],
        [['A', '']],
        [['G', '']],
        [['A', '']],
        [['G', '']],
      ]);
    });

    // Test 4.1.3: Expand pattern with loop and extra measures
    it('should expand loop and include measures after loop', () => {
      const input: PatternJSON = [
        'loopStart',
        [['A', '']],
        [['G', '']],
        'loopEnd:2',
        [['D', '']],
      ];
      
      const result = expander.expand(input);
      
      expect(result).toEqual([
        [['A', '']],
        [['G', '']],
        [['A', '']],
        [['G', '']],
        [['D', '']],
      ]);
    });

    // Test 4.1.4: Remove newLine markers during expansion
    it('should remove newLine markers from pattern', () => {
      const input: PatternJSON = [
        [['A', '']],
        'newLine',
        [['G', '']],
      ];
      
      const result = expander.expand(input);
      
      expect(result).toEqual([
        [['A', '']],
        [['G', '']],
      ]);
    });

    // Additional test: Nested structures (combined loops and newLines)
    it('should handle loops with newLine markers', () => {
      const input: PatternJSON = [
        'loopStart',
        [['A', '']],
        'newLine',
        [['G', '']],
        'loopEnd:2',
      ];
      
      const result = expander.expand(input);
      
      expect(result).toEqual([
        [['A', '']],
        [['G', '']],
        [['A', '']],
        [['G', '']],
      ]);
    });

    // Additional test: Empty pattern
    it('should handle empty pattern', () => {
      const input: PatternJSON = [];
      
      const result = expander.expand(input);
      
      expect(result).toEqual([]);
    });

    // Additional test: Pattern with only newLines
    it('should return empty array when pattern only contains newLine markers', () => {
      const input: PatternJSON = ['newLine', 'newLine'];
      
      const result = expander.expand(input);
      
      expect(result).toEqual([]);
    });
  });
});
