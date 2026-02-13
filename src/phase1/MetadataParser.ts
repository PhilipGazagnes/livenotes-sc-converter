/**
 * MetadataParser - Brick 2: Parse and validate metadata section
 * 
 * Responsible for:
 * - Parsing all metadata keys (@name, @artist, @bpm, @time, @original, @capo, @warning, @end)
 * - Validating metadata values (ranges, formats)
 * - Returning MetaObject for Livenotes JSON
 */

import { SongCodeError } from '../errors/SongCodeError';
import { MetaObject, TimeSignature } from '../types';

export class MetadataParser {
  // Valid keys and their parsers
  private static readonly VALID_KEYS = [
    'name',
    'artist',
    'bpm',
    'time',
    'original',
    'capo',
    'warning',
    'end',
  ];

  // Valid chord roots for @original key
  private static readonly VALID_CHORD_ROOTS = [
    'A', 'Am',
    'A#', 'A#m',
    'Ab', 'Abm',
    'B', 'Bm',
    'Bb', 'Bbm',
    'C', 'Cm',
    'C#', 'C#m',
    'D', 'Dm',
    'D#', 'D#m',
    'Db', 'Dbm',
    'E', 'Em',
    'Eb', 'Ebm',
    'F', 'Fm',
    'F#', 'F#m',
    'G', 'Gm',
    'G#', 'G#m',
    'Gb', 'Gbm',
  ];

  /**
   * Parse metadata from SongCode content
   * @param content - The metadata section content
   * @returns MetaObject with parsed metadata
   */
  parse(content: string): MetaObject {
    const meta: MetaObject = {};

    if (!content || content.trim() === '') {
      return meta;
    }

    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;
      
      const trimmedLine = line.trim();

      // Skip empty lines
      if (trimmedLine === '') continue;

      // Skip non-metadata lines
      if (!trimmedLine.startsWith('@')) continue;

      // Parse metadata line
      const match = trimmedLine.match(/^@(\w+)\s+(.+)$/);
      if (!match) {
        throw new SongCodeError(
          'E1.1.6',
          `Invalid metadata format at line ${i + 1}`,
          { line: i + 1 }
        );
      }

      const key = match[1];
      const value = match[2];

      if (!key || !value) {
        throw new SongCodeError(
          'E1.1.6',
          `Invalid metadata format at line ${i + 1}`,
          { line: i + 1 }
        );
      }

      // Validate key
      if (!MetadataParser.VALID_KEYS.includes(key)) {
        throw new SongCodeError(
          'E1.1.6',
          `Unknown metadata key: @${key}`,
          { line: i + 1 }
        );
      }

      // Parse and validate value
      this.parseMetadataValue(key, value, meta, i + 1);
    }

    return meta;
  }

  /**
   * Parse and validate a metadata value
   */
  private parseMetadataValue(
    key: string,
    value: string,
    meta: MetaObject,
    line: number
  ): void {
    switch (key) {
      case 'name':
        this.validateStringLength(value, 100, 'Song name', line);
        meta.name = value;
        break;

      case 'artist':
        this.validateStringLength(value, 100, 'Artist name', line);
        meta.artist = value;
        break;

      case 'bpm':
        meta.bpm = this.parseBPM(value, line);
        break;

      case 'time':
        meta.time = this.parseTimeSignature(value, line);
        break;

      case 'original':
        meta.original = this.parseOriginalKey(value, line);
        break;

      case 'capo':
        meta.capo = this.parseCapo(value, line);
        break;

      case 'warning':
        this.validateStringLength(value, 200, 'Warning', line);
        meta.warning = value;
        break;

      case 'end':
        this.validateStringLength(value, 200, 'End', line);
        meta.end = value;
        break;
    }
  }

  /**
   * Validate string length
   */
  private validateStringLength(
    value: string,
    maxLength: number,
    fieldName: string,
    line: number
  ): void {
    if (value.length > maxLength) {
      throw new SongCodeError(
        'E1.1.1',
        `${fieldName} exceeds maximum length of ${maxLength} characters`,
        { line }
      );
    }
  }

  /**
   * Parse and validate BPM
   */
  private parseBPM(value: string, line: number): number {
    const bpm = parseInt(value, 10);

    if (isNaN(bpm)) {
      throw new SongCodeError('E1.1.2', 'BPM must be a number', { line });
    }

    if (bpm < 0 || bpm > 400) {
      throw new SongCodeError('E1.1.2', 'BPM must be between 0 and 400', { line });
    }

    return bpm;
  }

  /**
   * Parse and validate time signature
   */
  private parseTimeSignature(value: string, line: number): TimeSignature {
    const match = value.match(/^(\d+)\/(\d+)$/);

    if (!match) {
      throw new SongCodeError(
        'E1.1.3',
        'Time signature must be in format N/D',
        { line }
      );
    }

    const numeratorStr = match[1];
    const denominatorStr = match[2];
    
    if (!numeratorStr || !denominatorStr) {
      throw new SongCodeError(
        'E1.1.3',
        'Time signature must be in format N/D',
        { line }
      );
    }

    const numerator = parseInt(numeratorStr, 10);
    const denominator = parseInt(denominatorStr, 10);

    // Validate denominator (must be 2 or 4)
    if (denominator !== 2 && denominator !== 4) {
      throw new SongCodeError(
        'E1.1.3',
        'Time signature denominator must be 2 or 4',
        { line }
      );
    }

    // Validate numerator (must be positive)
    if (numerator < 1) {
      throw new SongCodeError(
        'E1.1.3',
        'Time signature numerator must be positive',
        { line }
      );
    }

    return { numerator, denominator };
  }

  /**
   * Parse and validate original key
   */
  private parseOriginalKey(value: string, line: number): string {
    if (!MetadataParser.VALID_CHORD_ROOTS.includes(value)) {
      throw new SongCodeError('E1.1.4', `Invalid original key: ${value}`, { line });
    }

    return value;
  }

  /**
   * Parse and validate capo position
   */
  private parseCapo(value: string, line: number): number {
    const capo = parseInt(value, 10);

    if (isNaN(capo)) {
      throw new SongCodeError('E1.1.5', 'Capo must be a number', { line });
    }

    if (capo < 1 || capo > 20) {
      throw new SongCodeError(
        'E1.1.5',
        'Capo must be between 1 and 20',
        { line }
      );
    }

    return capo;
  }
}
