import { ErrorDetails } from "./ErrorDetails.ts"

export class ErrorResult {

  static for(errorMessage: string, isBadRequest: boolean = false, error?: Error): ErrorResult {
    return new ErrorResult(new ErrorDetails(errorMessage, isBadRequest, error))
  }

  static forError(error: Error | any): ErrorResult {
    let details: ErrorDetails
    if (error instanceof Error) {
      details = new ErrorDetails(error.message, false, error)
    } else {
      details = new ErrorDetails(error.toString())
    }

    return new ErrorResult(details)
  }


  readonly success = false

  constructor(
    readonly details: ErrorDetails,
  ) { }

}