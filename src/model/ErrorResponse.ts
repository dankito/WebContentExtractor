export class ErrorResponse {

  constructor(
    readonly error: string,
    readonly details?: string
  ) { }

}