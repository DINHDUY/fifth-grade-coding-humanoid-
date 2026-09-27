import type { RobotAdapter, RobotTelemetry } from '../domain/types';

export class MockRobotAdapter implements RobotAdapter {
  private connected = false;
  async connect(): Promise<void> { this.connected = true; }
  async disconnect(): Promise<void> { this.connected = false; }
  async getTelemetry(): Promise<RobotTelemetry> { return { connected: this.connected, battery: 86, distance: 42, tilt: 0.8 }; }
  async runActionGroup(_id: number, count = 1): Promise<void> { void count; if (!this.connected) throw new Error('TonyBot is not connected.'); }
  async safeStop(): Promise<void> { return Promise.resolve(); }
}
