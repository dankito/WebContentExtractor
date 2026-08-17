import { Hono } from "hono"
import { type GenerateSpecOptions, openAPIRouteHandler } from "hono-openapi"
import { swaggerUI } from "@hono/swagger-ui"
import pkg from "../../package.json" with { type: "json" }


export class OpenApiRouter {

  static readonly OpenApiDocumentation: Partial<GenerateSpecOptions> = {
    documentation: {
      info: {
        title: "Web Content Extractor",
        version: pkg.version,
        description: "A web content extraction service combining stealth fetching (anti-bot detection bypass), Readability-based content extraction, " +
          "HTML-to-Markdown/text conversion, and sanitization against prompt-injection payloads hidden in HTML.",
      },
    },
  }


  createOpenApiAndSwaggerUiEndpoints(endpoints: Hono, openApiPath: string = "/openapi.json", swaggerUiPath: string = "/swagger-ui"): Hono {
    const openApiRouter = new Hono()

    this.createOpenApiEndpoint(openApiRouter, endpoints, openApiPath)

    this.createSwaggerUiEndpoint(openApiRouter, swaggerUiPath, openApiPath)

    return openApiRouter
  }

  private createOpenApiEndpoint(openApiRouter: Hono, endpoints: Hono, openApiPath: string) {
    openApiRouter.get(
      openApiPath,
      openAPIRouteHandler(endpoints, OpenApiRouter.OpenApiDocumentation),
    )
  }

  private createSwaggerUiEndpoint(openApiRouter: Hono, swaggerUiPath: string, openApiPath: string) {
    openApiRouter.get(swaggerUiPath, swaggerUI({
      url: "." + openApiPath,
      tryItOutEnabled: true,
      displayRequestDuration: true,
    }))
  }
}
