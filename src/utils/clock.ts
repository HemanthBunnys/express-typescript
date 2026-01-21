export interface Clock {
  now(): number;
}

export const systemClock: Clock = {
  now(): number {
    return Date.now();
  }
};

export class FakeClock implements Clock {
  private currentTime: number;

  constructor(initialTime: number = Date.now()) {
    this.currentTime = initialTime;
  }

  now(): number {
    return this.currentTime;
  }

  setTime(time: number): void {
    this.currentTime = time;
  }

  advance(milliseconds: number): void {
    this.currentTime += milliseconds;
  }
}