export class Option<T = any> {

  constructor(
    readonly value: T,
    readonly label: string = String(value),
    readonly disabled: boolean = false
  ) {}

}