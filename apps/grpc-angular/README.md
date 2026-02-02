# gRPC Angular Client

Angular application that consumes the gRPC microservices through Connect-Web endpoints. It includes generated TypeScript clients from the shared protobufs and a proxy configuration for local development.

## Prerequisites

- Node.js 20+ and pnpm
- Backend services running from [apps/grpc](apps/grpc/README.md)
- Envoy gateway running on `http://localhost:8080` (required for browser gRPC-Web)
	- Start it with: `nx run grpc:envoy:up`

## Quick Start

```bash
# Install workspace dependencies (from repo root)
pnpm install

# Start backend services (in another terminal)
nx run grpc:serve

# Start the Envoy gRPC-Web gateway (in another terminal)
nx run grpc:envoy:up

# Generate TypeScript clients from protobufs
nx run grpc-angular:proto:generate

# Start the dev server with proxy support
pnpm run grpc-angular:serve
```

The dev server proxies requests to the backend using [apps/grpc-angular/proxy.conf.json](apps/grpc-angular/proxy.conf.json).

## Common Commands

```bash
# Build for production
pnpm run grpc-angular:build

# Serve the production build locally
pnpm run grpc-angular:serve-static

# Run unit tests
pnpm run grpc-angular:test
```

## Generated Code

Protobuf generation is configured in [apps/grpc-angular/proto/buf.gen.yaml](apps/grpc-angular/proto/buf.gen.yaml) and outputs TypeScript clients to apps/grpc-angular/src/gen.

## Notes

- The proxy routes `/user.UserService` and `/stock.StockService` to `http://localhost:8080`. If you see Vite `ECONNREFUSED`, Envoy is usually not running (or port `8080` is in use).
- Envoy admin is available at `http://localhost:9901`.
