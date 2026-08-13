import { Duration } from "./Duration.ts"

export class Stopwatch {
  /**
   * Runs the action, logs "actionName took <duration>", and returns the action's result.
   * Works with both sync and async actions.
   */
  static logDuration<T>(actionName: string, action: () => T): T
  static logDuration<T>(actionName: string, action: () => Promise<T>): Promise<T>
  static logDuration<T>(
    actionName: string,
    action: () => T | Promise<T>
  ): T | Promise<T> {
    const stopwatch = new Stopwatch()

    const logAndReturn = (result: T): T => {
      const duration = stopwatch.stop()
      console.log(`${actionName} took ${duration}`)
      return result
    }

    const result = action()

    if (result instanceof Promise) {
      return result.then(logAndReturn) as Promise<T>
    }

    return logAndReturn(result)
  }

  /**
   * Runs the action and returns the elapsed Duration.
   * Works with both sync and async actions.
   */
  static measure(action: () => void): Duration
  static measure(action: () => Promise<void>): Promise<Duration>
  static measure(action: () => void | Promise<void>): Duration | Promise<Duration> {
    const stopwatch = new Stopwatch()

    const result = action()

    if (result instanceof Promise) {
      return result.then(() => stopwatch.stop())
    }

    return stopwatch.stop()
  }


  private readonly start = performance.now()
  private duration: Duration | undefined

  isRunning(): boolean {
    return this.duration === undefined
  }

  stop(): Duration {
    const duration = Duration.ofMilliseconds(performance.now() - this.start)
    this.duration = duration
    return duration
  }

  stopToMillis(): number {
    return Math.round(this.stop().milliseconds)
  }

}