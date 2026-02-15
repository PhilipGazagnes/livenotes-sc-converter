import { LyricTimingValidator } from '../../../src/phase3/LyricTimingValidator';
import { SongCodeError } from '../../../src/errors/SongCodeError';
import { Section } from '../../../src/phase1/SectionParser';

describe('LyricTimingValidator', () => {
  let validator: LyricTimingValidator;

  beforeEach(() => {
    validator = new LyricTimingValidator();
  });

  describe('validateAllOrNothing', () => {
    it('should return true when all lyrics have timing markers', () => {
      const sections: Section[] = [
        {
          name: 'Verse',
          pattern: 'A;G;D',
          lyrics: ['First line _2', 'Second line _2'],
        },
        {
          name: 'Chorus',
          pattern: 'C;G',
          lyrics: ['Chorus line _2'],
        },
      ];

      const result = validator.validateAllOrNothing(sections);
      expect(result).toBe(true);
    });

    it('should return false when no lyrics have timing markers', () => {
      const sections: Section[] = [
        {
          name: 'Verse',
          pattern: 'A;G;D',
          lyrics: ['First line', 'Second line'],
        },
        {
          name: 'Chorus',
          pattern: 'C;G',
          lyrics: ['Chorus line'],
        },
      ];

      const result = validator.validateAllOrNothing(sections);
      expect(result).toBe(false);
    });

    it('should throw E3.3.1 when some lyrics have timing markers and some do not', () => {
      const sections: Section[] = [
        {
          name: 'Verse',
          pattern: 'A;G;D',
          lyrics: ['First line _2', 'Second line'],  // Mixed!
        },
      ];

      expect(() => validator.validateAllOrNothing(sections)).toThrow(SongCodeError);
      try {
        validator.validateAllOrNothing(sections);
      } catch (error) {
        expect((error as SongCodeError).code).toBe('E3.3.1');
        expect((error as SongCodeError).message).toContain('All-or-nothing');
      }
    });

    it('should handle sections with no lyrics (instrumental)', () => {
      const sections: Section[] = [
        {
          name: 'Intro',
          pattern: 'A;G;D',
          lyrics: [],  // No lyrics
        },
        {
          name: 'Verse',
          pattern: 'C;G',
          lyrics: ['First line _2'],
        },
      ];

      const result = validator.validateAllOrNothing(sections);
      expect(result).toBe(true);
    });

    it('should handle info markers correctly', () => {
      const sections: Section[] = [
        {
          name: 'Intro',
          pattern: 'A;G;D',
          lyrics: ['***Intro*** _4'],
        },
        {
          name: 'Verse',
          pattern: 'C;G',
          lyrics: ['First line _2'],
        },
      ];

      const result = validator.validateAllOrNothing(sections);
      expect(result).toBe(true);
    });
  });

  describe('Valid lyric timing', () => {
    // Test 3.3.1: Single lyric line with valid timing
    it('should validate single lyric line with valid timing marker', () => {
      const lyrics = ['First line _4'];
      const totalMeasures = 4;

      expect(() => validator.validate(lyrics, totalMeasures)).not.toThrow();
    });

    // Test 3.3.2: Multiple lyric lines with valid total
    it('should validate multiple lyric lines with correct total', () => {
      const lyrics = ['First line _2', 'Second line _2'];
      const totalMeasures = 4;

      expect(() => validator.validate(lyrics, totalMeasures)).not.toThrow();
    });

    // Test 3.3.6: Info marker (should not need count)
    it('should validate info marker with measure count', () => {
      const lyrics = ['***Solo*** _4'];
      const totalMeasures = 4;

      expect(() => validator.validate(lyrics, totalMeasures)).not.toThrow();
    });

    // Test 3.3.7: Musician marker (should not need count)
    it('should validate musician marker with measure count', () => {
      const lyrics = [':::Watch drummer::: _2', 'Continue _2'];
      const totalMeasures = 4;

      expect(() => validator.validate(lyrics, totalMeasures)).not.toThrow();
    });

    // Test 3.3.8: Empty lyric line
    it('should validate empty lyric line with timing marker', () => {
      const lyrics = ['_4'];
      const totalMeasures = 4;

      expect(() => validator.validate(lyrics, totalMeasures)).not.toThrow();
    });
  });

  describe('Invalid lyric timing', () => {
    // Test 3.3.3: Lyric line missing measure count
    it('should reject lyric line without measure count', () => {
      const lyrics = ['First line'];
      const totalMeasures = 4;

      expect(() => validator.validate(lyrics, totalMeasures)).toThrow(SongCodeError);
      try {
        validator.validate(lyrics, totalMeasures);
      } catch (error) {
        expect(error).toBeInstanceOf(SongCodeError);
        expect((error as SongCodeError).code).toBe('E3.4.1');
        expect((error as SongCodeError).message).toContain('missing measure count');
      }
    });

    // Test 3.3.4: Lyric with invalid measure count format
    it('should reject lyric with invalid measure count format', () => {
      const lyrics = ['First line _abc'];
      const totalMeasures = 4;

      expect(() => validator.validate(lyrics, totalMeasures)).toThrow(SongCodeError);
      try {
        validator.validate(lyrics, totalMeasures);
      } catch (error) {
        expect(error).toBeInstanceOf(SongCodeError);
        expect((error as SongCodeError).code).toBe('E3.4.2');
        expect((error as SongCodeError).message).toContain('Invalid measure count format');
      }
    });

    // Test 3.3.5: Lyric with zero measures
    it('should reject lyric with zero measure count', () => {
      const lyrics = ['First line _0'];
      const totalMeasures = 4;

      expect(() => validator.validate(lyrics, totalMeasures)).toThrow(SongCodeError);
      try {
        validator.validate(lyrics, totalMeasures);
      } catch (error) {
        expect(error).toBeInstanceOf(SongCodeError);
        expect((error as SongCodeError).code).toBe('E3.4.3');
        expect((error as SongCodeError).message).toContain('must be positive');
      }
    });
  });

  describe('Total measure validation', () => {
    // Additional test: Lyric measures don't match total
    it('should reject when lyric measures do not sum to total', () => {
      const lyrics = ['First line _2', 'Second line _1'];
      const totalMeasures = 4;

      expect(() => validator.validate(lyrics, totalMeasures)).toThrow(SongCodeError);
      try {
        validator.validate(lyrics, totalMeasures);
      } catch (error) {
        expect(error).toBeInstanceOf(SongCodeError);
        expect((error as SongCodeError).code).toBe('E3.4.4');
        expect((error as SongCodeError).message).toContain('total does not match');
      }
    });
  });
});
