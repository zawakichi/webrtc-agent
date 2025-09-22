# Docker Bake configuration for WebRTC Agent
# https://docs.docker.com/build/bake/

variable "REGISTRY" {
  default = "ghcr.io"
}

variable "IMAGE_NAME" {
  default = "zawakichi/webrtc-agent"
}

variable "TAG" {
  default = "latest"
}

variable "BUN_VERSION" {
  default = "1.0"
}

variable "GO_VERSION" {
  default = "1.21"
}

# Groups for building multiple targets
group "default" {
  targets = ["app"]
}

group "all" {
  targets = ["app", "devcontainer"]
}

group "ci" {
  targets = ["app", "test"]
}

# Main application image
target "app" {
  context = "."
  dockerfile = "environment/docker/Dockerfile"

  tags = [
    "${REGISTRY}/${IMAGE_NAME}:${TAG}",
    "${REGISTRY}/${IMAGE_NAME}:latest"
  ]

  args = {
    BUN_VERSION = "${BUN_VERSION}"
    GO_VERSION = "${GO_VERSION}"
  }

  platforms = ["linux/amd64", "linux/arm64"]

  # Build cache
  cache-from = ["type=gha"]
  cache-to = ["type=gha,mode=max"]

  # Labels
  labels = {
    "org.opencontainers.image.title" = "WebRTC System Development Consultation Agent"
    "org.opencontainers.image.description" = "AI agent for system development consultation via WebRTC"
    "org.opencontainers.image.vendor" = "WebRTC Agent Team"
    "org.opencontainers.image.licenses" = "MIT"
    "org.opencontainers.image.source" = "https://github.com/zawakichi/webrtc-agent"
  }
}

# Development container image
target "devcontainer" {
  context = "."
  dockerfile = "environment/devcontainer/Dockerfile"

  tags = [
    "${REGISTRY}/${IMAGE_NAME}:devcontainer",
    "${REGISTRY}/${IMAGE_NAME}:dev-${TAG}"
  ]

  args = {
    BUN_VERSION = "${BUN_VERSION}"
    GO_VERSION = "${GO_VERSION}"
  }

  target = "development"
}

# Test runner image
target "test" {
  inherits = ["app"]

  tags = [
    "${REGISTRY}/${IMAGE_NAME}:test-${TAG}"
  ]

  target = "test"

  args = {
    BUN_VERSION = "${BUN_VERSION}"
    GO_VERSION = "${GO_VERSION}"
    BUILD_ENV = "test"
  }
}

# Production optimized image
target "production" {
  inherits = ["app"]

  tags = [
    "${REGISTRY}/${IMAGE_NAME}:prod-${TAG}",
    "${REGISTRY}/${IMAGE_NAME}:production"
  ]

  target = "production"

  args = {
    NODE_ENV = "production"
    BUN_ENV = "production"
  }
}

# Multi-stage targets for different environments
target "frontend" {
  context = "."
  dockerfile = "environment/docker/Dockerfile.frontend"

  tags = [
    "${REGISTRY}/${IMAGE_NAME}:frontend-${TAG}"
  ]

  args = {
    BUN_VERSION = "${BUN_VERSION}"
  }

  platforms = ["linux/amd64", "linux/arm64"]
}

target "backend" {
  context = "."
  dockerfile = "environment/docker/Dockerfile.backend"

  tags = [
    "${REGISTRY}/${IMAGE_NAME}:backend-${TAG}"
  ]

  args = {
    BUN_VERSION = "${BUN_VERSION}"
    GO_VERSION = "${GO_VERSION}"
  }

  platforms = ["linux/amd64", "linux/arm64"]
}

# Development services composition
target "services" {
  context = "."
  dockerfile = "environment/docker/Dockerfile.services"

  tags = [
    "${REGISTRY}/${IMAGE_NAME}:services-${TAG}"
  ]

  contexts = {
    mysql = "docker-image://mysql:8.0"
    redis = "docker-image://redis:7-alpine"
  }
}