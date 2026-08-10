import { ErrorDetails } from "./ErrorDetails.ts"

export type Result<T> =
  | { success: true; data: T }
  | { success: false; details: ErrorDetails }