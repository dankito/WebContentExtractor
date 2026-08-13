/**
 * Represents an elapsed duration, stored internally in milliseconds
 * (since that's the resolution `performance.now()` gives in JS).
 */
export class Duration {
  private constructor(readonly milliseconds: number) {}

  static ofMilliseconds(ms: number): Duration {
    return new Duration(ms);
  }

  get seconds(): number {
    return this.milliseconds / 1000;
  }

  /**
   * Formats like Kotlin's Duration.toString(): "2.05s", "150ms", "1m 30s", etc.
   */
  toString(): string {
    // or use dayjs, date-fns, or luxon
    const ms = this.milliseconds;

    if (ms < 1000) {
      return `${this.round(ms, 2)} ms`;
    }

    const totalSeconds = ms / 1000;
    if (totalSeconds < 60) {
      return `${this.round(totalSeconds, 2)} s`;
    }

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = this.round(totalSeconds - minutes * 60, 2);
    return `${minutes} m ${seconds} s`;
  }

  round(value: number, decimals: number): number {
    const factor = 10 ** decimals;
    return Math.round(value * factor) / factor;
  }
}