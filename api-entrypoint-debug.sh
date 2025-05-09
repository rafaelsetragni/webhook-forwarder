#!/bin/bash

# -------------------------
# API Entrypoint Script
# -------------------------

echo ""
echo ""
echo "🔍 Extracting version number from package.json..."

# Detect the script location
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Extract version from package.json
export VERSION_NUMBER=$(npm pkg get version | tr -d '"')

if [ -z "$VERSION_NUMBER" ]; then
  echo "❌ Error: Could not extract version number from package.json."
  echo ""
  echo ""
  exit 1
fi

echo "✅ Version detected: $VERSION_NUMBER"

# Build and start only the API service
echo "🐞 Building and starting API version $VERSION_NUMBER for app $APP_NAME (Debug Mode)..."
docker-compose up --build api

# Verify if the API container is running
container_name="$APP_NAME-api"

if [ "$(docker ps --filter "name=$container_name" --filter "status=running" -q)" ]; then
  echo "🎯 API service [$container_name] started successfully."
  echo ""
  echo ""
else
  echo "❌ API service [$container_name] failed to start. Check logs: docker-compose logs api"
  echo ""
  echo ""
  exit 1
fi