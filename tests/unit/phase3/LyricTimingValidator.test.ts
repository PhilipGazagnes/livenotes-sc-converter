import { LyricTimingValidator } from '../../../src/phase3/LyricTimingValidator';
import { SongCodeError } from '../../../src/errors/SongCodeError';

describe('LyricTimingValidator', () => {
  let validator: LyricTimingValidator;

  beforeEach(() => {
    validator = new LyricTimingValidator();
  });

  describe('validate() - permissive mode', () => {
    it('should pass when all lyrics have valid timing markers and sum matches', () => {
      expect(() => validator.validate(['First line _2', 'Second line _2'], 4)).not.toThrow();
    });

    it('should pass when no lyrics have timing markers (all null)', () => {
      expect(() => validator.validate(['First line', 'Second line'], 4)).not.toThrow();
    });

    it('should pass when some lyrics have timing markers and some do not', () => {
      expect(() => validator.validate(['First line _2', 'Second line'], 4)).not.toThrow();
    });

    it('should pass with a single lyric with a valid timing marker', () => {
      expect(() => validator.validate(['First line _4'], 4)).not.toThrow();
    });

    it('should pass with info markers', () => {
      expect(() => validator.validate(['***Solo*** _4'], 4)).not.toThrow();
    });

    it('should pass with musician markers', () => {
      expect(() => validator.validate([':::Watch drummer::: _2', 'Continue _2'], 4)).not.toThrow();
    });

    it('should pass with empty lyric line that has a timing marker', () => {
      expect(() => validator.validate(['_4'], 4)).not.toThrow();
    });

    it('should handle sections with no lyrics gracefully', () => {
      expect(() => validator.validate([], 0)).not.toThrow();
    });
  });

  describe('validate() - sum validation (all lyrics have counts)', () => {
    it('should throw E3.4.4 when all lyrics have counts but sum does not match total', () => {
      expect(() => validator.validate(['First line _2', 'Second line _1'], 4)).toThrow(SongCodeError);
      try {
        validator.validate(['First line _2', 'Second line _1'], 4);
      } catch (error) {
        expect((error as SongCodeError).code).toBe('E3.4.4');
        expect((error as SongCodeError).message).toContain('total does not match');
      }
    });

    it('should throw E3.4.3 when a measure count is zero', () => {
      expect(() => validator.validate(['First line _0'], 0)).toThrow(SongCodeError);
      try {
        validator.validate(['First line _0'], 0);
      } catch (error) {
        expect((error as SongCodeError).code).toBe('E3.4.3');
        expect((error as SongCodeError).message).toContain('must be positive');
      }
    });

    it('should not throw E3.4.4 when only some lyrics have counts (permissive)', () => {
      // Mixed counts → sum validation is skipped entirely
      expect(() => validator.validate(['First line _2', 'Second line'], 4)).not.toThrow();
    });
  });
});
