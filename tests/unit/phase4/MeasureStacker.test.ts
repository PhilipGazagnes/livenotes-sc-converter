import { MeasureStacker } from '../../../src/phase4/MeasureStacker';
import { Measure } from '../../../src/types';
import { Section } from '../../../src/phase1/SectionParser';

describe('MeasureStacker', () => {
  let stacker: MeasureStacker;

  beforeEach(() => {
    stacker = new MeasureStacker();
  });

  describe('stack()', () => {
    // Test 4.2.1: Apply _repeat modifier
    it('should repeat pattern measures by _repeat count', () => {
      const measures: Measure[] = [
        [['A', '']],
        [['G', '']],
      ];
      const section: Section = {
        name: 'Chorus',
        pattern: 'A;G',
        lyrics: [],
        repeat: 3,
      };
      
      const result = stacker.stack(measures, section);
      
      expect(result).toEqual([
        [['A', '']],
        [['G', '']],
        [['A', '']],
        [['G', '']],
        [['A', '']],
        [['G', '']],
      ]);
      expect(result.length).toBe(6);
    });

    // Test 4.2.2: Apply _cutStart (remove full measures)
    it('should remove measures from start with _cutStart', () => {
      const measures: Measure[] = [
        [['A', '']],
        [['G', '']],
        [['D', '']],
        [['E', '']],
      ];
      const section: Section = {
        name: 'Verse',
        pattern: 'A;G;D;E',
        lyrics: [],
        cutStart: [2, 0],
      };
      
      const result = stacker.stack(measures, section);
      
      expect(result).toEqual([
        [['D', '']],
        [['E', '']],
      ]);
    });

    // Test 4.2.3: Apply _cutEnd (remove full measures)
    it('should remove measures from end with _cutEnd', () => {
      const measures: Measure[] = [
        [['A', '']],
        [['G', '']],
        [['D', '']],
        [['E', '']],
      ];
      const section: Section = {
        name: 'Outro',
        pattern: 'A;G;D;E',
        lyrics: [],
        cutEnd: [2, 0],
      };
      
      const result = stacker.stack(measures, section);
      
      expect(result).toEqual([
        [['A', '']],
        [['G', '']],
      ]);
    });

    // Test 4.2.4: Apply _before modifier
    it('should prepend _before measures', () => {
      const mainMeasures: Measure[] = [
        [['A', '']],
        [['G', '']],
      ];
      const beforeMeasures: Measure[] = [
        [['C', '']],
      ];
      const section: Section = {
        name: 'Verse',
        pattern: 'A;G',
        lyrics: [],
        before: {
          sc: 'C',
          json: null,
          measures: 1,
        },
      };
      
      const result = stacker.stack(mainMeasures, section, beforeMeasures);
      
      expect(result).toEqual([
        [['C', '']],
        [['A', '']],
        [['G', '']],
      ]);
    });

    // Test 4.2.5: Apply _after modifier
    it('should append _after measures', () => {
      const mainMeasures: Measure[] = [
        [['A', '']],
        [['G', '']],
      ];
      const afterMeasures: Measure[] = [
        [['D', '']],
      ];
      const section: Section = {
        name: 'Chorus',
        pattern: 'A;G',
        lyrics: [],
        after: {
          sc: 'D',
          json: null,
          measures: 1,
        },
      };
      
      const result = stacker.stack(mainMeasures, section, undefined, afterMeasures);
      
      expect(result).toEqual([
        [['A', '']],
        [['G', '']],
        [['D', '']],
      ]);
    });

    // Test 4.2.6: Apply combined modifiers in correct order
    it('should apply all modifiers in correct order: repeat → cutEnd → before/after', () => {
      const mainMeasures: Measure[] = [
        [['A', '']],
        [['G', '']],
      ];
      const beforeMeasures: Measure[] = [
        [['C', '']],
      ];
      const section: Section = {
        name: 'Complex',
        pattern: 'A;G',
        lyrics: [],
        repeat: 2,
        cutEnd: [1, 0],
        before: {
          sc: 'C',
          json: null,
          measures: 1,
        },
      };
      
      const result = stacker.stack(mainMeasures, section, beforeMeasures);
      
      // Expected: repeat (A,G,A,G) → cutEnd -1 (A,G,A) → before +C (C,A,G,A)
      expect(result).toEqual([
        [['C', '']],
        [['A', '']],
        [['G', '']],
        [['A', '']],
      ]);
    });

    // Additional test: No modifiers
    it('should return measures unchanged when no modifiers present', () => {
      const measures: Measure[] = [
        [['A', '']],
        [['G', '']],
      ];
      const section: Section = {
        name: 'Intro',
        pattern: 'A;G',
        lyrics: [],
      };
      
      const result = stacker.stack(measures, section);
      
      expect(result).toEqual(measures);
    });

    // Additional test: Empty measures
    it('should handle empty measures array', () => {
      const measures: Measure[] = [];
      const section: Section = {
        name: 'Empty',
        pattern: '',
        lyrics: [],
      };
      
      const result = stacker.stack(measures, section);
      
      expect(result).toEqual([]);
    });
  });
});
