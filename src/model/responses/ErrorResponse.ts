import type { ErrorResult } from "../ErrorResult.ts"

export class ErrorResponse {

  static from(error: ErrorResult): ErrorResponse {
    return new ErrorResponse(error.details.errorMessage, error.details.error?.cause?.toString())
  }


  constructor(
    readonly error: string,
    readonly details?: string
  ) { }

}