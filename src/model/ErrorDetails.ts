export class ErrorDetails {

  constructor(
    readonly errorMessage: string,
    readonly error: Error | undefined = undefined,
  ) { }

}