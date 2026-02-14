/**
 * SongCode to Livenotes JSON Converter
 * 
 * Main entry point for the converter.
 * Orchestrates 16 bricks across 6 phases to convert SongCode to LivenotesJSON.
 * See: https://github.com/PhilipGazagnes/livenotes-documentation
 */

import { LivenotesJSON, SectionObject, LyricObject, TimeSignature, MetaObject } from './types/';

// Phase 1: First Pass Parsing (Bricks 1-4)
import { FileReader } from './phase1/FileReader';
import { MetadataParser } from './phase1/MetadataParser';
import { PatternParser } from './phase1/PatternParser';
import { SectionParser } from './phase1/SectionParser';

// Phase 1.5: Pattern Organization (Brick 5)
import { PatternIdAssigner } from './phase1_5/PatternIdAssigner';

// Phase 2: Pattern Transformation (Bricks 6-8)
import { PatternTransformer } from './phase2/PatternTransformer';
import { MeasureCounter } from './phase2/MeasureCounter';

// Phase 3: Validation (Bricks 9-11)
import { TimeSignatureValidator } from './phase3/TimeSignatureValidator';
import { LyricTimingValidator } from './phase3/LyricTimingValidator';

// Phase 3.5: Lyric Transformation (Brick 16)
import { LyricTransformer } from './phase3_5/LyricTransformer';

// Phase 4: Prompter Generation (Bricks 12-15)
import { PatternExpander } from './phase4/PatternExpander';
import { MeasureStacker } from './phase4/MeasureStacker';
import { LyricPairer } from './phase4/LyricPairer';
import { PromptItemBuilder } from './phase4/PromptItemBuilder';

/**
 * Main converter class that orchestrates all 16 bricks across 6 phases.
 * 
 * @example
 * ```typescript
 * import { SongCodeConverter } from '@livenotes/songcode-converter';
 * 
 * const converter = new SongCodeConverter();
 * const songCode = `
 * @bpm 120
 * @original C
 * 
 * $1
 * C;G;Am;F
 * 
 * Verse
 * $1
 * --
 * Amazing grace, how sweet the sound _4
 * `;
 * 
 * try {
 *   const result = converter.convert(songCode);
 *   console.log(JSON.stringify(result, null, 2));
 * } catch (error) {
 *   console.error('Conversion failed:', error.message);
 * }
 * ```
 */
export class SongCodeConverter {
  // Phase 1: First Pass Parsing
  private fileReader = new FileReader();
  private metadataParser = new MetadataParser();
  private patternParser = new PatternParser();
  private sectionParser = new SectionParser();
  
  // Phase 1.5: Pattern Organization
  private patternIdAssigner = new PatternIdAssigner();
  
  // Phase 2: Pattern Transformation
  private patternTransformer = new PatternTransformer();
  private measureCounter = new MeasureCounter();
  
  // Phase 3: Validation
  private timeSignatureValidator = new TimeSignatureValidator();
  private lyricTimingValidator = new LyricTimingValidator();
  
  // Phase 3.5: Lyric Transformation
  private lyricTransformer = new LyricTransformer();
  
  // Phase 4: Prompter Generation
  private patternExpander = new PatternExpander();
  private measureStacker = new MeasureStacker();
  private lyricPairer = new LyricPairer();
  private promptItemBuilder = new PromptItemBuilder();

