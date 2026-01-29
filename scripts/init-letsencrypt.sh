#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_DIR/.env"
DATA_PATH="$PROJECT_DIR/certbot"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Parse arguments
STAGING=0
for arg in "$@"; do
    case $arg in
        --staging)
            STAGING=1
            log_warn "Running in staging mode (test certificates)"
            ;;
    esac
done

# Load environment variables
if [ ! -f "$ENV_FILE" ]; then
    log_error ".env file not found at $ENV_FILE"
    log_info "Copy .env.example to .env and fill in the values"
    exit 1
fi

source "$ENV_FILE"

# Validate required variables
if [ -z "$DOMAIN" ]; then
    log_error "DOMAIN is not set in .env"
    exit 1
fi

if [ -z "$CERTBOT_EMAIL" ]; then
    log_error "CERTBOT_EMAIL is not set in .env"
    exit 1
fi

log_info "Domain: $DOMAIN"
log_info "Email: $CERTBOT_EMAIL"

# Check docker compose
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
elif docker-compose version &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
else
    log_error "docker compose is not installed"
    exit 1
fi

log_info "Using: $DOCKER_COMPOSE"

# Create directories
mkdir -p "$DATA_PATH/conf/live/$DOMAIN"
mkdir -p "$DATA_PATH/www"

# Download recommended TLS parameters
if [ ! -e "$DATA_PATH/conf/options-ssl-nginx.conf" ] || [ ! -e "$DATA_PATH/conf/ssl-dhparams.pem" ]; then
    log_info "Downloading recommended TLS parameters..."

    curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf \
        > "$DATA_PATH/conf/options-ssl-nginx.conf"
    curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem \
        > "$DATA_PATH/conf/ssl-dhparams.pem"

    log_info "TLS parameters downloaded"
fi

# Check if certificates already exist
if [ -e "$DATA_PATH/conf/live/$DOMAIN/cert.pem" ]; then
    read -p "Existing certificates found for $DOMAIN. Replace? (y/N) " decision
    if [ "$decision" != "Y" ] && [ "$decision" != "y" ]; then
        log_info "Keeping existing certificates"
        exit 0
    fi
fi

# Create dummy certificate
log_info "Creating dummy certificate for $DOMAIN..."

LIVE_PATH="$DATA_PATH/conf/live/$DOMAIN"

openssl req -x509 -nodes -newkey rsa:4096 -days 1 \
    -keyout "$LIVE_PATH/privkey.pem" \
    -out "$LIVE_PATH/fullchain.pem" \
    -subj "/CN=localhost" 2>/dev/null

log_info "Dummy certificate created"

# Start nginx
log_info "Starting nginx..."
cd "$PROJECT_DIR"
$DOCKER_COMPOSE up --force-recreate -d nginx
log_info "Nginx started"

# Wait for nginx to be ready
log_info "Waiting for nginx to be ready..."
sleep 5

# Delete dummy certificate
log_info "Deleting dummy certificate..."
rm -rf "$LIVE_PATH"

# Request real certificate
log_info "Requesting Let's Encrypt certificate for $DOMAIN..."

STAGING_ARG=""
if [ $STAGING -eq 1 ]; then
    STAGING_ARG="--staging"
fi

$DOCKER_COMPOSE run --rm --entrypoint "certbot" certbot certonly --webroot \
    -w /var/www/certbot \
    $STAGING_ARG \
    --email "$CERTBOT_EMAIL" \
    --agree-tos \
    --no-eff-email \
    --force-renewal \
    -d "$DOMAIN"

# Reload nginx
log_info "Reloading nginx..."
$DOCKER_COMPOSE exec nginx nginx -s reload

log_info "SSL certificate obtained successfully!"
log_info ""
log_info "Next steps:"
log_info "  1. Start all services: $DOCKER_COMPOSE up -d"
log_info "  2. Check HTTPS: https://$DOMAIN"
if [ $STAGING -eq 1 ]; then
    log_warn ""
    log_warn "You used --staging flag. The certificate is not trusted by browsers."
    log_warn "Run without --staging for production certificate."
fi
