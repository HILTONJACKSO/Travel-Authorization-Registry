#!/bin/bash
# Sovereign Ledger - VPS Deployment Script (Hostinger / Ubuntu / Debian)
# Run this script on your VPS to deploy the system via Docker Compose.

set -e

echo "==========================================="
echo " Sovereign Ledger - Deployment Bootstrapper"
echo "==========================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo "Docker installed successfully."
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "Docker Compose installed successfully."
fi

# Check for .env file
if [ ! -f ".env" ]; then
    echo "WARNING: .env file not found. Generating a secure one..."
    SECURE_PASS=$(openssl rand -hex 16)
    SECURE_KEY=$(openssl rand -base64 32)
    echo "DB_PASSWORD=$SECURE_PASS" > .env
    echo "SECRET_KEY=$SECURE_KEY" >> .env
    echo "Created .env file with highly secure credentials."
fi

echo "Building and starting the Sovereign Ledger containers..."
docker-compose up --build -d

echo "==========================================="
echo " Deployment Complete!"
echo " The system is now live on port 80."
echo " Access it via your VPS public IP address."
echo " To view logs, run: docker-compose logs -f"
echo "==========================================="