  /**
   * Convert a SongCode string to Livenotes JSON format.
   * 
   * Processes the input through 6 phases:
   * 1. **First Pass Parsing** - Extract metadata, patterns, and sections
   * 2. **Pattern Organization** - Assign alphabetical IDs to patterns
   * 3. **Pattern Transformation** - Convert SongCode patterns to JSON arrays
   * 4. **Validation** - Validate time signatures, measures, and lyrics
   * 5. **Lyric Transformation** - Transform lyric strings to objects
   * 6. **Prompter Generation** - Build linearized display format
   * 
   * @param songCode - The SongCode content as a string (UTF-8)
   * @returns The Livenotes JSON object with meta, patterns, sections, and prompter
   * @throws {SongCodeError} If parsing or validation fails
   * 
   * @example
   * ```typescript
   * const converter = new SongCodeConverter();
   * const result = converter.convert(songCodeString);
   * // result: { meta, patterns, sections, prompter }
   * ```
   */
  convert(songCode: string): LivenotesJSON {
    // ============================================================
    // PHASE 1: First Pass Parsing
    // ============================================================
    const cleanContent = this.fileReader.read(songCode);
    const metadata = this.metadataParser.parse(cleanContent);
    const patternDefinitions = this.patternParser.parse(cleanContent);
    const sections = this.sectionParser.parse(cleanContent);

    // Preserve original global metadata before any section processing
    const globalBpm = metadata.bpm;
    const globalTime = metadata.time;

    // ============================================================
    // PHASE 1.5: Pattern Organization
    // ============================================================
    const { patterns, sectionPatternIds } = this.patternIdAssigner.assign(
      patternDefinitions,
      sections
    );

    // ============================================================
    // PHASE 2: Pattern Transformation
    // ============================================================
    // Transform all patterns from string to PatternJSON
    for (const patternId in patterns) {
      const pattern = patterns[patternId];
      if (pattern) {
        const result = this.patternTransformer.transform(pattern.sc);
        // PatternTransformer.PatternJSON is compatible with types/PatternJSON
        pattern.json = result.json as any;
        pattern.measures = this.measureCounter.count(result.json as any);
      }
    }

    // Also transform _before and _after modifier patterns in sections
    for (const section of sections) {
      if (section.before) {
        const result = this.patternTransformer.transform(section.before.sc);
        const measures = this.measureCounter.count(result.json as any);
        section.before = {
          sc: section.before.sc,
          json: result.json as any,
          measures,
        };
      }
      if (section.after) {
        const result = this.patternTransformer.transform(section.after.sc);
        const measures = this.measureCounter.count(result.json as any);
        section.after = {
          sc: section.after.sc,
          json: result.json as any,
          measures,
        };
      }
    }

    // ============================================================
    // PHASE 3: Validation
    // ============================================================
    const timeSignature: TimeSignature = metadata.time 
      ? metadata.time 
      : { numerator: 4, denominator: 4 };

    // Validate time signatures for all patterns (validate each measure)
    for (const patternId in patterns) {
      const pattern = patterns[patternId];
      if (pattern && pattern.json) {
        // PatternJSON is an array of PatternElements (measures, loops, markers)
        // We need to extract and validate actual measures
        for (const element of pattern.json) {
          // Only validate actual measures (arrays), skip markers
          if (Array.isArray(element) && typeof element !== 'string') {
            this.timeSignatureValidator.validate(element as any, timeSignature);
          }
        }
      }
    }

    // Validate before/after patterns
    for (const section of sections) {
      if (section.before && section.before.json) {
        const beforeJson: any = section.before.json;
        for (const element of beforeJson) {
          if (Array.isArray(element) && typeof element !== 'string') {
            this.timeSignatureValidator.validate(element as any, timeSignature);
          }
        }
      }
      if (section.after && section.after.json) {
        const afterJson: any = section.after.json;
        for (const element of afterJson) {
          if (Array.isArray(element) && typeof element !== 'string') {
            this.timeSignatureValidator.validate(element as any, timeSignature);
          }
        }
      }
    }

    // ============================================================
    // PHASE 3: Validation
    // ============================================================
    
    // Step 3.2: Calculate Section Measure Counts
    // Calculate total measures for each section considering all modifiers
    // and store in section objects for use in Step 3.3
    const sectionMeasures = new Map<number, number>();
    
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i]!;
      const patternId = sectionPatternIds.get(i);
      const pattern = patternId ? patterns[patternId] : undefined;
      const patternMeasures = pattern?.measures || 0;
      const beforeMeasures = section.before?.measures || 0;
      const afterMeasures = section.after?.measures || 0;
      
      // Calculate final measures following spec algorithm:
      // section_measures = before + (pattern * repeat - cutStart - cutEnd) + after
      let finalMeasures = patternMeasures;
      
      // Apply _repeat modifier
      if (section.repeat) {
        finalMeasures *= section.repeat;
      }
      
      // Apply _cutStart modifier
      if (section.cutStart) {
        const [measures, beats] = section.cutStart;
        finalMeasures -= measures;
        if (beats > 0) {
          finalMeasures -= 1;
        }
      }
      
      // Apply _cutEnd modifier
      if (section.cutEnd) {
        const [measures, beats] = section.cutEnd;
        finalMeasures -= measures;
        if (beats > 0) {
          finalMeasures -= 1;
        }
      }
      
      // Add _before measures
      finalMeasures += beforeMeasures;
      
      // Add _after measures
      finalMeasures += afterMeasures;
      
