export class ErrorDetails {

  constructor(
    readonly errorMessage: string,
    readonly isBadRequest: boolean = false,
    readonly error: Error | undefined = undefined,
  ) { }

}