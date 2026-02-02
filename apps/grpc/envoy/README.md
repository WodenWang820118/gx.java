# Envoy

This folder contains an Envoy config that fronts:

- Aggregator HTTP API: `http://localhost:3001` (`/user`, `/trade`, `/stock/updates`)
- gRPC services for gRPC-Web (optional / future):
  - user-service: `localhost:9092`
  - stock-service: `localhost:9091`

## Run

1) Start the Java services:

- From repo root: `npx nx run grpc:serve`

2) Start Envoy:

- `cd apps/grpc/envoy && docker compose up -d`

Envoy listens on:
- `http://localhost:8080` (proxy)
- `http://localhost:9901` (admin)

## Notes

- The config uses `host.docker.internal` so the Envoy container can reach services running on your host.
- Angular dev server is configured to proxy API calls to Envoy via `apps/grpc-angular/proxy.conf.json`.
