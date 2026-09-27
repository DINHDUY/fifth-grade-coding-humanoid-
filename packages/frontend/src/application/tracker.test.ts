import { describe, expect, it } from 'vitest';
import { trackerError, trackerNext, yawAdjustment } from './tracker';

describe('tracker calculations', () => {
  it('moves the reticle toward the target by the gain', () => {
    expect(trackerNext({ x: 0, y: 0 }, { x: 100, y: 50 }, 0.1)).toEqual({ x: 10, y: 5 });
  });
  it('reports error and proportional yaw adjustment', () => {
    expect(trackerError({ x: 150, y: 90 }, { x: 250, y: 90 })).toBe(100);
    expect(yawAdjustment(100)).toBe(5);
  });
});
