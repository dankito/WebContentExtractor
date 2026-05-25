export class SerializableThrowable {

  constructor(
    readonly type: string,
    readonly message: string | null = null,
    readonly cause: SerializableThrowable | null = null,
    readonly stackTrace: string | null = null,
  ) { }

}