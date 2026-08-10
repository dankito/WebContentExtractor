# Readability Server

A high-performance, Hono-based web service wrapper for Mozilla's [Readability.js](https://github.com/mozilla/readability). Extract clean, readable content from any webpage with lightning speed.

## Goal
The goal of Readability Server is to provide a simple, containerized API that leverages the industry-standard Readability algorithm to strip away clutter (ads, sidebars, popups) and return only the essential content of a webpage.

## Advantages
- **Fast & Lightweight**: Built with [Hono](https://hono.dev/) and powered by [Bun](https://bun.sh/) for minimal overhead and high throughput.
- **Production Ready**: Easily deployable via Docker and Docker Compose.
- **Mozilla Readability**: Uses the same battle-tested extraction logic as Firefox's Reader View.
- **Flexible Output**: Configure the response format via headers to get JSON, clean HTML, or plain text.
- **Rich Metadata**: Optionally extract title, author, site name, excerpt, and more.

## How to Run

### Docker Run
You can run the server directly using Docker:
```bash
docker run -p 3030:3030 readability-server
```

### Docker Compose
Create a `docker-compose.yml` file:
```yaml
version: '3.8'
services:
  readability-server:
    image: readability-server
    build: .
    ports:
      - "3030:3030"
    environment:
      - HOST=0.0.0.0
      - PORT=3030
    restart: always
```
Then start it with:
```bash
docker compose up -d
```

### Local Development
To run the project locally, ensure you have [Bun](https://bun.sh/) installed:
```bash
# Install dependencies
bun install

# Run in development mode (with hot reload)
bun run dev
```

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

#### 2. `POST /extract`
Preferred for long URLs or when passing multiple options.
- **Body (JSON)**:
  - `url` (required): The URL of the page to extract.
  - `includeMetadata` (optional): `true` to include metadata.
  - `timeout` (optional): Request timeout in milliseconds.
  - `userAgent` (optional): Custom User-Agent header.
  - `followRedirects` (optional): `true` or `false`.

#### 3. `POST /extract/html`
Extract content from a raw HTML string you already have.
- **Body (JSON)**:
  - `html` (required): The raw HTML content.
  - `url` (optional): The original URL (used for resolving relative links and images).
  - `includeMetadata` (optional): `true` to include metadata.

#### 4. `GET /health`
Returns the server status and current timestamp.

### Response Formats
The response format can be configured using the `Accept` header:

- **`application/json` (Default)**: Returns a JSON object containing the extracted `pageContentHtml`, `url`, and `metadata` (if requested).
- **`text/html`**: Returns only the extracted content as a raw HTML string.
- **`text/plain`**: Returns the extracted content converted to plain text.

#### Plain Text Configuration
When using `text/plain`, you can pass these additional parameters in your request to control the conversion:
- `preserveLinkUrlsInPlainText`: `true` to include link URLs in the text output.
- `preserveImageUrlsInPlainText`: `true` to include image source URLs in the text output.

## License
This project is licensed under the [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0).
