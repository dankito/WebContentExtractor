import type { FetchStrategy } from "./FetchStrategy.ts"

export class WebFetcherRequest {

  constructor(
    readonly url: string,

    readonly timeout?: number,
    readonly user_agent?: string,
    readonly follow_redirects?: boolean,

    readonly strategies: FetchStrategy[] = [],

    readonly cookies?: Record<string, string>,

    readonly load_lazy_content?: boolean,
    readonly execute_javascript?: boolean,
  ) { }

}