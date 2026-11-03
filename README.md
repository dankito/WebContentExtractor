# Web Content Extractor

A high-performance web content extraction microservice combining Readability-based main content extraction, HTML-to-Markdown/text conversion, 
stealth web fetching (anti-bot detection bypass), and prompt-injection sanitization.

---

## Features

- ⚡ **Fast & Lightweight**: Built with [Hono](https://hono.dev/) and powered by [Bun](https://bun.sh/) for minimal overhead, low latency, and high throughput.
- 📰 **Mozilla Readability**: Extracts clean main article content from any webpage, stripping navigation bars, advertisements, cookie banners, sidebars, and boilerplate using the same battle-tested extraction logic as Firefox's Reader View.
- 🥷 **Stealth Fetching & Anti-Bot Bypass**: Native integration with [WebFetcher](https://github.com/dankito/WebFetcher) for seamless bot-detection bypass (Cloudflare, Akamai, DataDome, etc.) via stealth browser emulation ([Camoufox](https://github.com/daijro/camoufox)) and TLS fingerprinting ([Impit](https://github.com/soundws/impit)), with automatic fallback from the standard Fetch API.
- 📄 **Multi-Format Extraction**: Retrieve content in multiple formats (`JSON`, `HTML`, `Markdown`, or plain `Text`) in a single API call (e.g., retrieving raw HTML, content Markdown, and metadata together).
- 🛡️ **Prompt Injection Defense**: Sanitizes HTML by stripping invisible Unicode characters, zero-width spaces, and malicious prompt-injection payloads before content is delivered to downstream LLMs.
- 🤖 **Model Context Protocol (MCP) Server**: Built-in [MCP](https://modelcontextprotocol.io/) server (`/mcp` endpoint) providing ready-to-use tools for LLMs, Claude Desktop, Cursor, and agentic workflows.
- 🌐 **OpenWebUI Integration**: Dedicated `/openwebui` endpoint compatible with OpenWebUI's external web loader.
- 📊 **Prometheus Metrics & Observability**: Native `/metrics` endpoint exposing Prometheus metrics for request counts, durations, and HTTP status codes.
- 📑 **Interactive OpenAPI & Swagger-UI**: Full OpenAPI 3.1 specification at `/openapi.json` and interactive API explorer at `/swagger-ui`.
- 🖥️ **Built-in Web UI**: Simple, user-friendly Web UI at `/` for testing URL extractions and HTML conversions directly in your browser.
- 🐳 **Multi-Arch Docker Images**: Pre-built Docker images for both `linux/amd64` and `linux/arm64`.

---

## How to Run

### Docker Images & Tagging

Docker images are published to GitHub Container Registry `ghcr.io/dankito/web-content-extractor`

#### Image Tags
For each release version, images are published with semantic version tags:
- `<major>` (e.g. `0` or `1`)
- `<major>.<minor>` (e.g. `0.7` or `1.0`)
- `<major>.<minor>.<patch>` (e.g. `0.7.1` or `1.0.0`)
- `latest` always points to the latest released version.

#### Architectures
All images are multi-arch builds supporting:
- `linux/amd64` (x86_64)
- `linux/arm64` (Apple Silicon, ARM servers)

### Docker Run
Run the standalone container directly:
```shell
docker run -d -p 3030:3030 --name web-extractor ghcr.io/dankito/web-content-extractor:latest
```

### Docker Compose

#### Option 1: Standalone Deployment

Create a `docker-compose.yml` file:
```yaml
services:
  web-extractor:
    image: ghcr.io/dankito/web-content-extractor:latest
    container_name: web-extractor
    restart: unless-stopped
    ports:
      - "3030:3030"
    environment:
      # Optional: configure the port and interface to listen on:
      - HOST=0.0.0.0
      - PORT=3030
      # - BASE_PATH=/web-extractor
```

Start the service:
```shell
docker compose up -d
```

#### Option 2: With WebFetcher (Anti-Bot Bypass)

To enable advanced stealth fetching and bot-detection bypass, run Web Content Extractor alongside [WebFetcher](https://github.com/dankito/WebFetcher):

```yaml
services:
  web-extractor:
    image: ghcr.io/dankito/web-content-extractor:latest
    container_name: web-extractor
    restart: unless-stopped
    ports:
      - "3030:3030"
    environment:
      - WEB_FETCHER_URL=http://web-fetcher:3031

  web-fetcher:
    image: ghcr.io/dankito/web-fetcher:latest
    container_name: web-fetcher
    restart: unless-stopped
    ports:
      - "3031:3031"
    volumes:
      - ./data:/data
```

Start both services:
```shell
docker compose -f docker-compose.webfetcher.yml up -d
```

### Local Development

To run the service locally, ensure you have [Bun](https://bun.sh/) installed:
```shell
# Install dependencies
bun install

# Run in development mode (with hot reload)
bun run dev
```

---

## Environment Variables & Configuration

The service is configured using the following environment variables:

| Variable          | Description                                                                                                                   | Default                           |
|-------------------|-------------------------------------------------------------------------------------------------------------------------------|-----------------------------------|
| `HOST`            | The hostname or network interface to bind and listen on.                                                                      | `localhost` (`0.0.0.0` in Docker) |
| `PORT`            | The port number to listen on.                                                                                                 | `3030`                            |
| `BASE_PATH`       | Optional base path prefix for all endpoints when served behind a reverse proxy (e.g. `/web-extractor` or `/api/v1`).          | _None (root `/`)_                 |
| `WEB_FETCHER_URL` | Optional base URL of a running [WebFetcher](https://github.com/dankito/WebFetcher) instance (e.g. `http://web-fetcher:8000`). | _None_                            |

---

## WebFetcher Integration

[WebFetcher](https://github.com/dankito/WebFetcher) is a stealth HTTP and browser fetching service designed to bypass aggressive anti-bot and scraping protections (Cloudflare, Akamai, DataDome, etc.) using:
- **Impit**: HTTP client with realistic TLS/JA3/JA4 fingerprinting and browser headers.
- **Camoufox**: Headless stealth Firefox browser engine with anti-detection evasions.

### How it works:
1. When `WEB_FETCHER_URL` is set, Web Content Extractor tries the fast standard JS Fetch API first.
2. If the request fails (e.g. HTTP 403/503 from bot protection, network block), it automatically escalates and retries the request through WebFetcher.
3. You can also explicitly request specific fetch engines via the `fetchers` parameter in the API (`JsFetchApi`, `Impit`, `Camoufox`).

Source & Documentation: [https://github.com/dankito/WebFetcher](https://github.com/dankito/WebFetcher)

---

## Key Endpoints & Services

### 1. Model Context Protocol (MCP) Server (`POST /mcp`)
Direct integration with AI assistants and LLMs via [Model Context Protocol](https://modelcontextprotocol.io/) using StreamableHTTPTransport.

**Available MCP Tools**:
- `extract_from_url`: Extracts main content from a URL with full options (JSON, HTML, Markdown, or text).
- `extract_markdown_from_url`: Direct shortcut to fetch a URL, extract main article content, and return clean Markdown. Most likely what LLMs like to use.
- `extract_from_html`: Extracts main article content from provided HTML markup.
- `multi_format_from_url`: Extracts and retrieves multiple output formats (raw HTML, content Markdown, metadata, etc.) from a URL in one call.
- `multi_format_from_html`: Extracts and retrieves multiple output formats from provided HTML.
- `convert_html`: Converts HTML to Markdown or plain text.

### 2. Interactive Swagger-UI (`GET /swagger-ui`)
Interactive API explorer and documentation interface available in your browser at:
`http://localhost:3030/swagger-ui`

### 3. OpenAPI 3.1 Specification (`GET /openapi.json`)
Machine-readable OpenAPI 3.1 specification schema at:
`http://localhost:3030/openapi.json`

### 4. Prometheus Metrics (`GET /metrics`)
Prometheus metrics endpoint providing real-time telemetry on HTTP requests, durations, response codes, and system metrics.

### 5. Health Check (`GET /health`)
Returns server status and ISO timestamp for container orchestration and uptime monitoring:
```json
{
  "status": "ok",
  "timestamp": "2026-11-03T05:41:00.000Z"
}
```

### 6. Web UI (`GET /`)
A lightweight web interface served at `http://localhost:3030/` for testing URL extraction and content conversion directly in the browser.

### 7. OpenWebUI Integration (`POST /openwebui`)
Provides an endpoint specifically tailored for [OpenWebUI](https://openwebui.com/)'s external WebLoader feature.
In OpenWebUI go to Settings -> Web Search -> Web Loader Engine -> "External Web Loader URL" 
and enter the URL of you web extractor instance like:   
`http://localhost:3030/openwebui`

Under "External Web Loader API Key" enter any value (not checked by web extractor).

---

## API Documentation

### Content Extraction

#### 1. `GET /extract/from-url`
Quick, cacheable single-call extraction via query parameters.

**Query Parameters**:

The default values listed here also apply to the corresponding request parameters and JSON body options in the endpoints below.

| Parameter                      | Type    | Required | Default | Description                                                               |
|--------------------------------|---------|----------|---------|---------------------------------------------------------------------------|
| `url`                          | string  | Yes      | -       | The URL of the webpage to extract.                                        |
| `outputFormat`                 | string  | No       | `json`  | Response format: `json`, `html`, `markdown`, `text`.                      |
| `includeMetadata`              | boolean | No       | `false` | Whether to include metadata (title, author, excerpt, etc.).               |
| `fetchers`                     | string  | No       | -       | Comma-separated list of fetch engines: `JsFetchApi`, `Impit`, `Camoufox`. |
| `timeout`                      | number  | No       | `60000` | Request timeout in milliseconds.                                          |
| `userAgent`                    | string  | No       | -       | Custom `User-Agent` header for fetch requests.                            |
| `followRedirects`              | boolean | No       | `true`  | Whether to follow HTTP redirects.                                         |
| `converters`                   | string  | No       | -       | Markdown converter fallback list: `Kreuzberg`, `Turndown`.                |
| `includeImages`                | boolean | No       | `false` | Whether to include images in Markdown output.                             |
| `includeLinks`                 | boolean | No       | `true`  | Whether to include links in Markdown output.                              |
| `preserveLinkUrlsInPlainText`  | boolean | No       | `false` | Whether to include link URLs in plain text output.                        |
| `preserveImageUrlsInPlainText` | boolean | No       | `false` | Whether to include image URLs in plain text output.                       |

**Example**:
```shell
curl "http://localhost:3030/extract/from-url?url=https://example.com/article&outputFormat=markdown&includeMetadata=true"
```

---

#### 2. `POST /extract/from-url`
Preferred when extracting long URLs or passing structured configuration options.

**Request Body (JSON)**:
```json
{
  "url": "https://example.com/article",
  "outputFormat": "json",
  "includeMetadata": true,
  "webRequestOptions": {
    "fetchers": ["JsFetchApi", "Impit", "Camoufox"],
    "timeout": 30000,
    "userAgent": "Mozilla/5.0 ...",
    "followRedirects": true
  },
  "markdownConversionOptions": {
    "converters": ["Kreuzberg", "Turndown"],
    "includeImages": true,
    "includeLinks": true
  },
  "textConversionOptions": {
    "preserveLinkUrls": true,
    "preserveImageUrls": false
  }
}
```

**Example**:
```shell
curl -X POST http://localhost:3030/extract/from-url \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/article",
    "outputFormat": "markdown"
  }'
```

---

#### 3. `POST /extract/from-html`
Extract main content from an already fetched HTML document.

**Request Body (JSON)**:
```json
{
  "html": "<html><body><article><h1>Title</h1><p>Main content...</p></article></body></html>",
  "url": "https://example.com/original-url",
  "outputFormat": "json",
  "includeMetadata": true,
  "markdownConversionOptions": {
    "includeImages": true
  },
  "textConversionOptions": {
    "preserveLinkUrls": true
  }
}
```

**Example**:
```shell
curl -X POST http://localhost:3030/extract/from-html \
  -H "Content-Type: application/json" \
  -d '{
    "html": "<html><body><h1>Hello World</h1><p>Sample content</p></body></html>",
    "includeMetadata": true
  }'
```

---

#### 4. `POST /extract/from-url/formats`
Extract and retrieve multiple formats (raw HTML, converted Markdown, extracted content HTML/Markdown/text, and metadata) in a single request.

**Request Body (JSON)**:
```json
{
  "url": "https://example.com/article",
  "include": {
    "rawHtml": false,
    "rawMarkdown": false,
    "rawText": false,
    "contentHtml": true,
    "contentMarkdown": true,
    "contentText": true,
    "metadata": true
  },
  "webRequestOptions": {
    "timeout": 30000
  },
  "markdownConversionOptions": {
    "includeImages": true
  },
  "textConversionOptions": {
    "preserveLinkUrls": true
  }
}
```

**Example Response**:
```json
{
  "contentHtml": "<p>Main article text...</p>",
  "contentMarkdown": {
    "converter": "Kreuzberg",
    "success": true,
    "markdown": "Main article text...",
    "durationMs": 4
  },
  "contentText": {
    "converter": "HtmlToText",
    "success": true,
    "text": "Main article text...",
    "durationMs": 2
  },
  "metadata": {
    "title": "Example Article",
    "excerpt": "A short summary...",
    "siteName": "Example",
    "publishedTime": "2026-11-03T00:00:00Z"
  }
}
```

---

#### 5. `POST /extract/from-html/formats`
Extract multiple formats from provided HTML.

**Request Body (JSON)**:
```json
{
  "html": "<html><body><h1>Article</h1><p>Text</p></body></html>",
  "include": {
    "rawMarkdown": true,
    "contentHtml": true,
    "contentMarkdown": true,
    "metadata": true
  }
}
```

---

### HTML Conversion

#### 6. `POST /convert`
Convert arbitrary HTML directly to Markdown or plain text without running Readability extraction.

**Request Body (JSON)**:
```json
{
  "html": "<h1>Header</h1><p>Paragraph with <a href=\"https://example.com\">link</a>.</p>",
  "markdownConversionOptions": {
    "includeImages": true,
    "includeLinks": true
  },
  "textConversionOptions": {
    "preserveLinkUrls": true
  }
}
```

- When `Accept: text/markdown` is sent, returns raw Markdown string.
- When `Accept: text/plain` is sent, returns raw text string.
- By default or with `Accept: application/json`, returns structured conversion results.

---

### Third-Party & Integration Endpoints

#### 7. `POST /openwebui`
Batch extraction endpoint for OpenWebUI web loader integration.

**Request Body (JSON)**:
```json
{
  "urls": [
    "https://example.com/article-1",
    "https://example.com/article-2"
  ]
}
```

**Response**: Array of page extraction results formatted for OpenWebUI.

---

### Response Formats & Content Negotiation

Responses can be requested in specific formats using either the `outputFormat` parameter (`json`, `html`, `markdown`, `text`) or HTTP `Accept` headers:

| Format             | `outputFormat` | `Accept` Header    | Description                                                                   |
|--------------------|----------------|--------------------|-------------------------------------------------------------------------------|
| **JSON** (Default) | `json`         | `application/json` | Structured JSON containing `url`, `pageContentHtml`, and optional `metadata`. |
| **HTML**           | `html`         | `text/html`        | Raw extracted HTML string.                                                    |
| **Markdown**       | `markdown`     | `text/markdown`    | Extracted content converted to Markdown.                                      |
| **Plain Text**     | `text`         | `text/plain`       | Extracted content converted to plain text.                                    |

**Example** (Accept header):
```shell
curl -H "Accept: text/markdown" "http://localhost:3030/extract/from-url?url=https://example.com"
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
