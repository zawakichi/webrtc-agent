# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Communication Language

日本語でやりとりする (Communicate in Japanese)

## Project Overview

WebRTC-based AI agent for system development consultation that joins Google Meet sessions to conduct requirement gathering conversations and automatically generates requirement definition documents and functional specification documents with Mermaid/PlantUML diagrams.

## Technology Stack

### Core Technologies
- **Frontend**: React + TypeScript + Vite
- **Backend**: Go + Gin framework
- **Database**: MySQL + GORM
- **Package Manager**: Bun (high-performance package manager)
- **Containerization**: Docker + Docker Bake for multi-target builds
- **Task Runner**: Taskfile for command shortcuts
- **Documentation**: MkDocs with Material theme

### Real-time & AI
- **WebRTC**: Pion library for Go
- **AI Integration**: OpenAI Realtime API
- **Real-time Communication**: WebSocket + Socket.io

### Testing & Quality
- **Unit Testing**: Vitest (frontend), Go test (backend)
- **E2E Testing**: Playwright
- **BDD Testing**: Jest-Cucumber with Gherkin scenarios
- **Code Quality**: ESLint, Prettier, golangci-lint

## Architecture

Follows Clean Architecture principles with clear separation of concerns:

### Backend (Go)
```
src/backend/
├── cmd/                    # Application entry points
├── internal/
│   ├── domain/            # Business entities and core logic
│   │   └── entities/      # Domain entities (Meeting, Consultation)
│   ├── app/               # Application services and use cases
│   ├── infra/             # Infrastructure implementations
│   └── interfaces/        # HTTP handlers and WebSocket connections
├── configs/               # Configuration files
└── scripts/              # Database scripts and utilities
```

### Frontend (React)
```
src/frontend/
├── components/           # Reusable UI components
├── pages/               # Page components
├── hooks/               # Custom React hooks
├── stores/              # State management (Zustand)
├── types/               # TypeScript type definitions
└── utils/               # Utility functions
```

## Development Setup

### Required Commands
- `task dev` - Start development environment (all services)
- `task dev:logs` - View development logs
- `task dev:stop` - Stop development environment
- `task build` - Build both frontend and backend
- `task test` - Run all tests (unit + integration)
- `task lint` - Run code quality checks
- `task docs` - Start documentation server

### Docker Commands
- `task docker:build` - Build all containers using Docker Bake
- `task docker:build:dev` - Build development containers
- `task docker:build:prod` - Build production containers

### Project Structure
```
webrtc-agent/
├── src/
│   ├── frontend/          # React + TypeScript frontend with configs
│   │   ├── package.json   # Frontend package configuration
│   │   ├── vite.config.ts # Vite build configuration
│   │   ├── tsconfig.json  # TypeScript configuration
│   │   ├── .eslintrc.json # ESLint configuration
│   │   ├── .prettierrc    # Prettier configuration
│   │   └── bunfig.toml    # Bun configuration
│   └── backend/           # Go backend with clean architecture
│       ├── go.mod         # Go module definition
│       ├── .air.toml      # Air hot reload configuration
│       └── ...
├── environment/
│   └── docker/            # All Docker-related files
│       ├── docker-bake.hcl         # Docker Bake configuration
│       ├── docker-compose.dev.yml  # Development environment
│       ├── compose.yaml            # Production environment
│       ├── Dockerfile              # Main application
│       ├── Dockerfile.frontend     # Frontend-only image
│       ├── Dockerfile.backend      # Backend-only image
│       ├── Dockerfile.docs         # MkDocs documentation
│       ├── nginx.conf              # Production Nginx
│       ├── nginx.dev.conf          # Development Nginx
│       └── start.sh                # Container startup script
├── doc/                   # MkDocs documentation
│   ├── index.md           # Documentation homepage
│   ├── architecture/      # Architecture documentation
│   ├── development/       # Development guides
│   ├── api/              # API specifications
│   └── deployment/       # Deployment guides
├── tests/                # All test files
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   ├── e2e/              # End-to-end tests (Playwright)
│   └── bdd/              # BDD tests (Jest-Cucumber)
├── Taskfile.yml          # Task runner configuration
├── mkdocs.yml            # MkDocs configuration
└── CLAUDE.md             # This file (moved to .claude/)
```

## Development Workflow

