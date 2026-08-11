import { lookup } from "node:dns/promises"

export class UrlVerificationService {

  async hasCorrectProtocolAndIsNonLocalUrl(url: string): Promise<string | null> {
    const urlObj = new URL(url)

    if (this.hasCorrectProtocol(urlObj) === false) { // Actually already done by RequestValidator, but to be on the safe side
      return `Only http and https protocols are supported, but ${url} has protocol ${urlObj.protocol}`
    }

    if (await this.isLocalUrl(urlObj)) {
      return `Calling local URL is not permitted for security reasons, ${url} resolves to a local address.`
    }

    return null
  }

  hasCorrectProtocol(url: URL): boolean {
    return url.protocol === "http:" || url.protocol === "https:"
  }


  async isLocalUrl(url: URL): Promise<boolean> {
    try {
      const hostname = url.hostname

      // 1. Check hostname literal
      if (this.isPrivateIp(hostname) || hostname.toLowerCase() === "localhost") {
        return true
      }

      // 2. Resolve hostname to check for DNS rebinding / internal IPs
      try {
        const { address } = await lookup(hostname)
        if (this.isPrivateIp(address)) {
          return true
        }
      } catch {
        // If resolution fails, it's likely an invalid host, let fetch handle it or block here
      }

      return false
    } catch (error) {
      console.error(`Testing if url ${url} is a local URL failed`, error)
      return true
    }
  }

  isPrivateIp(ip: string): boolean {
    // IPv4 private ranges
    if (/^(127\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|192\.168\.|169\.254\.|0\.)/.test(ip)) {
      return true
    }
    // IPv6 private/local ranges
    let lowerIp = ip.toLowerCase()
    if (lowerIp.startsWith("[") && lowerIp.endsWith("]")) {
      lowerIp = lowerIp.slice(1, -1)
    }
    if (lowerIp === "::1" || lowerIp.startsWith("fe80:") || lowerIp.startsWith("fc00:") || lowerIp.startsWith("fd00:")) {
      return true
    }
    return false
  }

}