      // Store calculated measures
      sectionMeasures.set(i, finalMeasures);
    }
    
    // Step 3.3: Validate Lyric Timing
    // Validate that lyric measure counts match section's calculated measures
    for (let j = 0; j < sections.length; j++) {
      const section = sections[j]!;
      // Skip validation for instrumental sections (no lyrics)
      if (section.lyrics.length === 0) {
        continue;
      }
      
      const totalMeasures = sectionMeasures.get(j) || 0;
      this.lyricTimingValidator.validate(section.lyrics, totalMeasures);
    }

    // ============================================================
    // PHASE 3.5: Lyric Transformation
    // ============================================================
    // Transform lyrics from string[] to LyricObject[]
    const transformedLyrics = new Map<number, LyricObject[]>();
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i]!;
      const lyrics = this.lyricTransformer.transform(section.lyrics);
      transformedLyrics.set(i, lyrics);
    }

    // ============================================================
    // PHASE 4: Prompter Generation
    // ============================================================
    const prompter: LivenotesJSON['prompter'] = [];

    // Add initial tempo item using preserved global BPM
    if (globalBpm) {
      prompter.push(
        this.promptItemBuilder.buildTempoItem(
          globalBpm,
          [timeSignature.numerator, timeSignature.denominator]
        )
      );
    }

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i]!;
      // Handle BPM override
      if (section.time?.bpm) {
        prompter.push(
          this.promptItemBuilder.buildTempoItem(
            section.time.bpm,
            [timeSignature.numerator, timeSignature.denominator]
          )
        );
      }

      // Get pattern and expand
      const patternId = sectionPatternIds.get(i);
      const pattern = patternId ? patterns[patternId] : undefined;
      
      if (!pattern || !pattern.json) {
        continue; // Skip sections without patterns
      }

      let measures = this.patternExpander.expand(pattern.json);

      // Resolve % repeat symbols
      measures = this.promptItemBuilder.resolveRepeatSymbols(measures);

      // Get before/after patterns if specified
      const beforeMeasures = section.before?.json
        ? this.patternExpander.expand(section.before.json)
        : undefined;
      const afterMeasures = section.after?.json
        ? this.patternExpander.expand(section.after.json)
        : undefined;

      // Apply section modifiers
      measures = this.measureStacker.stack(measures, section, beforeMeasures, afterMeasures);

      // Skip prompter generation for instrumental sections (no lyrics)
      if (section.lyrics.length === 0) {
        continue;
      }

      // Pair lyrics with measures
      const lyricPairs = this.lyricPairer.pair(section.lyrics, measures.length);

      // Build prompter items
      for (const lyricPair of lyricPairs) {
        const lyricMeasures = measures.slice(0, lyricPair.measures);
        measures = measures.slice(lyricPair.measures);

        const item = this.promptItemBuilder.buildContentItem(
          lyricMeasures,
          lyricPair.text,
          lyricPair.isInfo,
          lyricPair.isMusician
        );

        prompter.push(item);
      }
    }

    // ============================================================
    // Build Final LivenotesJSON with transformed sections
    // ============================================================
    const finalSections: SectionObject[] = sections.map((section, index) => {
      const patternId = sectionPatternIds.get(index);
      const pattern = patternId ? patterns[patternId] : undefined;
      const lyrics = transformedLyrics.get(index) || [];
      
      // Calculate final measure count after modifiers
      let finalMeasures = pattern?.measures || 0;
      if (section.repeat) {
        finalMeasures *= section.repeat;
      }
      if (section.cutStart) {
        const [measures, beats] = section.cutStart;
        finalMeasures -= measures;
        if (beats > 0) finalMeasures -= 1;
      }
      if (section.cutEnd) {
        const [measures, beats] = section.cutEnd;
        finalMeasures -= measures;
        if (beats > 0) finalMeasures -= 1;
      }
      
      // Add before/after measures
      if (section.before) {
        finalMeasures += section.before.measures;
      }
      if (section.after) {
        finalMeasures += section.after.measures;
      }

      return {
        name: section.name,
        comment: section.comment || null,
        pattern: {
          id: patternId || null,
          repeat: section.repeat || 1,
          bpm: section.time?.bpm || null,
          time: section.time?.numerator !== undefined || section.time?.denominator !== undefined ? {
            numerator: section.time.numerator || timeSignature.numerator,
            denominator: section.time.denominator || timeSignature.denominator,
          } : null,
          cutStart: section.cutStart || null,
          cutEnd: section.cutEnd || null,
          before: section.before || null,
          after: section.after || null,
        },
        measures: finalMeasures,
        lyrics,
      };
    });

    // Build meta object with proper optional properties
    const meta: MetaObject = {};
    if (metadata.name !== undefined) meta.name = metadata.name;
    if (metadata.artist !== undefined) meta.artist = metadata.artist;
    if (globalBpm !== undefined) meta.bpm = globalBpm;
    // Always include time signature (default to 4/4)
    meta.time = globalTime || timeSignature;
    if (metadata.original !== undefined) meta.original = metadata.original;
    if (metadata.capo !== undefined) meta.capo = metadata.capo;
    if (metadata.pitch !== undefined) meta.pitch = metadata.pitch;
    if (metadata.warning !== undefined) meta.warning = metadata.warning;
    if (metadata.end !== undefined) meta.end = metadata.end;

    return {
      meta,
      patterns,
      sections: finalSections,
      prompter,
    };
  }
}

// Export types for consumers
export * from './types/';
export * from './errors/SongCodeError';
