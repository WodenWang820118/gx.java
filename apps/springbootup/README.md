# Spring Boot Demo Application

A comprehensive Spring Boot 4.0.2 demo application showcasing modern enterprise Java development practices with REST APIs, JPA/Hibernate, and various Spring Boot features.

## 📋 Table of Contents

- [Overview](#overview)
- [Technologies](#technologies)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Configuration](#configuration)
- [Development](#development)
- [Testing](#testing)
- [Building](#building)
- [Documentation](#documentation)

## 🎯 Overview

This is a demo Spring Boot application that demonstrates:
- RESTful API development
- JPA/Hibernate for database operations
- Employee and Department management system
- Spring AOP for cross-cutting concerns
- API documentation with SpringDoc OpenAPI
- Health monitoring with Spring Boot Actuator
- JSON logging with Logstash encoder

## 🛠 Technologies

- **Java**: 25
- **Spring Boot**: 4.0.2
- **Database**: H2 (in-memory) / MySQL
- **Build Tool**: Maven
- **ORM**: Hibernate/JPA
- **API Documentation**: SpringDoc OpenAPI 2.6.0
- **Mapping**: ModelMapper 3.2.0
- **Logging**: Logback with Logstash encoder 4.9
- **Monitoring**: Spring Boot Actuator
- **Code Generation**: Lombok

## ✨ Features

### Core Functionality
- **Employee Management**: CRUD operations for employees
- **Department Management**: Department tracking and relationships
- **RESTful APIs**: Clean, resource-oriented endpoints
- **Data Validation**: Jakarta Bean Validation
- **Exception Handling**: Global exception handler
- **DTO Pattern**: Entity-DTO mapping for clean API contracts

### Technical Features
- **Spring AOP**: Aspect-oriented programming support
- **JPA Auditing**: Automatic tracking of entity changes
- **H2 Console**: In-memory database management interface
- **Health Checks**: Spring Boot Actuator health endpoints
- **OpenAPI/Swagger**: Interactive API documentation
- **JSON Logging**: Structured logging for analysis

## 📦 Prerequisites

- Java 25 or higher
- Maven 3.6+ (or use the Nx wrapper)
- H2 Database (embedded) or MySQL (optional)

## 🚀 Getting Started

### Clone and Navigate

```bash
cd c:/software-dev/gx.java/apps/springbootup
```

### Build the Application

Using Nx (recommended):
```bash
nx run springbootup:build
```

Or using npm/pnpm:
```bash
pnpm run springbootup:build
```

Or using Maven directly:
```bash
mvn clean package
```

### Run the Application

Using Maven:
```bash
mvn spring-boot:run
```

Or run the built JAR:
```bash
java -jar target/demo-0.0.1-SNAPSHOT.jar
```

The application will start on `http://localhost:8080`

## 📁 Project Structure

```
src/
├── main/
│   ├── java/com/example/demo/
│   │   ├── aspect/              # AOP aspects
│   │   ├── common/              # Common utilities, mappers, exception handlers
│   │   ├── config/              # Configuration classes
│   │   │   ├── AopConfig.java
│   │   │   ├── DatabaseConfig.java
│   │   │   ├── ModelMapperConfig.java
│   │   │   └── OpenAPIConfig.java
│   │   ├── controllers/         # REST controllers
│   │   │   └── EmployeeController.java
│   │   ├── dao/                 # Data Access Objects
│   │   ├── dto/                 # Data Transfer Objects
│   │   │   ├── EmployeeDto.java
│   │   │   └── DepartmentDto.java
│   │   ├── entity/              # JPA entities
│   │   │   ├── Employee.java
│   │   │   └── Department.java
│   │   ├── health/              # Custom health indicators
│   │   ├── repositories/        # Spring Data JPA repositories
│   │   │   ├── EmployeeRepository.java
│   │   │   └── DepartmentRepository.java
│   │   ├── services/            # Business logic services
│   │   │   ├── employee/
│   │   │   ├── department/
│   │   │   └── trafficfortune/
│   │   └── SpringbootupApplication.java
│   └── resources/
│       ├── application.properties  # Application configuration
│       ├── data.sql               # Initial data
│       └── schema.sql             # Database schema
└── test/                          # Test classes
```

## 🔌 API Endpoints

### Employee Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/employees/list` | Get all employees |
| GET | `/employees/get/{id}` | Get employee by ID |
| POST | `/employees/save` | Create or update employee |
| GET | `/employees/delete/{id}` | Delete employee |

### Health & Monitoring

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/actuator/health` | Application health status |

### API Documentation

- **Swagger UI**: `http://localhost:8080/swagger-ui.html`
- **OpenAPI JSON**: `http://localhost:8080/v3/api-docs`

## ⚙️ Configuration

### Database Configuration

#### H2 (Default - In-Memory)
```properties
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.username=dbuser
spring.datasource.password=dbpass
spring.h2.console.enabled=true
```

Access H2 Console at: `http://localhost:8080/h2-console`

#### MySQL (Alternative)
Update `application.properties` with MySQL connection details:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/your_database
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### Application Properties

Key configurations in `application.properties`:
- **Port**: Default is 8080
- **JPA**: Hibernate DDL auto-update enabled
- **Actuator**: Health endpoint exposed
- **Logging**: DEBUG level for root, INFO for Spring
- **H2 Console**: Enabled for development

## 🔧 Development

### Enable Development Mode

The application uses Spring Boot DevTools (when available) for:
- Automatic restarts
- LiveReload support
- Enhanced development experience

### Code Style

The project uses:
- **Lombok**: Reduce boilerplate code with annotations
- **Builder Pattern**: For entity construction
- **DTO Pattern**: Separate API contracts from domain models

### Adding New Features

1. Create entity in `entity/` package
2. Create corresponding DTO in `dto/` package
3. Create repository extending `JpaRepository`
4. Implement service in `services/` package
5. Create REST controller in `controllers/` package
6. Add tests in `src/test/`

## 🧪 Testing

Run tests using:

```bash
# Using Nx
nx run springbootup:test

# Using Maven
mvn test
```

## 🏗️ Building

### Development Build
```bash
nx run springbootup:build
```

### Production Build
```bash
mvn clean package -DskipTests
```

The JAR file will be created in `target/demo-0.0.1-SNAPSHOT.jar`

## 📚 Documentation

### Swagger/OpenAPI Documentation

Once the application is running, visit:
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **OpenAPI Spec**: http://localhost:8080/v3/api-docs

The OpenAPI documentation is auto-generated and includes:
- All REST endpoints
- Request/response schemas
- Try-it-out functionality
- Model definitions

### Actuator Endpoints

Monitor application health:
- **Health**: http://localhost:8080/actuator/health

## 🔐 Security Notes

This is a demo application. For production use, consider:
- Adding Spring Security
- Implementing authentication/authorization
- Securing actuator endpoints
- Using environment-specific configurations
- Enabling HTTPS
- Implementing rate limiting

## 📄 License

This is a demo project for educational purposes.

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Add tests
4. Submit a pull request

## 📞 Support

For issues or questions, please refer to the main project documentation or create an issue in the repository.

---

**Version**: 0.0.1-SNAPSHOT  
**Artifact ID**: demo  
**Group ID**: com.springboot.collection
