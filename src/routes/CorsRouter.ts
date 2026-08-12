import type { Hono } from "hono"
import { cors } from "hono/cors"

export class CorsRouter {

  configureCors(app: Hono) {
    app.use("*", cors({
      origin: (origin) => {
        if (!origin) return origin // same-origin / non-browser requests

        if (this.isAllowedOrigin(origin)) {
          return origin
        } else {
          return null // reject
        }
      },
      allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    }))
  }


  private isAllowedOrigin(origin: string): boolean {
    let hostname: string
    try {
      hostname = new URL(origin).hostname
    } catch {
      return false
    }

    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return true
    }

    // 10.0.0.0/8
    if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
      return true
    }

    // 192.168.0.0/16
    if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
      return true
    }

    // 172.16.0.0/12 (172.16.x.x – 172.31.x.x)
    if (/^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
      return true
    }

    return false
  }

}