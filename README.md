# Guan - Java Workspace

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

A Java workspace powered by Nx and Maven, containing Spring Boot applications and microservices projects.

## Projects

### [gRPC Microservices](apps/grpc/README.md)
Spring Boot microservices demonstrating gRPC communication with REST API gateway. Includes user-service, aggregator-service, and shared proto definitions.

**Quick Start:**
```bash
pnpm run grpc:build    # Build
pnpm run grpc:serve    # Run all services
```

### [gRPC Angular Client](apps/grpc-angular/README.md)
Angular frontend that consumes the gRPC gateway via Connect-Web endpoints and generated TypeScript clients.

**Quick Start:**
```bash
pnpm run grpc-angular:build    # Build
pnpm run grpc-angular:serve    # Run dev server
```

### [Spring Boot Demo](apps/springbootup/README.md)
Comprehensive Spring Boot 4.0.2 application with REST APIs, JPA/Hibernate, OpenAPI documentation, and Actuator monitoring.

**Quick Start:**
```bash
pnpm run springbootup:build    # Build
pnpm run springbootup:serve    # Run application
```

## Getting Started

**Prerequisites:** Java 25+, Maven 3.9+, Node.js 18+, pnpm

```bash
# Install dependencies
pnpm install

# Build all projects
nx run-many -t build

# Run specific project
nx run <project-name>:serve
```

## Common Commands

```bash
# Build, test, clean
nx run <project>:build
nx run <project>:test
nx run <project>:clean

# View project graph
npx nx graph

# Run affected projects
nx affected -t build
nx affected -t test
```

## Workspace Structure

```
apps/
  ├── grpc/              # gRPC microservices
  ├── grpc-angular/      # Angular client for gRPC gateway
  └── springbootup/      # Spring Boot demo
packages/                # Shared libraries
```

Visit each project's README for detailed documentation, architecture, and specific instructions.

---

**Tech Stack:** Java 25 • Spring Boot 4.0.2 • gRPC • Maven • Nx
