export interface Point { x: number; y: number }
export const trackerNext = (reticle: Point, ball: Point, gain = 0.12): Point => ({ x: reticle.x + (ball.x - reticle.x) * gain, y: reticle.y + (ball.y - reticle.y) * gain });
export const trackerError = (reticle: Point, ball: Point): number => Math.round(ball.x - reticle.x);
export const yawAdjustment = (errorX: number, gain = 0.05): number => Math.round(errorX * gain * 10) / 10;
