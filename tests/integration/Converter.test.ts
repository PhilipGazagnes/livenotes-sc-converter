/**
 * Integration tests for the main SongCodeConverter
 * 
 * Tests complete end-to-end conversion from SongCode to LivenotesJSON
 */

import * as fs from 'fs';
import * as path from 'path';
import { SongCodeConverter } from '../../src/index';

describe('SongCodeConverter - Integration Tests', () => {
  let converter: SongCodeConverter;
  const examplesPath = '/Users/a1234/Documents/www/livenotes-documentation/songcode/convertion-examples';

  beforeEach(() => {
    converter = new SongCodeConverter();
  });

  describe('simple-verse-chorus example', () => {
    const songCode = fs.readFileSync(
      path.join(examplesPath, '01-basic/simple-verse-chorus.sc'),
      'utf-8'
    );

    test('I1: should convert simple verse-chorus song correctly', () => {
      const result = converter.convert(songCode);

      // Check meta
      expect(result.meta.bpm).toBe(100);
      expect(result.meta.original).toBe('G');
      expect(result.meta.time).toEqual({ numerator: 4, denominator: 4 });

      // Check patterns - should have 2 patterns (A and B)
      expect(Object.keys(result.patterns)).toHaveLength(2);
      expect(result.patterns.A).toBeDefined();
      expect(result.patterns.B).toBeDefined();

      // Check pattern A (Verse)
      expect(result.patterns.A!.measures).toBe(8);
      expect(result.patterns.A!.json).toHaveLength(8);

      // Check pattern B (Chorus)
      expect(result.patterns.B!.measures).toBe(8);
      expect(result.patterns.B!.json).toHaveLength(8);

      // Check sections
      expect(result.sections).toHaveLength(2);
      
      // Verse section
      expect(result.sections[0]!.name).toBe('Verse');
      expect(result.sections[0]!.pattern.id).toBe('A');
      expect(result.sections[0]!.measures).toBe(8);
      expect(result.sections[0]!.lyrics).toHaveLength(4);
      expect(result.sections[0]!.lyrics[0]).toEqual({
        text: 'Walking down the road today',
        measures: 2,
        style: 'normal',
      });

      // Chorus section
      expect(result.sections[1]!.name).toBe('Chorus');
      expect(result.sections[1]!.pattern.id).toBe('B');
      expect(result.sections[1]!.measures).toBe(8);
      expect(result.sections[1]!.lyrics).toHaveLength(4);
      expect(result.sections[1]!.lyrics[0]).toEqual({
        text: 'This is my song',
        measures: 2,
        style: 'normal',
      });

      // Check prompter
      expect(result.prompter.length).toBeGreaterThan(0);
      expect(result.prompter[0]).toEqual({
        type: 'tempo',
        bpm: 100,
        time: '4/4',
      });
    });
  });

  describe('minimal song example', () => {
    const songCode = `Instrumental
C;G;Am;F
--`;

    test('I2: should convert minimal instrumental song', () => {
      const result = converter.convert(songCode);

      // Should have default metadata
      expect(result.meta).toBeDefined();

      // Should have 1 pattern with 4 measures
      expect(Object.keys(result.patterns)).toHaveLength(1);
      expect(result.patterns.A).toBeDefined();
      expect(result.patterns.A!.json).toHaveLength(4);

      // Should have 1 section
      expect(result.sections).toHaveLength(1);
      expect(result.sections[0]!.name).toBe('Instrumental');
      expect(result.sections[0]!.pattern.id).toBe('A');
      expect(result.sections[0]!.lyrics).toEqual([]);
    });
  });

  describe('pattern reference example', () => {
    const songCode = `$1
A;G;D;A

Verse
$1
--
First line _2
Second line _2

Chorus
$1
--
Chorus line _2
Another line _2`;

    test('I3: should reuse pattern reference across sections', () => {
      const result = converter.convert(songCode);

      // Should have only 1 pattern (reused)
      expect(Object.keys(result.patterns)).toHaveLength(1);
      expect(result.patterns.A).toBeDefined();

      // Both sections should reference same pattern
      expect(result.sections).toHaveLength(2);
      expect(result.sections[0]!.pattern.id).toBe('A');
      expect(result.sections[1]!.pattern.id).toBe('A');
    });
  });

  describe('special lyric markers', () => {
    const songCode = `Verse
A;G
--
***Intro*** _1
Normal lyric _1
`;

    test('I4: should detect info marker', () => {
      const result = converter.convert(songCode);

      expect(result.sections[0]!.lyrics).toHaveLength(2);
      expect(result.sections[0]!.lyrics[0]).toEqual({
        text: 'Intro',
        measures: 1,
        style: 'info',
      });
      expect(result.sections[0]!.lyrics[1]).toEqual({
        text: 'Normal lyric',
        measures: 1,
        style: 'normal',
      });
    });

    test('I5: should detect musician marker', () => {
      const songCode = `Verse
A;G
--
:::Watch drummer::: _1
Normal lyric _1
`;

      const result = converter.convert(songCode);

      expect(result.sections[0]!.lyrics).toHaveLength(2);
      expect(result.sections[0]!.lyrics[0]).toEqual({
        text: 'Watch drummer',
        measures: 1,
        style: 'musician',
      });
      expect(result.sections[0]!.lyrics[1]).toEqual({
        text: 'Normal lyric',
        measures: 1,
        style: 'normal',
      });
    });
  });

  describe('pattern normalization', () => {
    const songCode = `$1
A;G;D;A

$2
A ; G ; D ; A

Verse
$1
--
Line _4

Chorus
$2
--
Line _4`;

    test('I6: should normalize and deduplicate patterns with different spacing', () => {
      const result = converter.convert(songCode);

      // Should recognize $1 and $2 as same pattern after normalization
      expect(Object.keys(result.patterns)).toHaveLength(1);
      expect(result.patterns.A).toBeDefined();

      // Both sections should use same pattern ID
      expect(result.sections[0]!.pattern.id).toBe('A');
      expect(result.sections[1]!.pattern.id).toBe('A');
    });
  });
});
