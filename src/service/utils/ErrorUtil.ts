export class ErrorUtil {

  static errorMessageOfError(error: unknown): string {
    if (error instanceof Error) {
      return error.message
    }
    return String(error)
  }

}