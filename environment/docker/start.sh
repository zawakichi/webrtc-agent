#!/bin/bash

# Start script for combined frontend + backend container

set -e

# Function to handle shutdown
shutdown() {
    echo "Shutting down..."
    kill $NGINX_PID $BACKEND_PID 2>/dev/null || true
    wait
    exit 0
}

# Set up signal handlers
trap shutdown SIGTERM SIGINT

# Start nginx in background
echo "Starting nginx..."
nginx -g "daemon off;" &
NGINX_PID=$!

# Wait for nginx to start
sleep 2

# Start Go backend in background
echo "Starting Go backend..."
cd /app
su backend -c "./webrtc-agent" &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

echo "Both services started successfully"
echo "Nginx PID: $NGINX_PID"
echo "Backend PID: $BACKEND_PID"

# Wait for either process to exit
wait -n

# If we get here, one of the processes exited
echo "One of the services exited, shutting down..."
shutdown