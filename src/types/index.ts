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
 * Section object in final output
 */
export interface SectionObject {
  name: string;
  comment: string | null;
  pattern: PatternReference;
  measures: number;
  lyrics: LyricObject[];
}

/**
 * Lyric object with timing and style
 */
export interface LyricObject {
  text: string;
  measures: number;
  style: 'normal' | 'info' | 'musician';
}

/**
 * Pattern reference with modifiers
 */
export interface PatternReference {
  id: string | null;
  repeat: number;
  bpm: number | null;
  time: TimeSignature | null;
  cutStart: [measures: number, beats: number] | null;
  cutEnd: [measures: number, beats: number] | null;
  before: PatternModifier | null;
  after: PatternModifier | null;
}

/**
 * Pattern modifier (before/after) in final output
 */
export interface PatternModifier {
  sc: string;
  json: PatternJSON | null;
  measures: number;
}

/**
 * Prompter array item
 */
export type PrompterItem = TempoItem | ContentItem;

/**
 * Tempo change item in prompter
 */
export interface TempoItem {
  type: 'tempo';
  bpm: number;
  time: string; // Format: "4/4"
}

/**
 * Content item with chords and lyrics in prompter
 */
export interface ContentItem {
  type: 'content';
  style: string;
  lyrics: string;
  chords: ChordGroup[];
  isInfo?: boolean;
  isMusician?: boolean;
}

/**
 * Chord group with repeats and pattern
 */
export interface ChordGroup {
  repeats: number;
  pattern: Measure[];
}
