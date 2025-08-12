
#!/bin/bash

# Docker startup script for AI RFP Risk Scanner
set -e

echo "🚀 Starting AI RFP Risk Scanner with Docker..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Build and start the application
echo "📦 Building and starting containers..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Services are running successfully!"
    echo ""
    echo "🌐 Application is available at: http://localhost:3000"
    echo "🗄️  PostgreSQL is available at: localhost:5432"
    echo ""
    echo "📋 To view logs: docker-compose logs -f"
    echo "🛑 To stop: docker-compose down"
    echo "🔧 To restart: docker-compose restart"
else
    echo "❌ Some services failed to start. Check logs with: docker-compose logs"
    exit 1
fi

