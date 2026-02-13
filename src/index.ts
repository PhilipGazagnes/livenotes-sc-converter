/**
 * SongCode to Livenotes JSON Converter
 * 
 * Main entry point for the converter.
 * See: https://github.com/PhilipGazagnes/livenotes-documentation
 */

import { LivenotesJSON } from './types/';

/**
 * Main converter class that orchestrates the 4-phase parsing process.
 */
export class SongCodeConverter {
  /**
   * Convert a SongCode string to Livenotes JSON format.
   * 
   * @param songCode - The SongCode content as a string
   * @returns The Livenotes JSON object
   * @throws {SongCodeError} If parsing or validation fails
   */
  convert(_songCode: string): LivenotesJSON {
    // TODO: Implement 4-phase conversion
    // Phase 1: First pass parsing
    // Phase 2: Pattern transformation
    // Phase 3: Validation
    // Phase 4: Prompter generation
    
    throw new Error('Not implemented yet');
  }
}

// Export types for consumers
export * from './types/';
export * from './errors/SongCodeError';
