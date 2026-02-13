import { Measure } from '../types';
import { Section } from '../phase1/SectionParser';

/**
 * Applies section modifiers to measures in correct order.
 * 
 * Order of operations:
 * 1. Apply _repeat (multiply measures)
 * 2. Apply _cutStart (remove from beginning)
 * 3. Apply _cutEnd (remove from end)
 * 4. Prepend _before measures
 * 5. Append _after measures
 */
export class MeasureStacker {
  /**
   * Stacks measures with section modifiers applied.
   * 
   * @param measures - Main pattern measures (already expanded)
   * @param section - Section with modifiers
   * @param beforeMeasures - Optional _before pattern measures
   * @param afterMeasures - Optional _after pattern measures
   * @returns Final stacked measures array
   */
  stack(
    measures: Measure[],
    section: Section,
    beforeMeasures?: Measure[],
    afterMeasures?: Measure[]
  ): Measure[] {
    let result = [...measures];
    
    // Step 1: Apply _repeat modifier
    if (section.repeat && section.repeat > 1) {
      const repeated: Measure[] = [];
      for (let i = 0; i < section.repeat; i++) {
        repeated.push(...result);
      }
      result = repeated;
    }
    
    // Step 2: Apply _cutStart modifier
    if (section.cutStart) {
      const [measuresToRemove, beatsToRemove] = section.cutStart;
      let totalToRemove = measuresToRemove;
      
      // If beats > 0, that counts as removing one more measure
      if (beatsToRemove > 0) {
        totalToRemove += 1;
      }
      
      result = result.slice(totalToRemove);
    }
    
    // Step 3: Apply _cutEnd modifier
    if (section.cutEnd) {
      const [measuresToRemove, beatsToRemove] = section.cutEnd;
      let totalToRemove = measuresToRemove;
      
      // If beats > 0, that counts as removing one more measure
      if (beatsToRemove > 0) {
        totalToRemove += 1;
      }
      
      result = result.slice(0, result.length - totalToRemove);
    }
    
    // Step 4: Prepend _before measures
    if (beforeMeasures && beforeMeasures.length > 0) {
      result = [...beforeMeasures, ...result];
    }
    
    // Step 5: Append _after measures
    if (afterMeasures && afterMeasures.length > 0) {
      result = [...result, ...afterMeasures];
    }
    
    return result;
  }
}
