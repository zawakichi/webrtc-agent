# Multi-stage build for frontend + backend
FROM oven/bun:1.0-alpine AS frontend-build

WORKDIR /app

# Copy frontend package files
COPY src/frontend/package.json src/frontend/bun.lockb* ./
COPY src/frontend/bunfig.toml src/frontend/tsconfig.json src/frontend/vite.config.ts ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy frontend source
COPY src/frontend ./

# Build frontend
RUN bun run build

# Go backend build stage
FROM golang:1.21-alpine AS backend-build

# Install system dependencies
RUN apk add --no-cache \
    git \
    make \
    gcc \
    musl-dev \
    ca-certificates

WORKDIR /app

# Copy go mod files
COPY src/backend/go.mod src/backend/go.sum ./

# Download dependencies
RUN go mod download && go mod verify

# Copy source code
COPY src/backend ./

# Build the application
RUN CGO_ENABLED=1 GOOS=linux go build -a -installsuffix cgo -o webrtc-agent cmd/webrtc-agent/main.go

# Production stage
FROM alpine:3.18

# Install runtime dependencies
RUN apk add --no-cache \
    ffmpeg \
    nginx \
    ca-certificates \
    curl \
    bash

# Create users
RUN addgroup -g 1001 -S appgroup && \
    adduser -S frontend -u 1001 -G appgroup && \
    adduser -S backend -u 1002 -G appgroup

# Copy built frontend
COPY --from=frontend-build /app/dist /usr/share/nginx/html

# Copy nginx config
COPY environment/docker/nginx.conf /etc/nginx/nginx.conf

# Copy Go backend
WORKDIR /app
COPY --from=backend-build /app/webrtc-agent .
COPY --from=backend-build /app/configs ./configs

# Set ownership
RUN chown -R backend:appgroup /app && \
    chown -R frontend:appgroup /usr/share/nginx/html

# Expose ports
EXPOSE 80 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health && curl -f http://localhost:3001/health || exit 1

# Start both services
COPY environment/docker/start.sh /start.sh
RUN chmod +x /start.sh
CMD ["/start.sh"]