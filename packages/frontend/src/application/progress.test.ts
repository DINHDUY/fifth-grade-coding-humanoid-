import { describe, expect, it } from 'vitest';
import { MISSIONS } from '../domain/content';
import { completionPercent, createPairs, overallPercent, parseState, serializeState } from './progress';

describe('progress use cases', () => {
  it('calculates mission and program completion', () => {
    const keys = ['p1-obj-0', 'p1-obj-1', 'p1-obj-2', 'p1-act-0', 'p1-act-1'];
    expect(completionPercent(MISSIONS[0], new Set(keys))).toBe(100);
    expect(overallPercent(MISSIONS, new Set(keys))).toBeGreaterThan(0);
  });

  it('round trips versioned state', () => {
    const state = { completed: ['p1-obj-0'], roster: ['Ada'] };
    expect(parseState(serializeState(state))).toEqual(state);
    expect(() => parseState('{"version":2}')).toThrow();
  });

  it('pairs an odd roster with a solo navigator', () => {
    const pairs = createPairs(['A', 'B', 'C'], () => 0.5);
    expect(pairs).toHaveLength(2);
    expect(pairs.some((pair) => pair.pilot === null)).toBe(true);
  });
});
