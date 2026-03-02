#!/usr/bin/env sh

set -e

API_URL="${API_URL:-http://localhost:8080}"

echo "Checking API availability at $API_URL..."

if ! curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/v1/health" | grep -q "200"; then
	echo ""
	echo "Error: API is not running at $API_URL"
	echo ""
	echo "Please start the API server before pushing:"
	echo "  pnpm run dev --filter=api"
	echo ""
	exit 1
fi

echo "API is running. Fetching OpenAPI spec and generating types..."

cd "$(dirname "$0")/../apps/web"
pnpm run types:fetch

echo "Types generated successfully!"
