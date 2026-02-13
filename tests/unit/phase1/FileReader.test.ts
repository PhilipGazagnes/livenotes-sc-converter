/**
 * Test suite for FileReader
 * 
 * Test Spec: Section 1.1 (Tests 1.1.1-1.1.7)
 * See: https://github.com/PhilipGazagnes/livenotes-documentation/blob/main/songcode/test-suite-specification.md
 */

import { FileReader } from '../../../src/phase1/FileReader';
import { SongCodeError } from '../../../src/errors/SongCodeError';

describe('FileReader', () => {
  let reader: FileReader;

  beforeEach(() => {
    reader = new FileReader();
  });

  describe('read()', () => {
    describe('valid content', () => {
      test('1.1.1: Valid UTF-8 file', () => {
        // Arrange
        const content = 'Test content with UTF-8: émojis 🎵';

        // Act
        const result = reader.read(content);

        // Assert
        expect(result).toBe(content);
      });

      test('1.1.4: LF line endings (Unix)', () => {
        // Arrange
        const content = 'Line 1\nLine 2\nLine 3';

        // Act
        const result = reader.read(content);

        // Assert
        expect(result).toBe(content);
        expect(result.split('\n')).toHaveLength(3);
      });

      test('1.1.5: CRLF line endings (Windows)', () => {
        // Arrange
        const content = 'Line 1\r\nLine 2\r\nLine 3';

        // Act
        const result = reader.read(content);

        // Assert
        expect(result).toBe('Line 1\nLine 2\nLine 3'); // Normalized to LF
        expect(result.includes('\r')).toBe(false);
      });

      test('1.1.6: Mixed line endings', () => {
        // Arrange
        const content = 'Line 1\nLine 2\r\nLine 3\nLine 4';

        // Act
        const result = reader.read(content);

        // Assert
        expect(result).toBe('Line 1\nLine 2\nLine 3\nLine 4');
        expect(result.includes('\r')).toBe(false);
      });

      test('1.1.7: Empty file', () => {
        // Arrange
        const content = '';

        // Act
        const result = reader.read(content);

        // Assert
        expect(result).toBe('');
      });
    });

    describe('error handling', () => {
      test('1.1.3: File with null bytes', () => {
        // Arrange
        const content = 'Test\0content';

        // Act & Assert
        expect(() => reader.read(content)).toThrow(SongCodeError);
        
        try {
          reader.read(content);
          fail('Should have thrown SongCodeError');
        } catch (error) {
          expect(error).toBeInstanceOf(SongCodeError);
          expect((error as SongCodeError).code).toBe('E0.2');
          expect((error as SongCodeError).message).toContain('UTF-8');
        }
      });

      test('1.1.2: Invalid UTF-8 encoding (surrogate pairs)', () => {
        // Arrange - Lone surrogate pair (invalid UTF-8)
        const content = 'Test\uD800content';

        // Act & Assert
        expect(() => reader.read(content)).toThrow(SongCodeError);
        
        try {
          reader.read(content);
          fail('Should have thrown SongCodeError');
        } catch (error) {
          expect(error).toBeInstanceOf(SongCodeError);
          expect((error as SongCodeError).code).toBe('E0.2');
        }
      });
    });
  });
});
