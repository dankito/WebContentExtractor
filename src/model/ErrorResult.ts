import { ErrorDetails } from "./ErrorDetails.ts"

export class ErrorResult {

  static for(errorMessage: string, error?: Error): ErrorResult {
    return new ErrorResult(new ErrorDetails(errorMessage, error))
  }

  static forError(error: Error): ErrorResult {
    return new ErrorResult(new ErrorDetails(error.message, error))
  }


  readonly success = false

  constructor(
    readonly details: ErrorDetails,
  ) { }

}