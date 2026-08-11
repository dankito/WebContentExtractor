export class UrlVerificationService {

  hasCorrectProtocol(url: string): boolean {
    const urlObj = new URL(url)
    return urlObj.protocol === "http:" || urlObj.protocol === "https:"
  }

}