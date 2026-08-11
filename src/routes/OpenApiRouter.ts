import { Hono } from "hono"
import { openAPIRouteHandler } from "hono-openapi"
import { swaggerUI } from "@hono/swagger-ui"


export class OpenApiRouter {

  createOpenApiAndSwaggerUiEndpoints(endpoints: Hono): Hono {
    const openApiRouter = new Hono()

    this.createOpenApiEndpoint(openApiRouter, endpoints)

    this.createSwaggerUiEndpoint(openApiRouter)

    return openApiRouter
  }

  private createOpenApiEndpoint(openApiRouter: Hono, endpoints: Hono) {
    openApiRouter.get(
      "/openapi.json",
      openAPIRouteHandler(endpoints, {
        documentation: {
          info: {
            title: "Readability Server",
            version: "1.0.0",
            description: "A high-performance, Hono-based web service wrapper for Mozilla's Readability.js, which powers Firefox's Reader View. " +
              "Extract clean, readable content from any webpage with lightning speed.",
          },
        },
      }),
    )
  }

  private createSwaggerUiEndpoint(openApiRouter: Hono) {
    openApiRouter.get("/swagger-ui", swaggerUI({
      url: "/openapi.json",
      tryItOutEnabled: true,
      displayRequestDuration: true,
    }))
  }
}
