# Readability Server

A high-performance, Hono-based web service wrapper for Mozilla's [Readability.js](https://github.com/mozilla/readability), which powers Firefox's Reader View. 
Extract clean, readable content from any webpage with lightning speed.

## Overview
The goal of Readability Server is to provide a simple, containerized API that leverages the industry-standard Readability algorithm to strip away clutter (ads, sidebars, popups) and return only the essential content of a webpage.

## Features
- **Fast & Lightweight**: Built with [Hono](https://hono.dev/) and powered by [Bun](https://bun.sh/) for minimal overhead and high throughput.
- **Production Ready**: Easily deployable via Docker and Docker Compose.
- **Mozilla Readability**: Uses the same battle-tested extraction logic as Firefox's Reader View.
- **Flexible Output**: Configure the response format via headers to get JSON, clean HTML, or plain text.
- **Rich Metadata**: Optionally extract title, author, site name, excerpt, and more.

## How to Run

### Docker Run
You can run the server directly using Docker:
```shell
docker run -p 3030:3030 ghcr.io/dankito/readabilityserver
```

### Docker Compose
Create a `docker-compose.yml` file:
```yaml
services:
  readability:
    image: ghcr.io/dankito/readabilityserver:latest
    container_name: readability
    restart: unless-stopped
    ports:
      - "3030:3030"
    # Optional: configure the port and interface to listen on:
    environment:
      - HOST=0.0.0.0
      - PORT=3030
```
Then start it with:
```shell
docker compose up -d
```

### Local Development
To run the project locally, ensure you have [Bun](https://bun.sh/) installed:
```shell
# Install dependencies
bun install

# Run in development mode (with hot reload)
bun run dev
```

---

## API Documentation

### Endpoints

#### 1. `GET /extract`
Quickly extract content from a URL using query parameters.
- **Parameters**:
  - `url` (required): The URL of the page to extract.
  - `includeMetadata` (optional): Set to `true` to include metadata in the response.
  - `timeout` (optional): Request timeout in milliseconds.
  - `userAgent` (optional): Custom User-Agent header for the fetch request.
  - `followRedirects` (optional): Whether to follow HTTP redirects (`true` or `false`).

**Example**:
```shell
curl "http://localhost:3030/extract?url=https://github.com/dankito/ReadabilityServer/blob/main/README.md&includeMetadata=true"
```

#### 2. `POST /extract`
Preferred for long URLs or when passing multiple options.
- **Body (JSON)**:
  - `url` (required): The URL of the page to extract.
  - `includeMetadata` (optional): `true` to include metadata.
  - `timeout` (optional): Request timeout in milliseconds.
  - `userAgent` (optional): Custom User-Agent header.
  - `followRedirects` (optional): `true` or `false`.

**Example**:
```shell
curl -X POST http://localhost:3030/extract \
  -H "Content-Type: application/json" \
  -d '{"url": "https://github.com/dankito/ReadabilityServer/blob/main/README.md", "includeMetadata": true}'
```

#### 3. `POST /extract/html`
Extract content from a raw HTML string you already have.
- **Body (JSON)**:
  - `html` (required): The raw HTML content.
  - `url` (optional): The original URL (used for resolving relative links and images).
  - `includeMetadata` (optional): `true` to include metadata.

**Example**:
```shell
curl -X POST http://localhost:3030/extract/html \
  -H "Content-Type: application/json" \
  -d '{"html": "<html><body><h1>Example</h1><p>Content</p></body></html>", "includeMetadata": true}'
```

#### 4. `GET /health`
Returns the server status and current timestamp.

### Response Formats
The response format can be configured using the `Accept` header:

- **`application/json` (Default)**: Returns a JSON object containing the extracted `pageContentHtml`, `url`, and `metadata` (if requested).
- **`text/html`**: Returns only the extracted content as a raw HTML string.
- **`text/plain`**: Returns the extracted content converted to plain text.

**Example** (HTML response):
```shell
curl -H "Accept: text/html" "http://localhost:3030/extract?url=https://github.com/dankito/ReadabilityServer/blob/main/README.md"
```

#### Plain Text Configuration
When using `text/plain`, you can pass these additional parameters in your request to control the conversion:
- `preserveLinkUrlsInPlainText`: `true` to include link URLs in the text output.
- `preserveImageUrlsInPlainText`: `true` to include image source URLs in the text output.

**Example**:
```shell
curl -H "Accept: text/plain" \
  "http://localhost:3030/extract?url=https://github.com/dankito/ReadabilityServer/blob/main/README.md&preserveLinkUrlsInPlainText=true&preserveImageUrlsInPlainText=true"
```


---

## License

This project is licensed under the [MIT License](LICENSE).

```
MIT License

Copyright (c) 2026 dankito

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
