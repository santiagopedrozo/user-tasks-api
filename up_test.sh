echo "🔧 Building containers for DEV..."
docker-compose -f docker-compose-test.yml build

echo "🚀 Starting containers..."
docker-compose -f docker-compose-test.yml up --force-recreate