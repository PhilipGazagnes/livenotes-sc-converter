import { SongCodeConverter } from '../../src';
import * as fs from 'fs';
import * as path from 'path';

describe('Documentation Examples', () => {
  let converter: SongCodeConverter;
  const docsPath = '/Users/a1234/Documents/www/livenotes-documentation/songcode/convertion-examples';

  beforeEach(() => {
    converter = new SongCodeConverter();
  });

  describe('01-basic', () => {
    test('minimal-song.sc should match expected JSON', () => {
      const scPath = path.join(docsPath, '01-basic', 'minimal-song.sc');
      const jsonPath = path.join(docsPath, '01-basic', 'minimal-song.json');

      const scContent = fs.readFileSync(scPath, 'utf-8');
      const expectedJson = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

      const result = converter.convert(scContent);

      expect(result).toEqual(expectedJson);
    });

    test('simple-verse-chorus.sc should match expected JSON', () => {
      const scPath = path.join(docsPath, '01-basic', 'simple-verse-chorus.sc');
      const jsonPath = path.join(docsPath, '01-basic', 'simple-verse-chorus.json');

      const scContent = fs.readFileSync(scPath, 'utf-8');
      const expectedJson = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

      const result = converter.convert(scContent);

      expect(result).toEqual(expectedJson);
    });
  });

  describe('02-intermediate', () => {
    test('loops-demo.sc should match expected JSON', () => {
      const scPath = path.join(docsPath, '02-intermediate', 'loops-demo.sc');
      const jsonPath = path.join(docsPath, '02-intermediate', 'loops-demo.json');

      const scContent = fs.readFileSync(scPath, 'utf-8');
      const expectedJson = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

      const result = converter.convert(scContent);

      expect(result).toEqual(expectedJson);
    });

    test('modifiers-demo.sc should match expected JSON', () => {
      const scPath = path.join(docsPath, '02-intermediate', 'modifiers-demo.sc');
      const jsonPath = path.join(docsPath, '02-intermediate', 'modifiers-demo.json');

      const scContent = fs.readFileSync(scPath, 'utf-8');
      const expectedJson = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

      const result = converter.convert(scContent);

      expect(result).toEqual(expectedJson);
    });

    test('pattern-reuse.sc should match expected JSON', () => {
      const scPath = path.join(docsPath, '02-intermediate', 'pattern-reuse.sc');
      const jsonPath = path.join(docsPath, '02-intermediate', 'pattern-reuse.json');

      const scContent = fs.readFileSync(scPath, 'utf-8');
      const expectedJson = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

      const result = converter.convert(scContent);

      expect(result).toEqual(expectedJson);
    });

    test('repeat-symbol.sc should match expected JSON', () => {
      const scPath = path.join(docsPath, '02-intermediate', 'repeat-symbol.sc');
      const jsonPath = path.join(docsPath, '02-intermediate', 'repeat-symbol.json');

      const scContent = fs.readFileSync(scPath, 'utf-8');
      const expectedJson = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

      const result = converter.convert(scContent);

      expect(result).toEqual(expectedJson);
    });
  });

  describe('03-advanced', () => {
    test('highway-to-hell.sc should match expected JSON', () => {
      const scPath = path.join(docsPath, '03-advanced', 'highway-to-hell.sc');
      const jsonPath = path.join(docsPath, '03-advanced', 'highway-to-hell.json');

      const scContent = fs.readFileSync(scPath, 'utf-8');
      const expectedJson = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

      const result = converter.convert(scContent);

      expect(result).toEqual(expectedJson);
    });
  });

  describe('04-edge-cases', () => {
    test('cut-modifiers.sc should match expected JSON', () => {
      const scPath = path.join(docsPath, '04-edge-cases', 'cut-modifiers.sc');
      const jsonPath = path.join(docsPath, '04-edge-cases', 'cut-modifiers.json');

      const scContent = fs.readFileSync(scPath, 'utf-8');
      const expectedJson = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

      const result = converter.convert(scContent);

      expect(result).toEqual(expectedJson);
    });

    test('empty-measures.sc should match expected JSON', () => {
      const scPath = path.join(docsPath, '04-edge-cases', 'empty-measures.sc');
      const jsonPath = path.join(docsPath, '04-edge-cases', 'empty-measures.json');

      const scContent = fs.readFileSync(scPath, 'utf-8');
      const expectedJson = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

      const result = converter.convert(scContent);

      expect(result).toEqual(expectedJson);
    });

    test('extreme-modifiers.sc should match expected JSON', () => {
      const scPath = path.join(docsPath, '04-edge-cases', 'extreme-modifiers.sc');
      const jsonPath = path.join(docsPath, '04-edge-cases', 'extreme-modifiers.json');

      const scContent = fs.readFileSync(scPath, 'utf-8');
      const expectedJson = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

      const result = converter.convert(scContent);

      expect(result).toEqual(expectedJson);
    });

    test('multi-chord-measures.sc should match expected JSON', () => {
      const scPath = path.join(docsPath, '04-edge-cases', 'multi-chord-measures.sc');
      const jsonPath = path.join(docsPath, '04-edge-cases', 'multi-chord-measures.json');

      const scContent = fs.readFileSync(scPath, 'utf-8');
      const expectedJson = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

      const result = converter.convert(scContent);

      expect(result).toEqual(expectedJson);
    });

    test('removers-demo.sc should match expected JSON', () => {
      const scPath = path.join(docsPath, '04-edge-cases', 'removers-demo.sc');
      const jsonPath = path.join(docsPath, '04-edge-cases', 'removers-demo.json');

      const scContent = fs.readFileSync(scPath, 'utf-8');
      const expectedJson = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

      const result = converter.convert(scContent);

      expect(result).toEqual(expectedJson);
    });
  });
});
