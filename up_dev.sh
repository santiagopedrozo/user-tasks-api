echo "🔧 Building containers for DEV..."
docker-compose -f docker-compose-dev.yml build

echo "🚀 Starting containers..."
docker-compose -f docker-compose-dev.yml up --force-recreate