export class Option {

  constructor(
    readonly value: any,
    readonly label: string = value.toString(),
    readonly disabled: boolean = false
  ) {}

}