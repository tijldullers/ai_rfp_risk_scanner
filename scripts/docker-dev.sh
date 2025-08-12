
#!/bin/bash

# Docker development script for AI RFP Risk Scanner
set -e

echo "🚀 Starting AI RFP Risk Scanner in development mode with Docker..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Build and start the development environment
echo "📦 Building and starting development containers..."
docker-compose -f docker-compose.dev.yml up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 15

# Check if services are running
if docker-compose -f docker-compose.dev.yml ps | grep -q "Up"; then
    echo "✅ Development environment is running successfully!"
    echo ""
    echo "🌐 Application is available at: http://localhost:3000"
    echo "🗄️  PostgreSQL is available at: localhost:5432"
    echo "🔄 Hot reload is enabled for development"
    echo ""
    echo "📋 To view logs: docker-compose -f docker-compose.dev.yml logs -f"
    echo "🛑 To stop: docker-compose -f docker-compose.dev.yml down"
    echo "🔧 To restart: docker-compose -f docker-compose.dev.yml restart"
else
    echo "❌ Some services failed to start. Check logs with: docker-compose -f docker-compose.dev.yml logs"
    exit 1
fi

