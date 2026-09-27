import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MotionSequencer } from './MotionSequencer';

beforeEach(() => { localStorage.clear(); vi.useFakeTimers(); });
afterEach(() => { cleanup(); vi.useRealTimers(); });

describe('anatomy playback integration', () => {
  it('renders 17 selectable joints and moves them during playback with a fixed, uniform viewport', () => {
    const { container } = render(<MotionSequencer />);
    expect(container.querySelectorAll('[data-joint]')).toHaveLength(17);
    const elbow = container.querySelector('[data-joint="rElbow"]')!;
    const start = elbow.getAttribute('transform');
    const map = screen.getByRole('group', { name: 'TonyBot 17 DOF servo anatomy map' });
    const camera = map.getAttribute('viewBox');
    fireEvent.click(screen.getByRole('button', { name: 'Play Dance' }));
    act(() => { vi.advanceTimersByTime(500); });
    expect(elbow.getAttribute('transform')).not.toBe(start);
    expect(map.getAttribute('viewBox')).toBe(camera);
    expect(map.getAttribute('preserveAspectRatio')).toBe('xMidYMid meet');
    fireEvent.click(screen.getByRole('button', { name: 'Pause Dance' }));
    const paused = elbow.getAttribute('transform');
    act(() => { vi.advanceTimersByTime(500); });
    expect(elbow.getAttribute('transform')).toBe(paused);
  });

  it('selects individual knees by keyboard and propagates slider edits to the appropriate leg', () => {
    const { container } = render(<MotionSequencer />);
    const knee = screen.getByRole('button', { name: '#03 L. Knee' });
    fireEvent.keyDown(knee, { key: 'Enter' });
    expect(knee.getAttribute('aria-pressed')).toBe('true');
    const left = container.querySelector('[data-joint="lAnklePitch"]')!;
    const right = container.querySelector('[data-joint="rAnklePitch"]')!;
    const beforeLeft = left.getAttribute('transform');
    const beforeRight = right.getAttribute('transform');
    fireEvent.change(screen.getByRole('slider', { name: '#03 L. Knee' }), { target: { value: '-35' } });
    expect(left.getAttribute('transform')).not.toBe(beforeLeft);
    expect(right.getAttribute('transform')).toBe(beforeRight);
  });
});
