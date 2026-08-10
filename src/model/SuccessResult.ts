export class SuccessResult<T> {

  static for<T>(data: T): SuccessResult<T> {
    return new SuccessResult(data)
  }


  readonly success = true

  constructor(
    readonly data: T,
  ) { }

}