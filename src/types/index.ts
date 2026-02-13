/**
 * TypeScript type definitions for Livenotes JSON structure.
 * 
 * These types mirror the JSON structure defined in:
 * https://github.com/PhilipGazagnes/livenotes-documentation/blob/main/songcode/livenotes-json-structure-reference.md
 */

/**
 * Complete Livenotes JSON structure
 */
export interface LivenotesJSON {
  meta: MetaObject;
  patterns: PatternsObject;
  sections: SectionObject[];
  prompter: PrompterItem[];
}

/**
 * Meta object containing song-level metadata
 */
export interface MetaObject {
  name?: string;
  artist?: string;
  bpm?: number;
  time?: TimeSignature;
  original?: string;
  capo?: number;
  pitch?: string;
  warning?: string;
  end?: string;
}

/**
 * Time signature object
 */
export interface TimeSignature {
  numerator: number;
  denominator: number;
}

/**
 * Patterns object with pattern IDs as keys
 */
export interface PatternsObject {
  [patternId: string]: PatternDefinition;
}

/**
 * Pattern definition
 */
export interface PatternDefinition {
  sc: string;
  json: PatternJSON | null;
  measures: number;
}

/**
 * Pattern JSON representation (array of measures and special markers)
 */
export type PatternJSON = PatternElement[];

/**
 * Elements that can appear in a pattern
 */
export type PatternElement = 
  | Measure
  | 'loopStart'
  | `loopEnd:${number}`
  | 'newLine';

/**
 * A measure containing chord positions
 */
export type Measure = ChordPosition[];

/**
 * A chord position in a measure
 */
export type ChordPosition = 
  | Chord
  | '%'
  | '_'
  | '=';

/**
 * A chord with base and extension
 */
export type Chord = [base: string, extension: string];

/**
 * Section object
 */
export interface SectionObject {
  name: string;
  comment?: string;
  pattern: PatternReference;
  lyrics: string[];
}

/**
 * Pattern reference with modifiers
 */
export interface PatternReference {
  id?: string;
  sc?: string;
  json?: PatternJSON | null;
  measures?: number;
  repeat?: number;
  cutStart?: [measures: number, beats: number];
  cutEnd?: [measures: number, beats: number];
  before?: PatternModifier;
  after?: PatternModifier;
  time?: TimeModifier;
}

/**
 * Pattern modifier (before/after)
 */
export interface PatternModifier {
  sc: string;
  json: PatternJSON | null;
  measures: number;
}

/**
 * Time modifier (tempo/time signature override)
 */
export interface TimeModifier {
  bpm?: number;
  time?: TimeSignature;
}

/**
 * Prompter array item
 */
export type PrompterItem = TempoItem | ContentItem;

/**
 * Tempo change item
 */
export interface TempoItem {
  type: 'tempo';
  bpm: number;
}

/**
 * Content item with chords and lyrics
 */
export interface ContentItem {
  type: 'content';
  style: string;
  chords: Measure[];
  lyrics: string;
}
