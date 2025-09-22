# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Communication Language

日本語でやりとりする (Communicate in Japanese)

## Project Overview

WebRTC-based AI agent for system development consultation that joins Google Meet sessions to conduct requirement gathering conversations and automatically generates requirement definition documents and functional specification documents with Mermaid/PlantUML diagrams.

## Current State

The project is actively in development with the following architecture:

### Technology Stack
- **Frontend**: React + TypeScript with Vite build system
- **Backend**: Go with Gin framework
- **Package Manager**: Bun (high-performance package manager)
- **Database**: MySQL with GORM
- **Containerization**: Docker Bake for multi-target builds
- **Testing**: BDD with Playwright E2E tests, Vitest for unit tests
- **Real-time Communication**: WebRTC using Pion library
- **AI Integration**: OpenAI Realtime API

### Architecture
Follows Clean Architecture principles with clear separation of concerns:
- **Domain Layer**: Business entities and core logic
- **Application Layer**: Use cases and application services
- **Infrastructure Layer**: External dependencies (database, WebRTC, etc.)
- **Interface Layer**: HTTP handlers and WebSocket connections

### Development Setup

#### Required Commands
- `bun run dev` - Start development servers (frontend + backend)
- `bun run build` - Build both frontend and backend
- `bun run test` - Run all tests (unit + integration)
- `bun run lint` - Run ESLint for code quality
- `bun run type-check` - TypeScript type checking

#### Docker Commands
- `docker buildx bake` - Build all containers using Docker Bake
- `docker buildx bake app` - Build main application container
- `docker buildx bake devcontainer` - Build development container

### Project Structure
```
src/
├── frontend/           # React + TypeScript frontend
├── backend/           # Go backend with clean architecture
│   ├── cmd/          # Application entry points
│   ├── internal/     # Private application code
│   │   ├── domain/   # Business entities and logic
│   │   ├── app/      # Application services
│   │   ├── infra/    # Infrastructure implementations
│   │   └── interfaces/ # HTTP/WebSocket handlers
│   └── configs/      # Configuration files
└── shared/           # Shared types and utilities

environment/
├── docker/           # Docker configurations
├── devcontainer/     # VS Code devcontainer setup
└── k8s/             # Kubernetes manifests

tests/
├── unit/            # Unit tests (Vitest)
├── integration/     # Integration tests (Go)
├── e2e/            # E2E tests (Playwright)
└── bdd/            # BDD scenarios (Jest-Cucumber)
```

### Key Features
1. **WebRTC Integration**: Real-time audio/video communication
2. **Google Meet Participation**: AI agent joins meetings automatically
3. **Requirement Gathering**: Conducts structured consultation conversations
4. **Document Generation**: Automated creation of requirement and specification documents
5. **Diagram Support**: Mermaid and PlantUML diagram generation

### Development Guidelines
- Use Japanese for comments and documentation
- Follow Clean Architecture patterns
- Write comprehensive tests (unit, integration, E2E, BDD)
- Use Docker Bake for containerization
- Maintain type safety with TypeScript/Go type systems

## Important Instructions
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.