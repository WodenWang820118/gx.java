# gRPC Application

A Spring Boot-based microservices application demonstrating gRPC communication patterns between services, including both service-to-service gRPC calls and HTTP REST endpoints for external access.

## 📋 Overview

This application consists of multiple microservices that communicate via gRPC:

- **proto-common**: Shared protobuf definitions for service contracts
- **user-service**: Backend service providing user management via gRPC (port 9092)
- **aggregator-service**: API gateway that exposes REST endpoints and communicates with backend services via gRPC clients (port 3001)

## 🏗️ Architecture

```
┌─────────────────────┐
│  Client/Frontend    │
└──────────┬──────────┘
           │ HTTP/REST
           ▼
┌─────────────────────┐
│ Aggregator Service  │ (Port 3001)
│  - REST API         │
│  - gRPC Client      │
└──────────┬──────────┘
           │ gRPC
           ▼
┌─────────────────────┐
│   User Service      │ (Port 9092 - gRPC)
│  - gRPC Server      │ (Port 9090 - HTTP)
│  - H2 Database      │
└─────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Java 17 or higher
- Maven 3.9+ (or use the included `build-and-run.sh` script)
- Port 3001, 9090, and 9092 available

### Using Nx (Recommended)

The project is integrated with Nx for efficient task execution:

```bash
# Build all modules
nx run grpc:build

# Run all services in parallel (dev profile)
nx run grpc:serve

# Run individual services
nx run grpc:serve:user          # User service only
nx run grpc:serve:aggregator    # Aggregator service only

# Run tests
nx run grpc:test

# Clean build artifacts
nx run grpc:clean
```

### Using Maven Directly

```bash
# From apps/grpc directory

# Build all modules
mvn clean install -DskipTests

# Run user-service
mvn spring-boot:run -pl modules/user-service -Dspring-boot.run.profiles=dev

# Run aggregator-service (in separate terminal)
mvn spring-boot:run -pl modules/aggregator-service -Dspring-boot.run.profiles=dev
```

### Using the Build Script

```bash
# Auto-downloads Maven if needed and builds the project
./build-and-run.sh
```

## 📦 Modules

### proto-common

Shared protobuf definitions that define the service contracts.

**Location**: `modules/proto-common/src/main/proto/`

- `user-service.proto` - User service RPC definitions
- `stock-service.proto` - Stock service RPC definitions
- `common/` - Shared message types

The protobuf files are compiled to Java classes using the `protobuf-maven-plugin`.

### user-service

Backend microservice providing user management functionality via gRPC.

**Ports**:
- `9090` - HTTP (Health checks, H2 console)
- `9092` - gRPC Server

**Features**:
- gRPC service implementation
- Spring Data JPA with H2 database
- SQL initialization on startup
- H2 console available at: http://localhost:9090/h2-console

**Database Configuration** (dev):
- URL: `jdbc:h2:mem:userdb`
- Username: `sa`
- Password: *(empty)*

### aggregator-service

API Gateway that exposes REST endpoints and aggregates data from backend services using gRPC clients.

**Port**: `3001` (HTTP/REST)

**Features**:
- REST API endpoints for external clients
- gRPC client to communicate with user-service
- Protobuf-JSON conversion for REST responses
- Keep-alive and connection management for gRPC channels

**gRPC Client Configuration**:
- Target: `localhost:9092` (user-service)
- Keep-alive: 30s
- Idle timeout: 5m
- Max inbound message size: 4MB

## 🔧 Configuration Profiles

The application supports multiple Spring profiles:

- `dev` - Development profile (default)
- `development` - Extended development configuration
- `production` - Production configuration

Switch profiles using:
```bash
-Dspring-boot.run.profiles=dev
```

## 🧪 Testing

```bash
# Run all tests
nx run grpc:test

# Or with Maven
mvn test
```

## 🛠️ Development

### Adding New Services

1. Create a new module in `modules/`
2. Define service contract in `proto-common/src/main/proto/`
3. Update parent `pom.xml` to include the new module
4. Implement gRPC service or client
5. Update `project.json` for Nx integration

### Protobuf Changes

After modifying `.proto` files:

```bash
# Rebuild proto-common to regenerate Java classes
mvn clean install -pl modules/proto-common

# Then rebuild dependent services
mvn clean install -pl modules/user-service,modules/aggregator-service
```

## 📊 Monitoring & Debugging

### H2 Database Console

Access the user-service database:
- URL: http://localhost:9090/h2-console
- JDBC URL: `jdbc:h2:mem:userdb`
- Username: `sa`
- Password: *(empty)*

### Health Checks

- User Service: http://localhost:9090/actuator/health
- Aggregator Service: http://localhost:3001/actuator/health

### Logging

Both services use colored console logging with service name prefixes:
- 🔵 USER-SERVICE
- 🟢 AGGREGATOR-SERVICE

Log levels can be adjusted in `application-dev.properties`.

## 🔐 Dependencies

Key technologies used:

- **Spring Boot** - Application framework
- **Spring gRPC** (1.0.1) - gRPC integration for Spring
- **gRPC** - High-performance RPC framework
- **Protocol Buffers** - Serialization format
- **Spring Data JPA** - Database access
- **H2 Database** - In-memory database
- **Lombok** - Boilerplate reduction

## 📝 Notes

- All services must be running for the aggregator to work properly
- The aggregator service depends on user-service being available at `localhost:9092`
- gRPC communication uses plaintext (no TLS) in development mode
- The build includes automatic protobuf compilation via Maven plugins

## 🤝 Contributing

When making changes:

1. Follow the existing code structure
2. Update proto definitions in `proto-common` for API changes
3. Maintain backward compatibility when possible
4. Add tests for new functionality
5. Update this README if adding new services or changing configuration

## 📄 License

Part of the gx.java project.
