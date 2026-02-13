import { TimeSignatureValidator } from '../../../src/phase3/TimeSignatureValidator';
import { SongCodeError } from '../../../src/errors/SongCodeError';
import { Chord, ChordPosition } from '../../../src/types';

describe('TimeSignatureValidator', () => {
  let validator: TimeSignatureValidator;

  beforeEach(() => {
    validator = new TimeSignatureValidator();
  });

  describe('Valid time signatures', () => {
    // Test 3.1.1: Single chord in 4/4 = 4 beats (valid)
    it('should validate single chord in 4/4 time', () => {
      const measure: Chord[] = [['A', '']];
      const timeSignature = { numerator: 4, denominator: 4 };

      expect(() => validator.validate(measure, timeSignature)).not.toThrow();
    });

    // Test 3.1.2: Two chords in 4/4 = 2 beats each (valid)
    it('should validate two chords in 4/4 time', () => {
      const measure: Chord[] = [['A', ''], ['D', '']];
      const timeSignature = { numerator: 4, denominator: 4 };

      expect(() => validator.validate(measure, timeSignature)).not.toThrow();
    });

    // Test 3.1.3: Four chords in 4/4 = 1 beat each (valid)
    it('should validate four chords in 4/4 time', () => {
      const measure: Chord[] = [['A', ''], ['D', ''], ['G', ''], ['C', '']];
      const timeSignature = { numerator: 4, denominator: 4 };

      expect(() => validator.validate(measure, timeSignature)).not.toThrow();
    });

    // Test 3.1.5: Single chord in 3/4 = 3 beats (valid)
    it('should validate single chord in 3/4 time', () => {
      const measure: Chord[] = [['A', '']];
      const timeSignature = { numerator: 3, denominator: 4 };

      expect(() => validator.validate(measure, timeSignature)).not.toThrow();
    });

    // Test 3.1.6: Three chords in 3/4 = 1 beat each (valid)
    it('should validate three chords in 3/4 time', () => {
      const measure: Chord[] = [['A', ''], ['D', ''], ['G', '']];
      const timeSignature = { numerator: 3, denominator: 4 };

      expect(() => validator.validate(measure, timeSignature)).not.toThrow();
    });
  });

  describe('Invalid chord positions', () => {
    // Test 3.1.4: Three chords in 4/4 = 1.33... beats (invalid)
    it('should reject three chords in 4/4 time', () => {
      const measure: Chord[] = [['A', ''], ['D', ''], ['G', '']];
      const timeSignature = { numerator: 4, denominator: 4 };

      expect(() => validator.validate(measure, timeSignature)).toThrow(SongCodeError);
      try {
        validator.validate(measure, timeSignature);
      } catch (error) {
        expect(error).toBeInstanceOf(SongCodeError);
        expect((error as SongCodeError).code).toBe('E3.1.1');
        expect((error as SongCodeError).message).toContain('Invalid chord positions');
      }
    });

    // Test 3.1.7: Two chords in 3/4 = 1.5 beats (invalid)
    it('should reject two chords in 3/4 time', () => {
      const measure: Chord[] = [['A', ''], ['D', '']];
      const timeSignature = { numerator: 3, denominator: 4 };

      expect(() => validator.validate(measure, timeSignature)).toThrow(SongCodeError);
      try {
        validator.validate(measure, timeSignature);
      } catch (error) {
        expect(error).toBeInstanceOf(SongCodeError);
        expect((error as SongCodeError).code).toBe('E3.1.1');
      }
    });
  });

  describe('Removers', () => {
    // Test 3.1.8: Single chord with one remover in 4/4 (valid)
    it('should validate single chord with remover in 4/4 time', () => {
      const measure: ChordPosition[] = [['A', ''], ['=']];
      const timeSignature = { numerator: 4, denominator: 4 };

      expect(() => validator.validate(measure, timeSignature)).not.toThrow();
    });

    // Test 3.1.9: Two chords with two removers in 4/4 (valid)
    it('should validate two chords with two removers in 4/4 time', () => {
      const measure: ChordPosition[] = [['A', ''], ['D', ''], ['='], ['=']];
      const timeSignature = { numerator: 4, denominator: 4 };

      expect(() => validator.validate(measure, timeSignature)).not.toThrow();
    });

    // Test 3.1.10: Single chord with three removers in 4/4 (valid - 1 beat remaining)
    it('should validate single chord with three removers in 4/4 time', () => {
      const measure: ChordPosition[] = [['A', ''], ['='], ['='], ['=']];
      const timeSignature = { numerator: 4, denominator: 4 };

      expect(() => validator.validate(measure, timeSignature)).not.toThrow();
    });

    // Test 3.1.11: Single chord with two removers removes all 4 beats (invalid)
    it('should reject when removers eliminate all beats', () => {
      const measure: ChordPosition[] = [['A', ''], ['='], ['=']];
      const timeSignature = { numerator: 4, denominator: 4 };

      expect(() => validator.validate(measure, timeSignature)).toThrow(SongCodeError);
      try {
        validator.validate(measure, timeSignature);
      } catch (error) {
        expect(error).toBeInstanceOf(SongCodeError);
        expect((error as SongCodeError).code).toBe('E3.1.2');
        expect((error as SongCodeError).message).toContain('removers eliminate all beats');
      }
    });
  });

  describe('Special symbols', () => {
    // Test 3.1.12: Silence symbol
    it('should validate silence symbol _ as taking all beats', () => {
      const measure: ChordPosition[] = [['_']];
      const timeSignature = { numerator: 4, denominator: 4 };

      expect(() => validator.validate(measure, timeSignature)).not.toThrow();
    });

    // Test 3.1.13: Repeat symbol
    it('should validate repeat symbol % (timing checked after resolution)', () => {
      const measure: ChordPosition[] = [['%']];
      const timeSignature = { numerator: 4, denominator: 4 };

      expect(() => validator.validate(measure, timeSignature)).not.toThrow();
    });
  });
});