### Starting Development
1. **Initial Setup**: `task setup` - Install dependencies and build
2. **Start Environment**: `task dev` - Launch all services
3. **Access Applications**:
   - Main App: http://localhost
   - Documentation: http://docs.localhost
   - Backend API: http://localhost/api

### Service Architecture in Development
- **Frontend**: React dev server (port 3000)
- **Backend**: Go server with Air hot reload (port 3001)
- **Documentation**: MkDocs server (port 8000)
- **Database**: MySQL (port 3306)
- **Cache**: Redis (port 6379)
- **Proxy**: Nginx reverse proxy (port 80)

### Code Quality
- **Frontend**: ESLint + Prettier + TypeScript strict mode
- **Backend**: golangci-lint + go fmt + goimports
- **Testing**: Comprehensive test coverage with multiple testing strategies

## Key Features

### 1. WebRTC Integration
- Real-time audio/video communication with Google Meet
- Pion WebRTC library for Go backend
- Simple-peer library for React frontend

### 2. AI Consultation System
- Integration with OpenAI Realtime API
- Structured requirement gathering conversations
- Automated document generation with Mermaid/PlantUML diagrams

### 3. Clean Architecture Implementation
- Domain-driven design with clear boundaries
- Dependency inversion and interface-based abstractions
- Testable and maintainable code structure

### 4. Comprehensive Testing Strategy
- Unit tests for individual components and functions
- Integration tests for API endpoints and database operations
- E2E tests for complete user workflows
- BDD tests for business requirement validation

### 5. Developer Experience
- Hot reload for both frontend and backend
- Comprehensive documentation with MkDocs
- Task runner for simplified command execution
- Docker-based development environment

## Recent Major Changes

### Project Structure Reorganization
1. **Moved from Node.js/TypeScript to Go backend** - User explicitly requested Go
2. **Reorganized src/ folder structure** - Only frontend/ and backend/ remain
3. **Moved configuration files** - Each service has its own configs
4. **Consolidated Docker files** - All in environment/docker/
5. **Added comprehensive task runner** - Taskfile.yml for simplified commands
6. **Integrated MkDocs documentation** - Live documentation server

### Architecture Evolution
- Started with basic WebRTC concept
- Evolved to Clean Architecture with frontend/backend separation
- Added BDD testing strategy with Playwright E2E tests
- Implemented MySQL database design
- Added Docker Bake for multi-target containerization
- Integrated comprehensive documentation system

## Important Development Notes

### Package Management
- **Frontend**: Uses Bun as package manager (in src/frontend/)
- **Backend**: Uses Go modules (in src/backend/)
- **Global**: Taskfile.yml provides unified command interface

### Configuration Patterns
- Frontend configs are in src/frontend/ (package.json, vite.config.ts, etc.)
- Backend configs are in src/backend/ (go.mod, .air.toml, etc.)
- Docker configs are in environment/docker/
- Documentation configs are in root (mkdocs.yml)

### Task Commands Usage
Always prefer Task commands over direct commands:
- `task dev` instead of `docker-compose -f environment/docker/docker-compose.dev.yml up -d`
- `task build` instead of manual frontend/backend builds
- `task test` instead of individual test commands

### Docker Strategy
- **Development**: docker-compose.dev.yml with hot reload
- **Production**: Docker Bake with multi-stage builds
- **Documentation**: Integrated MkDocs container
- **Services**: MySQL, Redis, Nginx reverse proxy

## User Preferences and Requirements

### Explicitly Stated Preferences
1. **Language**: Japanese communication ("日本語でやりとりする")
2. **Backend Technology**: Go ("バックエンドはGoがいいなぁ")
3. **Containerization**: Docker Bake ("Docker ComposeはBakeをつかうようにしてくださいね")
4. **Package Manager**: Bun for frontend
5. **Build Tool**: Vite for frontend development
6. **Testing**: BDD + Playwright E2E tests
7. **Database**: MySQL
8. **Architecture**: Clean Architecture with frontend/backend separation

### Project Goals
- Create WebRTC agent that joins Google Meet for system development consultation
- Generate requirement definition documents and functional specifications
- Use Mermaid/PlantUML for diagram generation
- Implement real-time audio conversation with AI
- Maintain high code quality with comprehensive testing

## Important Instructions
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.

## Context Notes
This project represents a sophisticated WebRTC-based AI consultation system with modern development practices, comprehensive testing, and excellent developer experience. The architecture is designed for scalability and maintainability while meeting the specific requirements for real-time communication and AI-powered document generation.