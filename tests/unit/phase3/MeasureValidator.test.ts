import { MeasureValidator } from '../../../src/phase3/MeasureValidator';
import { SongCodeError } from '../../../src/errors/SongCodeError';
import { Section } from '../../../src/phase1/SectionParser';

describe('MeasureValidator', () => {
  let validator: MeasureValidator;

  beforeEach(() => {
    validator = new MeasureValidator();
  });

  describe('Valid sections without modifiers', () => {
    // Test 3.2.1: Section with matching measures (no modifiers)
    it('should validate section with matching measure counts', () => {
      const section: Section = {
        name: 'Verse',
        pattern: 'A;G;D;E',
        lyrics: ['Line 1 _4'],
      };
      const patternMeasures = 4;
      const lyricMeasures = 4;

      expect(() => validator.validate(section, patternMeasures, lyricMeasures)).not.toThrow();
    });

    // Test 3.2.11: Empty pattern with empty lyrics
    it('should validate section with empty pattern and empty lyrics', () => {
      const section: Section = {
        name: 'Instrumental',
        pattern: '',
        lyrics: [],
      };
      const patternMeasures = 0;
      const lyricMeasures = 0;

      expect(() => validator.validate(section, patternMeasures, lyricMeasures)).not.toThrow();
    });
  });

  describe('Valid sections with _repeat modifier', () => {
    // Test 3.2.2: Section with _repeat modifier
    it('should validate section with _repeat modifier', () => {
      const section: Section = {
        name: 'Chorus',
        pattern: 'A;G;D;E',
        lyrics: ['Line 1 _8'],
        repeat: 2,
      };
      const patternMeasures = 4;
      const lyricMeasures = 8;

      expect(() => validator.validate(section, patternMeasures, lyricMeasures)).not.toThrow();
    });
  });

  describe('Valid sections with _cutStart modifier', () => {
    // Test 3.2.3: Section with _cutStart (measures only)
    it('should validate section with _cutStart removing measures', () => {
      const section: Section = {
        name: 'Verse',
        pattern: '$1',
        lyrics: ['Line 1 _4'],
        cutStart: [2, 0],
      };
      const patternMeasures = 6;
      const lyricMeasures = 4;

      expect(() => validator.validate(section, patternMeasures, lyricMeasures)).not.toThrow();
    });

    // Test 3.2.4: Section with _cutStart (measures and beats)
    it('should validate section with _cutStart removing measures and beats', () => {
      const section: Section = {
        name: 'Bridge',
        pattern: '$1',
        lyrics: ['Line 1 _3'],
        cutStart: [1, 2], // Remove 1 measure + 2-beat measure
      };
      const patternMeasures = 5; // 4+2+4+4+4 beats = 5 measures
      const lyricMeasures = 3;

      expect(() => validator.validate(section, patternMeasures, lyricMeasures)).not.toThrow();
    });
  });

  describe('Valid sections with _cutEnd modifier', () => {
    // Test 3.2.5: Section with _cutEnd (measures only)
    it('should validate section with _cutEnd removing measures', () => {
      const section: Section = {
        name: 'Outro',
        pattern: '$1',
        lyrics: ['Line 1 _4'],
        cutEnd: [2, 0],
      };
      const patternMeasures = 6;
      const lyricMeasures = 4;

      expect(() => validator.validate(section, patternMeasures, lyricMeasures)).not.toThrow();
    });
  });

  describe('Valid sections with _before modifier', () => {
    // Test 3.2.6: Section with _before modifier
    it('should validate section with _before pattern', () => {
      const section: Section = {
        name: 'Verse',
        pattern: 'A;G;D;E',
        lyrics: ['Line 1 _6'],
        before: {
          sc: 'A;D',
          json: null,
          measures: 2,
        },
      };
      const patternMeasures = 4;
      const lyricMeasures = 6;
      const beforeMeasures = 2;

      expect(() => validator.validate(section, patternMeasures, lyricMeasures, beforeMeasures)).not.toThrow();
    });
  });

  describe('Valid sections with _after modifier', () => {
    // Test 3.2.7: Section with _after modifier
    it('should validate section with _after pattern', () => {
      const section: Section = {
        name: 'Chorus',
        pattern: 'A;G;D;E',
        lyrics: ['Line 1 _6'],
        after: {
          sc: 'G;C',
          json: null,
          measures: 2,
        },
      };
      const patternMeasures = 4;
      const lyricMeasures = 6;
      const afterMeasures = 2;

      expect(() => validator.validate(section, patternMeasures, lyricMeasures, undefined, afterMeasures)).not.toThrow();
    });
  });

  describe('Valid sections with multiple modifiers', () => {
    // Test 3.2.8: Section with all modifiers
    it('should validate section with all modifiers combined', () => {
      const section: Section = {
        name: 'Complex',
        pattern: '$1',
        lyrics: ['Line 1 _14'],
        repeat: 2,
        cutStart: [2, 0],
        cutEnd: [2, 0],
        before: {
          sc: 'A',
          json: null,
          measures: 1,
        },
        after: {
          sc: 'G',
          json: null,
          measures: 1,
        },
      };
      const patternMeasures = 8;
      const lyricMeasures = 14;
      const beforeMeasures = 1;
      const afterMeasures = 1;
      // Expected: 1 + (8 × 2 - 2 - 2) + 1 = 1 + 12 + 1 = 14

      expect(() => validator.validate(section, patternMeasures, lyricMeasures, beforeMeasures, afterMeasures)).not.toThrow();
    });
  });

  describe('Invalid sections - measure mismatch', () => {
    // Test 3.2.9: Too few lyrics
    it('should reject section with too few lyric measures', () => {
      const section: Section = {
        name: 'Verse',
        pattern: 'A;G;D;E',
        lyrics: ['Line 1 _2'],
      };
      const patternMeasures = 4;
      const lyricMeasures = 2;

      expect(() => validator.validate(section, patternMeasures, lyricMeasures)).toThrow(SongCodeError);
      try {
        validator.validate(section, patternMeasures, lyricMeasures);
      } catch (error) {
        expect(error).toBeInstanceOf(SongCodeError);
        expect((error as SongCodeError).code).toBe('E3.2.1');
        expect((error as SongCodeError).message).toContain('measure count mismatch');
      }
    });

    // Test 3.2.10: Too many lyrics
    it('should reject section with too many lyric measures', () => {
      const section: Section = {
        name: 'Chorus',
        pattern: 'A;G;D;E',
        lyrics: ['Line 1 _6'],
      };
      const patternMeasures = 4;
      const lyricMeasures = 6;

      expect(() => validator.validate(section, patternMeasures, lyricMeasures)).toThrow(SongCodeError);
      try {
        validator.validate(section, patternMeasures, lyricMeasures);
      } catch (error) {
        expect(error).toBeInstanceOf(SongCodeError);
        expect((error as SongCodeError).code).toBe('E3.2.1');
        expect((error as SongCodeError).message).toContain('measure count mismatch');
      }
    });

    // Test 3.2.12: Empty pattern with lyrics
    it('should reject section with empty pattern but lyrics present', () => {
      const section: Section = {
        name: 'Intro',
        pattern: '',
        lyrics: ['Line 1 _4'],
      };
      const patternMeasures = 0;
      const lyricMeasures = 4;

      expect(() => validator.validate(section, patternMeasures, lyricMeasures)).toThrow(SongCodeError);
      try {
        validator.validate(section, patternMeasures, lyricMeasures);
      } catch (error) {
        expect(error).toBeInstanceOf(SongCodeError);
        expect((error as SongCodeError).code).toBe('E3.2.1');
      }
    });
  });
});
